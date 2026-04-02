    import {useState, useEffect} from 'react';
    import {useNavigate, Link, Navigate} from 'react-router-dom';
    import api from '../api/axios';
    import type { Receipt, CreateReceiptDTO, CreateItemDTO } from '../types';

    function Receipts() {
        const [receipts, setReceipts] = useState<Receipt[]>([]);
        const [showForm, setShowForm] = useState(false);
        const [storeName, setStoreName] = useState('');
        const [date, setDate] = useState('');
        const [items, setItems] = useState<CreateItemDTO[]>([
            {title: '', price: 0, quantity: 1}
        ]);
        const navigate = useNavigate();
        const [checkedItems, setCheckedItems] = useState<{[key: number]: boolean}>({});
        const [scanning, setScanning] = useState(false);
        
        useEffect(() =>{
            loadReceipts();
        }, []);

        const loadReceipts = async () => {
            try {
                const res = await api.get('/receipt');
                setReceipts(res.data);
            } catch {
                console.error('Failed to load receipts');
            }
        };

        const addItem = () => {
            setItems ([...items, {title: '', price: 0, quantity: 1}]);
        }

        const updateItem = (index: number, field: keyof CreateItemDTO, value: string | number) => {
            const updated = [...items];
            updated[index] = {...updated[index], [field]: value};
            setItems(updated);
        };

        const createReceipt = async() => {
            alert('createReceipt called, date: ' + date + ' items: ' + items.length);
    if(!date || items.length === 0) return;
            if(!date || items.length === 0) return;
            try{
                const dto: CreateReceiptDTO = {storeName, date, items};
                alert('sending request...');
    await api.post('/receipt', dto);
    alert('request succeeded!');
    setShowForm(false);
                setShowForm(false);
                setStoreName('');
                setDate('');
                setItems([{title: '', price: 0, quantity: 1}]);
                loadReceipts();
            } catch (err: any) {
    alert('Error: ' + (err?.response?.data || err?.message || err));
}
        };

        const deleteReceipt = async (id: number) => {
            if (!confirm('Delete this receipt?')) return;
            try {
                await api.delete(`/receipt/${id}`);
                loadReceipts();
            } catch {
                console.error('Failed to delete receipt');
            }
        };

        const logout = () => {
            localStorage.removeItem('token');
            navigate('/login');
        };

        const toggleItem = (id: number) => {
            setCheckedItems(prev => ({
                ...prev,
                [id]: !prev[id]
            }));
        };

        const calculateTotal = (items: Receipt['items']) => {
            return items
                .filter(i => checkedItems[i.id])
                .reduce((sum, i) => sum + i.price * i.quantity, 0)
                .toFixed(2);
        };

        const scanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if(!file) return;

            setScanning(true);
            try {
                const formData = new FormData();
                formData.append('image', file);

                const token = localStorage.getItem('token');
                const res = await fetch('https://192.168.1.185:7133/api/receipt/scan', {
                    method: 'POST',
                    headers: {authorization: `Bearer ${token}`},
                    body: formData
                });

                console.log('Status:', res.status);

                if (!res.ok) {
                    const text = await res.text();
                    console.log('Error response:', text);
                    throw new Error(text);
                }

                
                const data = await res.json();
                setStoreName(data.storeName || '');
                setDate(data.date || '');
                setItems(data.items || []);
                setShowForm(true);
            } catch (err) {
                console.error('Failed to scan receipt', err);
                alert('Scan failed: ' + err);
            } finally {
                setScanning(false);
            } 
        };

        const openSwish = (total: number) => {
        window.location.href = 'swish://';
        
        navigator.clipboard.writeText(total.toString());
        alert(`Total: ${total} SEK — enter this amount in Swish`);
        window.location.href = 'swish://';
        };

        return (
            <div>
                <div>
                    <h1>My receipts</h1>
                    <button onClick={logout}>logout</button>
                </div>
                <button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'cancel' : '+ New Receipt'}
                </button>
                <label style ={{ cursor : 'pointer'}}>
                    <input type="file"
                    accept="image/*"
                    capture="environment"
                    style={{display: 'none'}}
                    onChange={scanReceipt}
                    />
                    <span style={{
                        padding: '8px 16px',
                        background: '#0066cc',
                        color: 'white',
                        borderRadius: '4px',
                        marginLeft: '8px'
                    }}>
                        {scanning ? 'Scanning...' : '📷 Scan Receipt'}
                    </span>
                </label>

                {showForm && (
                    <div>
                        <h3>New Receipt</h3>
                        <input type="text"
                        placeholder='Store name'
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        />
                        <input type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}/>
                        <h4>Items</h4>
                        {items.map((item, index) => (
                            <div key={index}>
                                <input type="text"
                                placeholder='Title'
                                value={item.title}
                                onChange={(e) => updateItem(index, 'title', e.target.value)}
                                />
                                <input type="number"
                                placeholder='Price'
                                value={item.price}
                                onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                                />
                                <input type="number"
                                placeholder='Quantity'
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                />
                            </div>
                        ))}
                        <button onClick={addItem}>+ Add Item</button>
                        <button onClick={createReceipt}>Save Receipt</button>
                    </div>
                )}
                {receipts.map(r => (
                    <div key={r.id}>
                        <h3>{r.storeName || 'Unknown store'} - {r.date.split('T')[0]}</h3>
                        <ul style={{ listStyle: 'none', padding: 0}}>
                            {r.items.map(i => (
                                <li key={i.id}>
                                    <label> 
                                        <input 
                                        type="checkbox"
                                        checked={!!checkedItems[i.id]}
                                        onChange={() => toggleItem(i.id)}
                                        />
                                        {''} {i.title} x{i.quantity} - {i.price} SEK
                                    </label>
                                </li>
                            ))}
                        </ul>
                        <p><strong>Total: {calculateTotal(r.items)}SEK</strong></p>
                        <button 
                            onClick={() => openSwish(parseFloat(calculateTotal(r.items)))}
                            style={{ background: '#5a2d82', color: 'white', marginRight: '8px' }}>
                            💜 Swish {calculateTotal(r.items)} SEK
                        </button>
                        <button onClick={() => deleteReceipt(r.id)}>Delete</button>
                    </div>
                ))}
            </div>
        );
    }

    export default Receipts;
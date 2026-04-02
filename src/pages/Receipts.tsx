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
    <div style={{ padding: '24px 20px', paddingBottom: '40px' }}>
        {/* Header */}
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
        }}>
            <h1 style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '36px',
                fontWeight: '800',
                color: 'var(--black)'
            }}>kvitt</h1>
            <button onClick={logout} style={{
                background: 'var(--grey)',
                color: 'var(--text)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px'
            }}>logout</button>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <button onClick={() => setShowForm(!showForm)} style={{
                flex: 1,
                background: showForm ? 'var(--grey)' : 'var(--black)',
                color: showForm ? 'var(--text)' : 'var(--white)',
                padding: '14px',
                borderRadius: 'var(--radius)',
                fontSize: '14px'
            }}>
                {showForm ? '✕ Cancel' : '+ New Receipt'}
            </button>

            <label style={{ flex: 1 }}>
                <input type="file" accept="image/*" capture="environment"
                    style={{ display: 'none' }} onChange={scanReceipt} />
                <span style={{
                    display: 'block',
                    textAlign: 'center',
                    background: 'var(--green)',
                    color: 'var(--white)',
                    padding: '14px',
                    borderRadius: 'var(--radius)',
                    fontSize: '14px',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: '600',
                    cursor: 'pointer'
                }}>
                    {scanning ? '⏳ Scanning...' : '📷 Scan'}
                </span>
            </label>
        </div>

        {/* Create form */}
        {showForm && (
            <div style={{
                background: 'var(--grey)',
                borderRadius: 'var(--radius)',
                padding: '20px',
                marginBottom: '24px'
            }}>
                <h3 style={{ marginBottom: '16px', fontFamily: 'Syne, sans-serif' }}>New Receipt</h3>
                <input type="text" placeholder="Store name" value={storeName}
                    onChange={(e) => setStoreName(e.target.value)} />
                <input type="date" value={date}
                    onChange={(e) => setDate(e.target.value)} />
                <h4 style={{ margin: '16px 0 12px', fontSize: '13px', color: 'var(--grey-mid)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</h4>
                {items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input type="text" placeholder="Title" value={item.title}
                            onChange={(e) => updateItem(index, 'title', e.target.value)}
                            style={{ flex: 3, marginBottom: 0 }} />
                        <input type="number" placeholder="Price" value={item.price}
                            onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                            style={{ flex: 2, marginBottom: 0 }} />
                        <input type="number" placeholder="Qty" value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            style={{ flex: 1, marginBottom: 0 }} />
                    </div>
                ))}
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button onClick={addItem} style={{
                        flex: 1,
                        background: 'var(--white)',
                        color: 'var(--text)',
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)'
                    }}>+ Item</button>
                    <button onClick={createReceipt} style={{
                        flex: 2,
                        background: 'var(--green)',
                        color: 'var(--white)',
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)'
                    }}>Save Receipt</button>
                </div>
            </div>
        )}

        {/* Receipts list */}
        {receipts.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--grey-mid)', padding: '60px 0' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>🧾</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: '600' }}>No receipts yet</p>
                <p style={{ fontSize: '14px', marginTop: '4px' }}>Scan or add one above</p>
            </div>
        )}

        {receipts.map(r => (
            <div key={r.id} style={{
                background: 'var(--white)',
                border: '2px solid var(--grey)',
                borderRadius: 'var(--radius)',
                padding: '20px',
                marginBottom: '16px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px' }}>
                            {r.storeName || 'Unknown store'}
                        </h3>
                        <p style={{ color: 'var(--grey-mid)', fontSize: '13px', marginTop: '2px' }}>
                            {r.date.split('T')[0]}
                        </p>
                    </div>
                    <button onClick={() => deleteReceipt(r.id)} style={{
                        background: 'none',
                        color: 'var(--grey-mid)',
                        padding: '4px 8px',
                        fontSize: '18px'
                    }}>×</button>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px' }}>
                    {r.items.map(i => (
                        <li key={i.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 0',
                            borderBottom: '1px solid var(--grey)'
                        }}>
                            <input type="checkbox"
                                checked={!!checkedItems[i.id]}
                                onChange={() => toggleItem(i.id)}
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    accentColor: 'var(--green)',
                                    marginRight: '12px',
                                    marginBottom: 0,
                                    display: 'inline-block',
                                    flex: 'none'
                                }}
                            />
                            <span style={{
                                flex: 1,
                                fontSize: '15px',
                                textDecoration: checkedItems[i.id] ? 'line-through' : 'none',
                                color: checkedItems[i.id] ? 'var(--grey-mid)' : 'var(--text)'
                            }}>
                                {i.title} ×{i.quantity}
                            </span>
                            <span style={{ fontWeight: '500', fontSize: '15px' }}>
                                {i.price} kr
                            </span>
                        </li>
                    ))}
                </ul>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <p style={{ fontSize: '12px', color: 'var(--grey-mid)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected total</p>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '700', color: 'var(--green)' }}>
                            {calculateTotal(r.items)} kr
                        </p>
                    </div>
                    <button
                        onClick={() => openSwish(parseFloat(calculateTotal(r.items)))}
                        style={{
                            background: 'var(--black)',
                            color: 'var(--white)',
                            padding: '12px 20px',
                            borderRadius: 'var(--radius)',
                            fontSize: '14px'
                        }}>
                        💜 Swish
                    </button>
                </div>
            </div>
        ))}
    </div>
);
    }

    export default Receipts;
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
        if(!date || items.length === 0) return;
        try{
            const dto: CreateReceiptDTO = {storeName, date, items};
            await api.post('/receipt', dto);
            setShowForm(false);
            setStoreName('');
            setDate('');
            setItems([{title: '', price: 0, quantity: 1}]);
        } catch {
            console.error('Failed to create receipt');
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
    return (
        <div>
            <div>
                <h1>My receipts</h1>
                <button onClick={logout}>logout</button>
            </div>

            <button onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : '+ New Receipt'}
            </button>

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
                    <h3>{storeName || 'Unknown store'} - {r.date.split('T')[0]}</h3>
                    <ul>
                        {r.items.map(i => (
                            <li key={i.id}>{i.title} x{i.quantity} - {i.price} SEK</li>
                        ))}
                    </ul>
                    <button onClick={() => deleteReceipt(r.id)}>Delete</button>
                </div>
            ))}
        </div>
    );
}

export default Receipts;
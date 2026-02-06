import { useState, useEffect } from 'react';
import API_URL from '../../api';

function ManageShop() {
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newName, setNewName] = useState({ brands: '', categories: '' });
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        const bRes = await fetch(`${API_URL}/api/admin/brands`);
        const cRes = await fetch(`${API_URL}/api/admin/categories`);
        setBrands(await bRes.json());
        setCategories(await cRes.json());
    };

    const handleAdd = async (type) => {
        const value = newName[type];
        if (!value) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({ name: value })
            });
            if (res.ok) {
                setNewName({ ...newName, [type]: '' });
                fetchData();
            }
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm("Ta bort?")) return;
        try {
            await fetch(`${API_URL}/api/admin/${type}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': token }
            });
            fetchData();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="container" style={{ marginTop: '80px', maxWidth: '1000px' }}>
            <h1 style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '3px', textAlign: 'center', marginBottom: '60px' }}>STORE SETTINGS</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
                {['brands', 'categories'].map(type => (
                    <div key={type}>
                        <h3 style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '1px', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
                            {type.toUpperCase()}
                        </h3>
                        
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                            <input 
                                type="text" 
                                value={newName[type]} 
                                onChange={e => setNewName({...newName, [type]: e.target.value})} 
                                placeholder={`Add new ${type.slice(0,-1)}...`} 
                                style={inputStyle}
                            />
                            <button onClick={() => handleAdd(type)} style={btnStyle}>ADD</button>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {(type === 'brands' ? brands : categories).map(item => (
                                <li key={item.id} style={listItemStyle}>
                                    <span>{item.name}</span>
                                    <button onClick={() => handleDelete(type, item.id)} style={deleteBtnStyle}>✕</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

const inputStyle = { flex: 1, padding: '10px 0', border: 'none', borderBottom: '1px solid #ccc', outline: 'none', fontSize: '12px' };
const btnStyle = { background: '#000', color: '#fff', border: 'none', padding: '0 20px', fontSize: '10px', fontWeight: '900', cursor: 'pointer' };
const listItemStyle = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f5f5f5', fontSize: '12px', letterSpacing: '0.5px' };
const deleteBtnStyle = { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '10px' };

export default ManageShop;
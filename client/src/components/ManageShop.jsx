import { useState, useEffect } from 'react';

function ManageShop() {
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newName, setNewName] = useState({ brand: '', category: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const bRes = await fetch('http://localhost:5000/api/admin/brands');
            const cRes = await fetch('http://localhost:5000/api/admin/categories');
            setBrands(await bRes.json());
            setCategories(await cRes.json());
        } catch (err) {
            console.error("Kunde inte hämta data:", err);
        }
    };

    const handleAdd = async (type) => {
        const value = type === 'brands' ? newName.brand : newName.category;
        if (!value) return;

        try {
            const res = await fetch(`http://localhost:5000/api/admin/${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token') // Skickar med din admin-token
                },
                body: JSON.stringify({ name: value })
            });

            if (res.ok) {
                setMessage(`Lade till ${value}!`);
                setNewName({ ...newName, [type === 'brands' ? 'brand' : 'category']: '' });
                fetchData(); // Uppdatera listan direkt
                setTimeout(() => setMessage(''), 3000);
            } else {
                const errData = await res.json();
                alert(errData.error || "Något gick fel");
            }
        } catch (err) {
            alert("Serverfel vid sparning");
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '40px auto' }}>
            <h2 style={{ textAlign: 'center' }}>Hantera Shop</h2>
            {message && <div style={{ background: '#d4edda', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>{message}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                
                {/* MÄRKEN */}
                <div className="card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3>Märken</h3>
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                        <input 
                            type="text" 
                            className="form-control"
                            value={newName.brand} 
                            onChange={e => setNewName({...newName, brand: e.target.value})} 
                            placeholder="Nytt märke..." 
                        />
                        <button className="btn btn-primary" onClick={() => handleAdd('brands')}>Lägg till</button>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
                        {brands.map(b => <li key={b.id} style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>{b.name}</li>)}
                    </ul>
                </div>

                {/* KATEGORIER */}
                <div className="card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3>Kategorier</h3>
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                        <input 
                            type="text" 
                            className="form-control"
                            value={newName.category} 
                            onChange={e => setNewName({...newName, category: e.target.value})} 
                            placeholder="Ny kategori..." 
                        />
                        <button className="btn btn-primary" onClick={() => handleAdd('categories')}>Lägg till</button>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
                        {categories.map(c => <li key={c.id} style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>{c.name}</li>)}
                    </ul>
                </div>

            </div>
        </div>
    );
}

export default ManageShop;
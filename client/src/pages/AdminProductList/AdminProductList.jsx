import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminProductList.css';
import API_URL from '../../api';

function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error("Kunde inte hämta produkter:", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Radera produkt?")) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      if (res.ok) setProducts(products.filter(p => p.id !== id));
    } catch (err) { console.error(err); }
  };

  // Hjälpfunktion för att räkna ut totalt lager från inventory-objektet
  const getTotalStock = (inventory) => {
    if (!inventory) return 0;
    return Object.values(inventory).reduce((a, b) => a + Number(b), 0);
  };

  if (loading) return <div className="container">Laddar...</div>;

  return (
    <div className="container" style={{ marginTop: '80px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
        <div>
          <h1 style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '3px', margin: 0 }}>INVENTORY MANAGEMENT</h1>
          <p style={{ color: '#999', fontSize: '11px', marginTop: '5px' }}>TOTAL: {products.length} MODELS</p>
        </div>
        <Link to="/admin/add-product" style={addBtnStyle}>+ ADD NEW PRODUCT</Link>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={tableHeadStyle}>
              <th style={{ textAlign: 'left', padding: '15px 0' }}>PRODUCT</th>
              <th>PRICE</th>
              <th>CATEGORY / BRAND</th>
              <th>STOCK STATUS</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const totalStock = getTotalStock(p.inventory);
              return (
                <tr key={p.id} style={rowStyle}>
                  <td style={{ padding: '20px 0', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <img
                      src={p.imageUrl || 'https://placehold.co/400x500/EEE/999?text=No+Image'}
                      alt=""
                      style={thumbStyle}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x500/EEE/999?text=No+Image';
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '12px' }}>{p.name.toUpperCase()}</div>
                      <div style={{ fontSize: '10px', color: '#bbb' }}>ID: #{p.id}</div>
                    </div>
                  </td>
                  <td style={{ fontSize: '12px' }}>
                    {p.discountPrice ? (
                      <span style={{ color: '#e74c3c', fontWeight: '800' }}>{p.discountPrice} SEK</span>
                    ) : <span>{p.price} SEK</span>}
                  </td>
                  <td style={{ fontSize: '11px', color: '#666' }}>
                    {p.Category?.name || 'No Cat'} / {p.Brand?.name || 'No Brand'}
                  </td>
                  <td>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: totalStock === 0 ? '#ff4d4d' : '#2ecc71' }}>
                      {totalStock} UNITS IN STOCK
                    </div>
                    <div style={{ fontSize: '9px', color: '#aaa' }}>
                      {Object.entries(p.inventory || {}).map(([size, val]) => `${size}:${val}`).join(' ')}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/admin/edit-product/${p.id}`} style={actionBtnStyle}>EDIT</Link>
                    <button onClick={() => handleDelete(p.id)} style={{ ...actionBtnStyle, color: '#ff4d4d' }}>DELETE</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Styles
const addBtnStyle = { backgroundColor: '#000', color: '#fff', padding: '12px 25px', fontSize: '10px', fontWeight: '900', textDecoration: 'none', letterSpacing: '1px' };
const tableHeadStyle = { fontSize: '10px', color: '#aaa', borderBottom: '2px solid #000', textAlign: 'left', letterSpacing: '1px' };
const rowStyle = { borderBottom: '1px solid #eee' };
const thumbStyle = { width: '50px', height: '65px', objectFit: 'cover', backgroundColor: '#f5f5f5' };
const actionBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: '900', marginLeft: '15px', textDecoration: 'none', color: '#000' };

export default AdminProductList;
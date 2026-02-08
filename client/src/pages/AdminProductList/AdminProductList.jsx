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

  const getTotalStock = (variants) => {
    if (!variants || !Array.isArray(variants)) return 0;
    return variants.reduce((sum, v) => sum + Number(v.stock), 0);
  };

  const getStockStatusClass = (total) => {
    if (total === 0) return 'stock-out';
    if (total < 10) return 'stock-low';
    return 'stock-ok';
  };

  if (loading) return <div className="container">Laddar...</div>;

  return (
    <div className="container" style={{ marginTop: '80px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '2px', margin: 0 }}>INVENTORY</h1>
          <p style={{ color: '#999', fontSize: '12px' }}>{products.length} MODELS IN CATALOG</p>
        </div>
        <Link to="/admin/add-product" className="action-btn" style={{ backgroundColor: '#000', color: '#fff', textDecoration: 'none', padding: '10px 20px' }}>
          + ADD PRODUCT
        </Link>
      </div>

      <div className="admin-list-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Product Details</th>
              <th>Price</th>
              <th>Category / Brand</th>
              <th>Stock Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const variants = p.variants || [];
              const totalStock = getTotalStock(variants);

              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img
                        src={p.imageUrl?.startsWith('http') ? p.imageUrl : `${API_URL}${p.imageUrl}`}
                        alt={p.name}
                        className="admin-prod-img"
                        onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Missing'; }}
                      />
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '13px' }}>{p.name.toUpperCase()}</div>
                        <div style={{ fontSize: '10px', color: '#999' }}>REF: #{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600' }}>
                      {p.discountPrice ? (
                        <>
                          <span style={{ color: '#dc3545' }}>{p.discountPrice} kr</span>
                          <div style={{ fontSize: '10px', textDecoration: 'line-through', color: '#aaa' }}>{p.price} kr</div>
                        </>
                      ) : (
                        <span>{p.price} kr</span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '12px', color: '#555' }}>
                    {p.Category?.name || '—'} / {p.Brand?.name || '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`stock-badge ${getStockStatusClass(totalStock)}`}>
                      {totalStock} UNIT{totalStock !== 1 ? 'S' : ''}
                    </span>
                    <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
                      {variants.map(v => `${v.size}:${v.stock}`).join(' | ')}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/admin/edit-product/${p.id}`} className="action-btn btn-edit" style={{ textDecoration: 'none' }}>
                      EDIT
                    </Link>
                    <button onClick={() => handleDelete(p.id)} className="action-btn btn-delete">
                      DELETE
                    </button>
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

export default AdminProductList;
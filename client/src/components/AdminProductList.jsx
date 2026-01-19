import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminProductList.css';

function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error("Kunde inte hämta produkter:", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Är du säker på att du vill radera denna produkt? Det går inte att ångra.")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert("Kunde inte radera produkten. Kontrollera admin-behörighet.");
      }
    } catch (err) {
      console.error("Fel vid radering:", err);
    }
  };

  if (loading) return <div className="container">Laddar lagerlista...</div>;

  return (
    <div className="container" style={{ maxWidth: '1200px', marginTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Lagerhantering</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Hantera priser, lagerstatus och rea för hela sortimentet.</p>
        </div>
        <Link to="/admin/add-product" className="reg-btn-primary" style={{ width: 'auto', padding: '12px 25px', textDecoration: 'none' }}>
          + Lägg till produkt
        </Link>
      </div>

      <div className="admin-list-container" style={{ background: '#fff', borderRadius: '15px', padding: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f0f0f0' }}>
              <th style={{ padding: '15px' }}>Produkt</th>
              <th>Pris (Ord/Rea)</th>
              <th>Status</th>
              <th>Lager</th>
              <th style={{ textAlign: 'right', paddingRight: '20px' }}>Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              // Dynamisk lagerstatus
              let stockStatus = { label: 'I lager', class: 'stock-ok' };
              if (p.stock === 0) stockStatus = { label: 'Slut', class: 'stock-out' };
              else if (p.stock < 10) stockStatus = { label: 'Få kvar', class: 'stock-low' };

              return (
                <tr key={p.id} className="admin-tr" style={{ borderBottom: '1px solid #f9f9f9' }}>
                  <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img 
                      src={p.imageUrl} 
                      alt="" 
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} 
                      onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                    />
                    <div>
                      <div style={{ fontWeight: '600' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#999' }}>ID: #{p.id}</div>
                    </div>
                  </td>
                  
                  <td>
                    {p.discountPrice ? (
                      <div>
                        <span style={{ textDecoration: 'line-through', color: '#bbb', fontSize: '0.85rem' }}>{p.price} kr</span><br />
                        <span style={{ color: '#ff4d4d', fontWeight: '700' }}>{p.discountPrice} kr</span>
                      </div>
                    ) : (
                      <span style={{ fontWeight: '600' }}>{p.price} kr</span>
                    )}
                  </td>

                  <td>
                    <span className={`stock-badge ${stockStatus.class}`}>
                      {stockStatus.label}
                    </span>
                  </td>

                  <td>
                    <strong style={{ color: p.stock === 0 ? '#ff4d4d' : '#333' }}>{p.stock} st</strong>
                  </td>

                  <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                    <Link 
                      to={`/admin/edit-product/${p.id}`} 
                      className="action-btn btn-edit"
                      style={{ textDecoration: 'none', display: 'inline-block' }}
                    >
                      Ändra
                    </Link>
                    <button 
                      onClick={() => handleDelete(p.id)} 
                      className="action-btn btn-delete"
                    >
                      Radera
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {products.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            Inga produkter hittades i databasen.
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProductList;
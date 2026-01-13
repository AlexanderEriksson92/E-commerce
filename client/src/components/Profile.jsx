import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [favProducts, setFavProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || !userId) {
      setError('Du måste vara inloggad för att se din profil.');
      return;
    }

    // 1. Hämta profilinformation
    fetch('http://localhost:5000/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setUserData(data))
    .catch(() => setError('Kunde inte hämta profil.'));

    // 2. Hämta favoritprodukter (Hjärtan)
    fetch(`http://localhost:5000/api/auth/favorites/details/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setFavProducts(data))
    .catch(err => console.error("Favoritfel:", err));

    // 3. Hämta orderhistorik
    fetch(`http://localhost:5000/api/auth/orders/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (!data.error) setOrders(data);
    })
    .catch(err => console.error("Orderfel:", err));
  }, [userId, token]);

  const handleRemoveFavorite = async (productId) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, userId })
      });
      if (response.ok) {
        setFavProducts(favProducts.filter(p => p.id !== productId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (error) return <div className="container"><p style={{ color: 'red', textAlign: 'center' }}>{error}</p></div>;
  if (!userData) return <div className="container"><p style={{ textAlign: 'center' }}>Laddar profil...</p></div>;

  return (
    <div className="container">
      <div className="form-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>👤 Min Profil</h2>
        
        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #eee' }}>
          <p><strong>Namn:</strong> {userData.firstName} {userData.lastName}</p>
          <p><strong>E-post:</strong> {userData.email}</p>
          <p><strong>Användarnamn:</strong> {userData.username}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* SEKTION: FAVORITER */}
          <section>
            <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>❤️ Mina Favoriter ({favProducts.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
              {favProducts.length > 0 ? favProducts.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #eee', padding: '10px', borderRadius: '8px', background: '#fff' }}>
                  <img src={p.imageUrl} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} alt="" />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{p.name}</p>
                    <Link to={`/product/${p.id}`} style={{ fontSize: '12px', color: '#007bff' }}>Visa</Link>
                  </div>
                  <button onClick={() => handleRemoveFavorite(p.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>❌</button>
                </div>
              )) : <p style={{ color: '#999' }}>Inga favoriter sparade.</p>}
            </div>
          </section>

          {/* SEKTION: ORDERHISTORIK */}
          <section>
            <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>📦 Orderhistorik ({orders.length})</h3>
            <div style={{ marginTop: '15px' }}>
              {orders.length > 0 ? orders.map(order => (
                <div key={order.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                    <span>Order #{order.id}</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ margin: '10px 0', padding: '5px 0', borderTop: '1px solid #fafafa' }}>
                    {order.OrderItems?.map((item, idx) => (
                      <div key={idx} style={{ fontSize: '12px', color: '#555', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.Product?.name || 'Produkt'}</span>
                        <span>{item.priceAtPurchase} kr</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'right', color: '#28a745', fontWeight: 'bold', borderTop: '1px solid #eee', paddingTop: '5px' }}>
                    Totalt: {order.totalAmount} kr
                  </div>
                </div>
              )) : <p style={{ color: '#999' }}>Inga tidigare beställningar.</p>}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default Profile;
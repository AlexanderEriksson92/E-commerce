import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    const fetchProfileData = async () => {
      try {
        const [userRes, orderRes, favRes] = await Promise.all([
          fetch('http://localhost:5000/api/auth/profile', { 
            headers: { 'Authorization': `Bearer ${token}` } 
          }),
          fetch(`http://localhost:5000/api/auth/orders/${userId}`),
          fetch(`http://localhost:5000/api/auth/favorites/details/${userId}`)
        ]);

        const userData = await userRes.json();
        const orderData = await orderRes.json();
        const favData = await favRes.json();

        setUser(userData);
        setOrders(orderData);
        setFavorites(favData);
        setLoading(false);
      } catch (err) {
        console.error("Kunde inte ladda profildata", err);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [token, navigate, userId]);

  if (loading) return <div className="profile-loading">Laddar din profil...</div>;

  return (
    <div className="profile-container">
      {/* 1. HEADER (Högst upp) */}
      <header className="profile-header-section">
        <h1>Välkommen, {user?.firstName}!</h1>
        <p>Här kan du hantera dina beställningar och se dina personuppgifter.</p>
      </header>

      {/* 2. STATS-GRID (På en rad under headern) */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📦</span>
          <div className="stat-val">{orders.length}</div>
          <div className="stat-label">Beställningar</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/favorites')} style={{ cursor: 'pointer' }}>
          <span className="stat-icon">❤️</span>
          <div className="stat-val">{favorites.length}</div>
          <div className="stat-label">Favoriter</div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🛡️</span>
          <div className="stat-val">{user?.isAdmin ? 'Admin' : 'Medlem'}</div>
          <div className="stat-label">Kontotyp</div>
        </div>
      </div>

      {/* 3. MAIN GRID (Under stats: Info till vänster, Ordrar till höger) */}
      <div className="profile-main-grid">
        
        {/* VÄNSTER KOLUMN */}
        <aside className="profile-sidebar">
          <div className="profile-card">
            <h3>Personuppgifter</h3>
            <div className="info-row">
              <strong>Namn:</strong> {user?.firstName} {user?.lastName}
            </div>
            <div className="info-row">
              <strong>E-post:</strong> {user?.email}
            </div>
            <hr className="divider" />
            <button className="btn btn-outline" onClick={() => alert("Funktion för lösenordsbyte kommer snart!")}>
              Ändra lösenord
            </button>
          </div>
        </aside>

        {/* HÖGER KOLUMN */}
        <section className="profile-content">
          <div className="section-header">
            <h3>Senaste ordrar</h3>
            <Link to="/products" className="view-all-link">Shoppa mer</Link>
          </div>
          
          {orders.length > 0 ? (
            orders.slice(0, 3).map(order => (
              <div key={order.id} className="order-mini-card">
                <div className="order-info">
                  <strong>Order #{order.id}</strong>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="order-price">{order.totalAmount} kr</div>
              </div>
            ))
          ) : (
            <div className="empty-state-box">Du har inte gjort några beställningar än.</div>
          )}

          <div className="section-header" style={{ marginTop: '30px' }}>
            <h3>Dina favoriter</h3>
          </div>
          <div className="fav-mini-list">
            {favorites.slice(0, 4).map(fav => (
              <img 
                key={fav.id} 
                src={fav.imageUrl || fav.image_url || `http://localhost:5000${fav.imageUrl}`} 
                alt={fav.name} 
                className="mini-fav-img" 
              />
            ))}
            {favorites.length > 4 && <div className="more-favs">+{favorites.length - 4}</div>}
            {favorites.length === 0 && <p className="empty-text">Inga sparade favoriter.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Profile;
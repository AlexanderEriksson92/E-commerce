import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Favorites.css';
function Favorites({ onAddToCart }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/auth/favorites/details/${userId}`)
      .then(res => res.json())
      .then(data => {
        setFavorites(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Kunde inte hämta favoriter:", err);
        setLoading(false);
      });
  }, [userId]);

  // Om användaren inte är inloggad
  if (!userId) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Mina Favoriter ♡</h2>
        <p>Du måste vara inloggad för att se dina sparade favoriter.</p>
        <button 
          onClick={() => navigate('/login')} 
          className="btn btn-primary"
          style={{ marginTop: '20px' }}
        >
          Gå till Inloggning
        </button>
      </div>
    );
  }

  if (loading) return <p style={{ textAlign: 'center' }}>Laddar dina favoriter...</p>;

  return (
    <div className="container">
      <h2 style={{ textAlign: 'center', margin: '30px 0' }}>Mina Favoriter ♡</h2>
      
      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <p>Du har inga sparade favoriter än.</p>
          <Link to="/products" className="btn btn-secondary">Utforska sortimentet</Link>
        </div>
      ) : (
        <div className="product-grid">
          {favorites.map(product => (
            <div key={product.id} className="product-card">
              <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <img 
                  src={product.imageUrl?.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} 
                  alt={product.name} 
                  onError={(e) => { e.target.src = 'https://placehold.co/250x200?text=Bild+saknas'; }}
                />
                <h3>{product.name}</h3>
                <p className="price">{product.price} kr</p>
              </Link>
              <button 
                className="btn btn-primary btn-block" 
                onClick={() => onAddToCart(product)}
              >
                Lägg i varukorg
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
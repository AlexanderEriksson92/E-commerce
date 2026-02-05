import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Favorites.css';
import API_URL from '../../api';

function Favorites({ onAddToCart }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({}); 
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetch(`http://${API_URL}/api/auth/favorites/details/${userId}`)
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

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  if (!userId) {
    return (
      <div className="container" style={{ textAlign: 'center' }}>
        <h2>Mina Favoriter ♡</h2>
        <p>Du måste vara inloggad för att se dina sparade favoriter.</p>
        <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ marginTop: '20px' }}>
          Gå till Inloggning
        </button>
      </div>
    );
  }

  if (loading) return <p style={{ textAlign: 'center', padding: '50px' }}>Laddar dina favoriter...</p>;

  return (
    <div className="container">
      <h2 style={{ textAlign: 'center' }}>Mina Favoriter ♡</h2>
      
      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <p>Du har inga sparade favoriter än.</p>
          <Link to="/products" className="btn btn-secondary">Utforska sortimentet</Link>
        </div>
      ) : (
        <div className="product-grid">
          {favorites.map(product => {
            const currentSize = selectedSizes[product.id];
            
            return (
              <div key={product.id} className="product-card">
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <img 
                    src={product.imageUrl?.startsWith('http') ? product.imageUrl : `http://${API_URL}${product.imageUrl}`} 
                    alt={product.name} 
                    onError={(e) => { e.target.src = 'https://placehold.co/250x200?text=Bild+saknas'; }}
                  />
                  <h3>{product.name}</h3>
                  <p className="price">{product.price} kr</p>
                </Link>

                {/* NY SEKTION FÖR STORLEKAR - Använder dina stilar nedan */}
                <div className="size-selector-mini">
                  {product.variants && product.variants.length > 0 ? (
                    <div className="mini-size-grid">
                      {product.variants.map(v => (
                        <button
                          key={v.id}
                          disabled={v.stock <= 0}
                          className={`mini-size-btn ${currentSize === v.size ? 'active' : ''}`}
                          onClick={() => handleSizeSelect(product.id, v.size)}
                        >
                          {v.size}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: '#ff4d4d' }}>Slut i lager</p>
                  )}
                </div>

                <button 
                  className="btn btn-primary btn-block" 
                  disabled={!currentSize}
                  onClick={() => onAddToCart(product, currentSize)}
                >
                  {currentSize ? 'LÄGG I VARUKORG' : 'VÄLJ STORLEK'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Favorites;
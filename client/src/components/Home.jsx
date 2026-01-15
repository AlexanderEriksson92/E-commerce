import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Home({ refreshFavorites }) {
  const [latestProducts, setLatestProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        // Nyheter (de senaste id:n)
        setLatestProducts([...data].sort((a, b) => b.id - a.id).slice(0, 8));
        // Populära (här sorterat på pris som exempel)
        setPopularProducts([...data].sort((a, b) => b.price - a.price).slice(0, 8));
      })
      .catch(err => console.error("Kunde inte hämta produkter:", err));

    if (userId) {
      fetch(`http://localhost:5000/api/auth/favorites/details/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setFavorites(data.map(f => f.id));
        });
    }
  }, [userId]);

  const toggleFavorite = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation(); // Hindrar navigering till produktsidan
    if (!userId) return alert("Logga in först för att spara favoriter!");
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, userId })
      });
      if (res.ok) {
        setFavorites(prev => 
          prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
        refreshFavorites(); // Uppdaterar räknaren i Navbaren
      }
    } catch (err) {
      console.error(err);
    }
  };

  const ProductSlider = ({ title, products }) => {
    const sliderRef = useRef(null);

    const scroll = (dir) => {
      if (sliderRef.current) {
        const amt = dir === 'left' ? -350 : 350;
        sliderRef.current.scrollBy({ left: amt, behavior: 'smooth' });
      }
    };

    return (
      <div className="slider-section" style={{ marginBottom: '50px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>{title}</h2>
        <div className="slider-wrapper-new" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          
          <button className="arrow-btn left" onClick={(e) => { e.stopPropagation(); scroll('left'); }}>&#10094;</button>
          
          <div className="slider-scroll-container" ref={sliderRef} style={{ display: 'flex', overflowX: 'auto', gap: '20px', padding: '10px 5px', scrollbarWidth: 'none' }}>
            {products.map(p => (
              <div 
                key={p.id} 
                className="product-card-new" 
                onClick={() => navigate(`/product/${p.id}`)}
                style={{ minWidth: '260px', background: 'white', borderRadius: '12px', cursor: 'pointer', position: 'relative', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              >
                <button 
                  onClick={(e) => toggleFavorite(e, p.id)} 
                  className="fav-heart"
                  style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'white', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                >
                  {favorites.includes(p.id) ? '❤️' : '🤍'}
                </button>
                
                <img 
                  src={p.imageUrl?.startsWith('http') ? p.imageUrl : `http://localhost:5000${p.imageUrl}`} 
                  alt={p.name} 
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
                />
                
                <div style={{ padding: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>{p.name}</h3>
                  <p style={{ color: '#28a745', fontWeight: 'bold', marginTop: '5px' }}>{p.price} kr</p>
                </div>
              </div>
            ))}
          </div>

          <button className="arrow-btn right" onClick={(e) => { e.stopPropagation(); scroll('right'); }}>&#10095;</button>
        </div>
      </div>
    );
  };

  return (
    <div className="home-page-container">
      <header className="hero-banner">
        <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>Välkommen till Shoppen</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Upptäck säsongens hetaste nyheter</p>
        <button onClick={() => navigate('/products')} className="hero-btn">
          Utforska sortimentet
        </button>
      </header>

      <div className="home-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <ProductSlider title="🆕 Senaste Nyheterna" products={latestProducts} />
        <ProductSlider title="🔥 Mest Populära" products={popularProducts} />
      </div>
    </div>
  );
}

export default Home;
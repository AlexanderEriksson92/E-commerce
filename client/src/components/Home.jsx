import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
        setLatestProducts([...data].sort((a, b) => b.id - a.id).slice(0, 8));
        setPopularProducts([...data].sort((a, b) => (b.price - (b.discountPrice || b.price)) - (a.price - (a.discountPrice || a.price))).slice(0, 8));
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
    e.stopPropagation();
    if (!userId) return alert("Logga in först!");
    try {
      const res = await fetch('http://localhost:5000/api/auth/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, userId })
      });
      if (res.ok) {
        setFavorites(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
        if (refreshFavorites) refreshFavorites();
      }
    } catch (err) { console.error(err); }
  };

  const ProductSlider = ({ title, products }) => {
    const sliderRef = useRef(null);
    const scroll = (dir) => {
      if (sliderRef.current) {
        const amt = dir === 'left' ? -400 : 400;
        sliderRef.current.scrollBy({ left: amt, behavior: 'smooth' });
      }
    };

    return (
      <div className="slider-section" style={{ marginBottom: '60px', position: 'relative' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '20px', color: '#1a1a1a', textTransform: 'uppercase' }}>{title}</h2>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button onClick={() => scroll('left')} style={arrowButtonStyle}>&#10094;</button>
          <div className="slider-scroll-container" ref={sliderRef} style={sliderContainerStyle}>
            <style>{`.slider-scroll-container::-webkit-scrollbar { display: none; }`}</style>
            {products.map(p => (
              <div key={p.id} className="product-card-new" onClick={() => navigate(`/product/${p.id}`)} style={productCardStyle}>
                {p.discountPrice && <div style={saleBadgeStyle}>REA</div>}
                <button onClick={(e) => toggleFavorite(e, p.id)} style={favButtonStyle}>{favorites.includes(p.id) ? '❤️' : '🤍'}</button>
                <img 
                  src={p.imageUrl?.startsWith('http') ? p.imageUrl : `http://localhost:5000${p.imageUrl}`} 
                  alt={p.name} 
                  style={{ width: '100%', height: '280px', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://placehold.co/400x500?text=Image+Coming+Soon'; }}
                />
                <div style={{ padding: '20px' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '600' }}>{p.name}</h3>
                  {p.discountPrice ? (
                    <div>
                      <span style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '1.2rem', marginRight: '10px' }}>{p.discountPrice} kr</span>
                      <span style={{ textDecoration: 'line-through', color: '#999' }}>{p.price} kr</span>
                    </div>
                  ) : (
                    <p style={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: '1.2rem', margin: 0 }}>{p.price} kr</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => scroll('right')} style={{...arrowButtonStyle, right: '-25px'}}>&#10095;</button>
        </div>
      </div>
    );
  };

  return (
    <div className="home-page-container">
      {/* HERO SECTION - Återställd till din originalbild */}
      <header className="hero-banner" style={heroStyle}>
        <h1 style={{ fontSize: '4.5rem', fontWeight: '900', marginBottom: '10px' }}>NEW ARRIVALS</h1>
        <p style={{ fontSize: '1.4rem', marginBottom: '30px', color: '#ffffff' }}>Upplev årets mest eftertraktade kollektion</p>
        <button onClick={() => navigate('/products')} style={heroButtonStyle}>HANDLA NU</button>
      </header>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* SEKTION: NYA GENDER CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', margin: '80px 0' }}>
          {/* MÄN - Ny bild */}
          <div onClick={() => navigate('/products')} style={{ ...categoryCardStyle, backgroundImage: `url('https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')` }}>
            <div style={categoryOverlayStyle}>
              <h3 style={categoryTextStyle}>MEN</h3>
              <span style={categoryLinkStyle}>SHOP NOW</span>
            </div>
          </div>
          {/* KVINNOR - Ny bild */}
          <div onClick={() => navigate('/products')} style={{ ...categoryCardStyle, backgroundImage: `url('https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')` }}>
            <div style={categoryOverlayStyle}>
              <h3 style={categoryTextStyle}>WOMEN</h3>
              <span style={categoryLinkStyle}>SHOP NOW</span>
            </div>
          </div>
        </div>

        <ProductSlider title="Senaste Nyheterna" products={latestProducts} />
        
        {/* MEMBER SECTION */}
        <div style={memberSectionStyle}>
          <h2 style={{ fontSize: '3.5rem', marginBottom: '15px', fontWeight: '900', color:'#f1c40f' }}>MEDLEMSREA <span style={{ color: '#f1c40f' }}>-20%</span></h2>
          <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '40px' }}>Bli medlem idag och få exklusiv tillgång till våra bästa priser.</p>
          <button style={memberButtonStyle}>BLI MEDLEM NU</button>
        </div>

        <ProductSlider title="Bästa Priserna" products={popularProducts} />
      </div>

      {/* FOOTER SECTION */}
      <footer style={footerStyle}>
        <div style={footerBenefitsGrid}>
           <div style={footerBenefitItem}><span>🚚</span><br/><b>Fast Delivery</b><br/><small>1-3 Business days</small></div>
           <div style={footerBenefitItem}><span>🔒</span><br/><b>Secure Payment</b><br/><small>PCI Compliant</small></div>
           <div style={footerBenefitItem}><span>♻️</span><br/><b>Sustainable</b><br/><small>Eco-friendly materials</small></div>
           <div style={footerBenefitItem}><span>⭐</span><br/><b>Top Rated</b><br/><small>4.9/5 Customer score</small></div>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #333', margin: '40px 0' }} />

        <div style={footerMainContent}>
          <div style={{ flex: '2' }}>
            <h2 style={{ fontWeight: '900', letterSpacing: '2px', marginBottom: '20px', color: '#888888' }}>TRENDNODE</h2>
            <p style={{ color: '#888', maxWidth: '300px' }}>Elevating your everyday style with curated streetwear since 2024.</p>
          </div>
          <div style={{ flex: '1' }}>
            <h5 style={footerHeading}>SHOP</h5>
            <Link to="/products" style={footerLink}>All Products</Link>
            <Link to="/products" style={footerLink}>Men's Collection</Link>
            <Link to="/products" style={footerLink}>Women's Collection</Link>
          </div>
          <div style={{ flex: '1' }}>
            <h5 style={footerHeading}>SUPPORT</h5>
            <span style={footerLink}>Contact Us</span>
            <span style={footerLink}>Shipping Policy</span>
            <span style={footerLink}>Returns</span>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '60px', color: '#555', fontSize: '0.8rem' }}>
          © 2026 TRENDNODE AB. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
}

// --- STYLES ---
const heroStyle = {
  height: '70vh',
  background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg")',
  backgroundSize: 'cover', backgroundPosition: 'center',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center'
};

const heroButtonStyle = {
  padding: '18px 45px', fontSize: '1.1rem', backgroundColor: '#ffffff', color: '#1a1a1a',
  border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
};

const categoryCardStyle = {
  height: '550px', borderRadius: '12px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
  backgroundSize: 'cover', backgroundPosition: 'center'
};

const categoryOverlayStyle = {
  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
};

const categoryTextStyle = { color: 'white', fontSize: '3.5rem', fontWeight: '900', letterSpacing: '6px', margin: 0 };
const categoryLinkStyle = { color: 'white', marginTop: '15px', fontWeight: '700', borderBottom: '2px solid white', paddingBottom: '3px' };

const footerStyle = { backgroundColor: '#000', color: '#fff', padding: '80px 40px 40px' };
const footerBenefitsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'center' };
const footerBenefitItem = { fontSize: '0.9rem', color: '#ccc', lineHeight: '1.6' };
const footerMainContent = { display: 'flex', flexWrap: 'wrap', gap: '40px', maxWidth: '1300px', margin: '0 auto' };
const footerHeading = { fontWeight: 'bold', marginBottom: '20px', fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase' };
const footerLink = { display: 'block', color: '#888', textDecoration: 'none', marginBottom: '10px', fontSize: '0.9rem', cursor: 'pointer' };

const arrowButtonStyle = { position: 'absolute', left: '-25px', zIndex: 20, width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'white', border: '1px solid #ddd', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const sliderContainerStyle = { display: 'flex', overflowX: 'auto', gap: '25px', padding: '15px 5px', scrollbarWidth: 'none', msOverflowStyle: 'none', scrollSnapType: 'x mandatory' };
const productCardStyle = { minWidth: '320px', background: 'white', borderRadius: '8px', cursor: 'pointer', position: 'relative', scrollSnapAlign: 'start', overflow: 'hidden' };
const saleBadgeStyle = { position: 'absolute', top: '15px', left: '15px', zIndex: 5, backgroundColor: '#e74c3c', color: 'white', padding: '4px 10px', fontWeight: 'bold', fontSize: '11px', borderRadius: '4px' };
const favButtonStyle = { position: 'absolute', top: '15px', right: '15px', zIndex: 10, background: 'white', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' };
const memberSectionStyle = { backgroundColor: '#303030', color: '#fff', padding: '100px 40px', borderRadius: '12px', textAlign: 'center', margin: '100px 0' };
const memberButtonStyle = { backgroundColor: '#f1c40f', color: '#000', padding: '15px 40px', borderRadius: '4px', border: 'none', fontWeight: '900', cursor: 'pointer' };

export default Home;
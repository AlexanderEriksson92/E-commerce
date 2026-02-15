import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import API_URL from '../../api';

function Home() {
  const [latestProducts, setLatestProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [showMemberPopup, setShowMemberPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setShowMemberPopup(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setLatestProducts([...data].sort((a, b) => b.id - a.id).slice(0, 8));
        setPopularProducts([...data].sort((a, b) => (b.price - (b.discountPrice || b.price)) - (a.price - (a.discountPrice || a.price))).slice(0, 8));
      })
      .catch(err => console.error("Fetch error:", err));
  }, []);

  const getImg = (url) => {
    if (!url || url === "" || url === "null" || url === "undefined") {
      return 'https://placehold.co/400x500/EEE/999?text=Image+Missing';
    }
    return url.startsWith('http') ? url : `http://${API_URL}${url}`;
  };

  const ProductSlider = ({ title, products, bgColor }) => {
    const sliderRef = useRef(null);
    const scroll = (dir) => {
      if (sliderRef.current) {
        sliderRef.current.scrollBy({ left: dir === 'left' ? -350 : 350, behavior: 'smooth' });
      }
    };

    return (
      <div className="slider-outer-wrapper" style={{ backgroundColor: bgColor }}>
        <div className="container-fixed">
          <h2 className="slider-section-title">{title}</h2>
          <div className="slider-relative-container">
            <button className="nav-arrow left" onClick={() => scroll('left')}>&#10094;</button>
            <div className="slider-scroll-box" ref={sliderRef}>
              {products.map(p => (
                <div key={p.id} className="product-card-new" onClick={() => navigate(`/product/${p.id}`)}>
                  <div className="product-img-container">
                    <img
                      src={getImg(p.imageUrl)}
                      alt={p.name}
                      className="product-img-slide"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        objectPosition: 'center' 
                      }}
                      onError={(e) => { e.target.src = 'https://placehold.co/400x500/EEE/999?text=Error+Loading'; }}
                    />
                  </div>
                  <div className="product-text-box">
                    <p className="p-name">{p.name.toUpperCase()}</p>
                    <p className="p-price">{p.price} SEK</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="nav-arrow right" onClick={() => scroll('right')}>&#10095;</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="home-page-container">
      {showMemberPopup && (
        <div className="member-popup">
          <button className="close-popup-btn" onClick={() => setShowMemberPopup(false)}>✕</button>
          <h4 className="popup-header">OFFER</h4>
          <p>Join our community for 20% off your order.</p>
          <button className="popup-join-btn">JOIN NOW</button>
        </div>
      )}

      <header className="sale-mini-header" onClick={() => navigate('/products?sale=true')}>
        <div className="sale-header-content">
          <h2 className="sale-title-mini">SEASON SALE</h2>
          <p className="sale-subtitle">UP TO 50% OFF — SHOP THE COLLECTION</p>
        </div>
      </header>

      <div className="container-fixed">
        <div className="gender-grid">
          {['Men', 'Women', 'Kids', 'Sport'].map((gender) => {
            const imgMap = {
              Men: '1183266',
              Women: '1926769',
              Kids: '1619697',
              Sport: '3760259'
            };
            const imgId = imgMap[gender];
            
            return (
              <div 
                key={gender} 
                className="category-card-main" 
                onClick={() => navigate('/products', { 
                  state: { gender: gender === 'Sport' ? 'Sport' : gender } 
                })}
              >
                <div className="category-bg-img" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url('https://images.pexels.com/photos/${imgId}/pexels-photo-${imgId}.jpeg?w=800')` }}></div>
                <div className="category-card-overlay">
                  <h3 className="category-text-style">{gender.toUpperCase()}</h3>
                  <span className="explore-link">EXPLORE</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ProductSlider title="LATEST DROPS" products={latestProducts} bgColor="#f4f4f2" />

      <section className="originals-full-width">
        <div className="container-fixed">
          <div className="originals-grid">
            <div className="originals-text-panel">
              <h2 className="originals-title">THE ORIGINALS</h2>
              <p className="originals-description">
                Experience the perfect blend of heritage and modern design.
                Our signature collection features timeless essentials.
              </p>
              <button className="originals-btn" onClick={() => navigate('/products')}>
                VIEW COLLECTION
              </button>
            </div>
            <div className="originals-image-panel">
              <img src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&w=1000" alt="The Originals" />
            </div>
          </div>
        </div>
      </section>

      <ProductSlider title="STEAL THE LOOK" products={popularProducts} bgColor="#dad5ce" />

      <section className="sport-section">
        <div className="container-fixed">
          <div className="originals-grid sport-reverse">
            <div className="originals-image-panel sport-img">
              <img src="https://images.pexels.com/photos/3760259/pexels-photo-3760259.jpeg?auto=compress&w=1000" alt="Sport Collection" />
            </div>
            <div className="originals-text-panel sport-text">
              <h2 className="originals-title">PERFORMANCE TECH</h2>
              <p className="originals-description">
                Push your limits with our new athletic range. Engineered for breathability and movement.
              </p>
              <button className="originals-btn" onClick={() => navigate('/products?department=Sport')}>
                EXPLORE SPORT
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
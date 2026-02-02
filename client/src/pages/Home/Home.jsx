import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

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
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setLatestProducts([...data].sort((a, b) => b.id - a.id).slice(0, 8));
        setPopularProducts([...data].sort((a, b) => (b.price - (b.discountPrice || b.price)) - (a.price - (a.discountPrice || a.price))).slice(0, 8));
      })
      .catch(err => console.error("Fetch error:", err));
  }, []);

  const getImg = (url) => {
    // Om url saknas, är tom eller är strängen "null" -> visa placeholder
    if (!url || url === "" || url === "null" || url === "undefined") {
      return 'https://placehold.co/400x500/EEE/999?text=Image+Missing';
    }
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
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

      <header className="hero-header">
        <div className="hero-content">
          <h1 className="hero-title-main">NEW ARRIVALS</h1>
          <button className="hero-btn-main" onClick={() => navigate('/products')}>SHOP THE COLLECTION</button>
        </div>
      </header>

      <div className="container-fixed">
        <div className="gender-grid">
          {['Men', 'Women', 'Kids'].map((gender) => {
            const imgId = gender === 'Men' ? '1183266' : gender === 'Women' ? '1926769' : '1619697';
            return (
              <div key={gender} className="category-card-main" onClick={() => navigate('/products', { state: { gender } })}>
                <div className="category-bg-img" style={{ backgroundImage: `url('https://images.pexels.com/photos/${imgId}/pexels-photo-${imgId}.jpeg?w=800')` }}></div>
                <div className="category-card-overlay">
                  <h3 className="category-text-style">{gender.toUpperCase()}</h3>
                  <span className="explore-link">EXPLORE</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1. Latest Drops Slider */}
      <ProductSlider title="LATEST DROPS" products={latestProducts} bgColor="#d5d8c9" />

      {/* 2. The Originals (Nu mellan sliders) */}
      <div className="originals-wrapper">
        <div className="container-fixed">
          <div className="originals-content">
            <h2 className="originals-title">THE ORIGINALS</h2>
            <button className="originals-btn" onClick={() => navigate('/products')}>VIEW COLLECTION</button>
          </div>
        </div>
      </div>

      {/* 3. Steal The Look Slider */}
      <ProductSlider title="STEAL THE LOOK" products={popularProducts} bgColor="#dad5ce" />
    </div>
  );
}

export default Home;
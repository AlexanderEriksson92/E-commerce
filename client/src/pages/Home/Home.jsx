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
    // Om url saknas, är tom eller är strängen "null" -> visa placeholder
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
                <div className="category-bg-img" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url('https://images.pexels.com/photos/${imgId}/pexels-photo-${imgId}.jpeg?w=800')` }}></div>
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
      <ProductSlider title="LATEST DROPS" products={latestProducts} bgColor="#f4f4f2" />

      {/* 2. THE ORIGINALS - MATT FULL-WIDTH SECTION */}
      <section className="originals-full-width">
        <div className="container-fixed">
          <div className="originals-grid">

            {/* Vänster sida: Text */}
            <div className="originals-text-panel">
              <h2 className="originals-title">THE ORIGINALS</h2>
              <p className="originals-description">
                Experience the perfect blend of heritage and modern design.
                Our signature collection features timeless essentials crafted
                for those who value quality over trends.
              </p>
              <button className="originals-btn" onClick={() => navigate('/products')}>
                VIEW COLLECTION
              </button>
            </div>

            {/* Höger sida: Bild */}
            <div className="originals-image-panel">
              <img
                src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&w=1000"
                alt="The Originals Collection"
              />
            </div>

          </div>
        </div>
      </section>


      {/* 3. Steal The Look Slider */}
      <ProductSlider title="STEAL THE LOOK" products={popularProducts} bgColor="#dad5ce" />

      {/* 4. SPORT SECTION - SPEGELVÄND LAYOUT */}
      <section className="sport-section">
        <div className="container-fixed">
          <div className="originals-grid sport-reverse"> {/* Vi återanvänder grid-logiken men lägger till en reverse-klass */}

            {/* Vänster sida: Bild */}
            <div className="originals-image-panel sport-img">
              <img
                src="https://images.pexels.com/photos/3760259/pexels-photo-3760259.jpeg?auto=compress&w=1000"
                alt="Sport Collection"
              />
            </div>

            {/* Höger sida: Text */}
            <div className="originals-text-panel sport-text">
              <h2 className="originals-title">PERFORMANCE TECH</h2>
              <p className="originals-description">
                Push your limits with our new athletic range. Engineered for
                breathability and movement, designed to keep you at the top of your game.
              </p>
              <button
                className="originals-btn"
                onClick={() => navigate('/products?department=Sport')}
              >
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
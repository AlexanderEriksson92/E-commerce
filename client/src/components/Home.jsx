import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [latestProducts, setLatestProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        // Senaste: De 8 nyaste baserat på ID
        const latest = [...data].sort((a, b) => b.id - a.id).slice(0, 8);
        setLatestProducts(latest);
        
        // Populära: Här sorterar vi på pris (dyrast) som ett exempel på popularitet
        const popular = [...data].sort((a, b) => b.price - a.price).slice(0, 8);
        setPopularProducts(popular);
      })
      .catch(err => console.error("Fel vid hämtning till startsidan:", err));
  }, []);

  const ProductSlider = ({ title, products }) => {
    const sliderRef = useRef(null);

    // Funktion för att scrolla i sidled
    const scroll = (direction) => {
      if (sliderRef.current) {
        const { scrollLeft, clientWidth } = sliderRef.current;
        // Vi scrollar motsvarande en hel skärmbredd av containern
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
        sliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    };

    return (
      <section style={{ marginBottom: '60px', position: 'relative' }}>
        <h2 style={{ marginBottom: '20px', paddingLeft: '10px', fontSize: '24px' }}>{title}</h2>
        
        <div className="slider-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          
          {/* VÄNSTERPIL */}
          <button onClick={() => scroll('left')} className="slider-arrow left">
            &#10094;
          </button>

          <div className="slider-container" ref={sliderRef}>
            {products.map(p => (
              <div key={p.id} className="product-card-mini">
                <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: '#333' }}>
                  <img 
                    src={p.imageUrl?.startsWith('http') ? p.imageUrl : `http://localhost:5000${p.imageUrl}`} 
                    alt={p.name} 
                    onError={(e) => { e.target.src = 'https://placehold.co/250x200?text=Bild+saknas'; }}
                  />
                  <div style={{ padding: '12px' }}>
                    <h3 style={{ fontSize: '14px', margin: '0 0 5px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </h3>
                    <p style={{ fontWeight: 'bold', color: '#28a745', margin: 0 }}>{p.price} kr</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* HÖGERPIL */}
          <button onClick={() => scroll('right')} className="slider-arrow right">
            &#10095;
          </button>
        </div>
      </section>
    );
  };

  return (
    <div className="container" style={{ paddingBottom: '50px' }}>
      {/* Hero-banner */}
      <div className="hero-banner">
        <h1 style={{ fontSize: '42px', marginBottom: '10px' }}>Välkommen till Shoppen</h1>
        <p style={{ fontSize: '18px', marginBottom: '20px' }}>Upptäck de senaste trenderna och bästa priserna</p>
        <Link to="/products" className="btn-hero">Visa alla produkter</Link>
      </div>

      <ProductSlider title="🆕 Senaste Nyheterna" products={latestProducts} />
      <ProductSlider title="🔥 Mest Populära" products={popularProducts} />
    </div>
  );
}

export default Home;
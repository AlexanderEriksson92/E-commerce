import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Vi lägger till refreshFavorites i våra props
function ProductDetail({ onAddToCart, refreshFavorites }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // Hämta produkten
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fel vid hämtning av produktdetaljer:", err);
        setLoading(false);
      });

    // Kontrollera om produkten redan är en favorit
    if (userId) {
      fetch(`http://localhost:5000/api/auth/favorites/details/${userId}`)
        .then(res => res.json())
        .then(favs => {
          // Vi kollar om den nuvarande produktens ID finns i listan över favoriter
          const found = favs.some(fav => fav.id === parseInt(id));
          setIsFavorite(found);
        })
        .catch(err => console.error("Kunde inte hämta favoritstatus:", err));
    }
  }, [id, userId]);

  const toggleFavorite = async () => {
    if (!userId) {
      alert("Logga in för att spara favoriter!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: parseInt(id), userId })
      });
      
      if (response.ok) {
        // 1. Uppdatera lokalt hjärta (fyllt/tomt)
        setIsFavorite(!isFavorite);
        
        // 2. Uppdatera siffran i Navbaren direkt
        if (refreshFavorites) {
          refreshFavorites();
        }
      }
    } catch (err) {
      console.error("Kunde inte uppdatera favorit:", err);
    }
  };

  if (loading) return <div className="container">Laddar produkt...</div>;
  if (!product) return <div className="container">Produkten hittades inte!</div>;

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <Link to="/products" className="view-all" style={{ display: 'inline-block', marginBottom: '20px' }}>
        ← Tillbaka till sortimentet
      </Link>
      
      <div className="product-detail-flex" style={{ display: 'flex', gap: '40px', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: 'var(--shadow)' }}>
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="detail-image"
          style={{ width: '400px', height: '400px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Bild+saknas'; }}
        />

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold', margin: '0' }}>{product.brand}</p>
              <h1 style={{ margin: '5px 0 15px 0', fontSize: '2rem' }}>{product.name}</h1>
            </div>
            
            {/* HJÄRT-KNAPPEN */}
            <button 
              onClick={toggleFavorite}
              title={isFavorite ? "Ta bort från favoriter" : "Lägg till i favoriter"}
              style={{ background: 'none', border: 'none', fontSize: '32px', cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>
          
          <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6', marginBottom: '25px' }}>
            {product.description}
          </p>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h2 style={{ color: 'var(--primary)', fontSize: '2rem', margin: '0 0 20px 0' }}>{product.price} kr</h2>

            <button 
              onClick={() => onAddToCart(product)}
              className="btn btn-primary btn-block"
              style={{ fontSize: '1.1rem', padding: '15px' }}
            >
              Lägg i kundkorg 🛒
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
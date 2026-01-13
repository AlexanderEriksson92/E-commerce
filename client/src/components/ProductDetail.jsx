import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function ProductDetail({ onAddToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const userId = localStorage.getItem('userId');

  useEffect(() => {
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

    if (userId) {
      fetch(`http://localhost:5000/api/auth/favorites/${userId}`)
        .then(res => res.json())
        .then(favs => {
          setIsFavorite(favs.includes(parseInt(id)));
        });
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
        setIsFavorite(!isFavorite);
      }
    } catch (err) {
      console.error("Kunde inte uppdatera favorit:", err);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Laddar produkt...</div>;
  if (!product) return <div style={{ padding: '20px' }}>Produkten hittades inte!</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>← Tillbaka till listan</Link>
      
      <div style={{ display: 'flex', gap: '40px', marginTop: '20px', alignItems: 'flex-start' }}>
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          style={{ width: '350px', height: '350px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/350?text=Bild+saknas'; }}
        />

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: '0' }}>{product.name}</h1>
            <button 
              onClick={toggleFavorite}
              style={{ background: 'none', border: 'none', fontSize: '30px', cursor: 'pointer' }}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>
          
          <p style={{ color: '#666', fontSize: '16px', margin: '5px 0' }}>{product.brand}</p>
          <p style={{ fontSize: '18px', color: '#444', lineHeight: '1.6', marginTop: '15px' }}>
            {product.description}
          </p>
          <h2 style={{ color: '#28a745', margin: '20px 0' }}>{product.price} kr</h2>

          <button 
            onClick={() => onAddToCart(product)}
            style={{ 
              backgroundColor: '#28a745', color: 'white', border: 'none', 
              padding: '12px 25px', fontSize: '16px', borderRadius: '5px', 
              cursor: 'pointer', fontWeight: 'bold', width: '100%'
            }}
          >
            Lägg i kundkorg
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
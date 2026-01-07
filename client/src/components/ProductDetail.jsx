import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function ProductDetail({ onAddToCart }) {
  const { id } = useParams(); // Hämtar ID från URL:en
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hämtar den specifika produkten från din backend
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
  }, [id]);

  if (loading) return <div style={{ padding: '20px' }}>Laddar produkt...</div>;
  if (!product) return <div style={{ padding: '20px' }}>Produkten hittades inte!</div>;

 return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>← Tillbaka till listan</Link>
      
      <div style={{ display: 'flex', gap: '40px', marginTop: '20px', alignItems: 'flex-start' }}>
        
        {/* HÄR ÄR ÄNDRINGEN: Från div till img */}
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            style={{ 
              width: '350px', 
              height: '350px', 
              objectFit: 'cover', 
              borderRadius: '8px', 
              border: '1px solid #ddd' 
            }} 
            onError={(e) => { e.target.src = 'https://via.placeholder.com/350?text=Bild+saknas'; }}
          />
        ) : (
          <div style={{ width: '350px', height: '350px', backgroundColor: '#eee', borderRadius: '8px' }}>
            Ingen bild tillgänglig
          </div>
        )}

        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 10px 0' }}>{product.name}</h1>
          <p style={{ fontSize: '18px', color: '#444', lineHeight: '1.6' }}>
            {product.description}
          </p>
          <h2 style={{ color: '#28a745', margin: '20px 0' }}>{product.price} kr</h2>

          <button 
            onClick={() => onAddToCart(product)}
            style={{ 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              padding: '12px 25px', 
              fontSize: '16px', 
              borderRadius: '5px', 
              cursor: 'pointer',
              fontWeight: 'bold'
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
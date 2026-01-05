import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [id]);

  if (loading) return <p>Laddar produkt...</p>;
  if (!product) return <p>Produkten hittades inte!</p>;

  return (
    <div style={{ padding: '20px' }}>
      <Link to="/">← Tillbaka till listan</Link>
      <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
        <div style={{ width: '300px', height: '300px', background: '#eee', borderRadius: '8px' }}>
           <p style={{ textAlign: 'center', paddingTop: '130px' }}>Bild kommer här</p>
        </div>
        <div>
          <h1>{product.name}</h1>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>{product.description}</p>
          <h2 style={{ color: '#28a745' }}>{product.price} kr</h2>
          <button style={{ padding: '10px 20px', cursor: 'pointer' }}>Lägg i kundvagn</button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
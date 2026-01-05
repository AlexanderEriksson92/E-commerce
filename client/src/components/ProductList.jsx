import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Vi måste ta emot onAddToCart som en "prop" här i parentesen
function ProductList({ onAddToCart }) { 
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Fetch-fel:", err));
  }, []);

  return (
    <div className="product-grid" style={{ display: 'flex', gap: '20px', padding: '20px', flexWrap: 'wrap' }}>
      {products.map(product => (
        <div key={product.id} className="product-card" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', width: '200px' }}>
          <h3>{product.name}</h3>
          <p>{product.price} kr</p>
          
          <Link to={`/product/${product.id}`} style={{ color: '#007bff' }}>Visa detaljer</Link>
          <br />
          
          {/* Här kopplar vi funktionen till knappen! */}
          <button 
            onClick={() => onAddToCart(product)} 
            style={{ 
              marginTop: '10px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              padding: '8px 12px', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Lägg i kundkorg
          </button>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
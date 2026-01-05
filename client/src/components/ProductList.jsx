import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Kontrollera att denna URL stämmer exakt med din JSON-länk
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Fetch-fel:", err));
  }, []);

  return (
    <div className="product-grid">
      {products.map(product => (
        <div key={product.id} className="product-card">
          <h3>{product.name}</h3>
          <p>{product.price} kr</p>
          {/* Här länkar vi till detaljsidan */}
          <Link to={`/product/${product.id}`}>Visa detaljer</Link>
          <br />
          <button style={{ marginTop: '10px' }}>Lägg i kundkorg</button>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
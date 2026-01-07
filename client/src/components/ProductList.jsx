import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ProductList({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Fetch-fel:", err));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Vill du verkligen ta bort denna produkt?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': localStorage.getItem('token') }
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Kunde inte radera:", err);
    }
  };

  return (
    <div className="container">
      <h2 style={{ textAlign: 'center', margin: '30px 0' }}>Våra Produkter</h2>
      
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img 
              src={product.imageUrl?.startsWith('http') 
                ? product.imageUrl 
                : `http://localhost:5000${product.imageUrl}`} 
              alt={product.name} 
              onError={(e) => { e.target.src = 'https://placehold.co/200x150?text=Bild+saknas'; }}
            />

            <h3>{product.name}</h3>
            <p className="price">{product.price} kr</p>
            
            <Link to={`/product/${product.id}`} className="details-link">Visa detaljer →</Link>

            <button 
              className="btn btn-primary" 
              onClick={() => onAddToCart(product)}
              style={{ width: '100%', marginTop: '10px' }}
            >
              Lägg i kundvagn
            </button>

            {isAdmin && (
              <div className="button-group">
                <Link to={`/edit/${product.id}`} className="btn btn-warning" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', fontSize: '14px' }}>
                  Redigera
                </Link>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="btn btn-danger"
                  style={{ flex: 1, fontSize: '14px' }}
                >
                  Radera
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
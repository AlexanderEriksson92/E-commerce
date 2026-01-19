import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function ProductDetail({ onAddToCart, refreshFavorites }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '100px' }}>Not found!</div>;

  const inventory = product.inventory || {};
  const isTotalOutOfStock = Object.values(inventory).reduce((a, b) => a + b, 0) <= 0;

  // Sorteringsordning för kläder
  const sizeOrder = { 
    'XXS': 1, 'XS': 2, 'S': 3, 'M': 4, 'L': 5, 
    'XL': 6, 'XXL': 7, 'XXXL': 8, 'One Size': 9 
  };

  const handleAdd = () => {
    if (!selectedSize) return alert("Vänligen välj en storlek!");
    onAddToCart({ ...product, selectedSize });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <Link to="/products" style={{ textDecoration: 'none', color: '#666', fontWeight: 'bold' }}>← Tillbaka till kollektionen</Link>
      
      <div style={{ display: 'flex', gap: '60px', background: 'white', padding: '50px', borderRadius: '24px', boxShadow: '0 15px 40px rgba(0,0,0,0.06)', marginTop: '20px', flexWrap: 'wrap' }}>
        
        {/* PRODUKTBILD */}
        <div style={{ flex: '1 1 450px', position: 'relative', borderRadius: '15px', overflow: 'hidden' }}>
          <img 
            src={product.imageUrl?.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} 
            alt={product.name} 
            style={{ width: '100%', height: '550px', objectFit: 'cover', filter: isTotalOutOfStock ? 'grayscale(1)' : 'none' }} 
          />
        </div>

        {/* PRODUKTINFO & VAL */}
        <div style={{ flex: '1 1 400px' }}>
          <p style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', fontSize: '12px' }}>{product.department}</p>
          <h1 style={{ fontSize: '3rem', margin: '10px 0', fontWeight: '800' }}>{product.name}</h1>
          <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6', marginBottom: '30px' }}>{product.description}</p>

          {/* STORLEKSVÄLJARE */}
          <div style={{ marginBottom: '35px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '14px' }}>VÄLJ STORLEK</p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {Object.keys(inventory)
                .sort((a, b) => (sizeOrder[a] || 99) - (sizeOrder[b] || 99) || a.localeCompare(b))
                .map(size => {
                  const stockCount = inventory[size];
                  const isOut = stockCount <= 0;
                  const isLowStock = stockCount > 0 && stockCount <= 3;

                  return (
                    <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <button
                        disabled={isOut}
                        onClick={() => setSelectedSize(size)}
                        style={{
                          width: '75px', 
                          height: '55px', 
                          borderRadius: '8px', 
                          fontWeight: 'bold', 
                          cursor: isOut ? 'not-allowed' : 'pointer',
                          border: selectedSize === size ? '2px solid #000' : '1px solid #ddd',
                          color: isOut ? '#ccc' : (selectedSize === size ? '#fff' : '#000'),
                          backgroundColor: selectedSize === size ? '#000' : '#fff',
                          position: 'relative', 
                          overflow: 'hidden',
                          // Kraftigt diagonalt streck om storleken är slut
                          background: isOut 
                            ? 'linear-gradient(to top left, transparent calc(50% - 2px), #999, transparent calc(50% + 2px))' 
                            : (selectedSize === size ? '#000' : '#fff'),
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {size}
                      </button>
                      
                      {/* VARNING FÖR LÅGT LAGER */}
                      {isLowStock && (
                        <span style={{ fontSize: '10px', color: '#e67e22', fontWeight: '800', animation: 'fadeIn 0.5s' }}>
                          Bara {stockCount} kvar!
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* PRIS & KÖPKNAPP */}
          <div style={{ borderTop: '2px solid #f5f5f5', paddingTop: '30px' }}>
            <div style={{ marginBottom: '25px' }}>
              {product.discountPrice ? (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <span style={{ fontSize: '2.5rem', color: '#e74c3c', fontWeight: '900' }}>{product.discountPrice} kr</span>
                  <span style={{ fontSize: '1.5rem', color: '#bbb', textDecoration: 'line-through' }}>{product.price} kr</span>
                </div>
              ) : (
                <span style={{ fontSize: '2.5rem', fontWeight: '900' }}>{product.price} kr</span>
              )}
            </div>

            <button 
              onClick={handleAdd} 
              disabled={isTotalOutOfStock} 
              style={{ 
                width: '100%', 
                padding: '22px', 
                borderRadius: '12px', 
                backgroundColor: isTotalOutOfStock ? '#ccc' : '#1a1a1a', 
                color: 'white', 
                border: 'none', 
                fontWeight: 'bold', 
                cursor: isTotalOutOfStock ? 'not-allowed' : 'pointer', 
                fontSize: '1.2rem',
                boxShadow: isTotalOutOfStock ? 'none' : '0 10px 20px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => !isTotalOutOfStock && (e.target.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => !isTotalOutOfStock && (e.target.style.transform = 'scale(1)')}
            >
              {isTotalOutOfStock ? 'HELT SLUTSÅLD' : (selectedSize ? `LÄGG TILL ${selectedSize} I KORGEN` : 'VÄLJ STORLEK')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
import { Link } from 'react-router-dom';

function Cart({ cartItems, onRemove, onClear }) {
  // Räkna ut totalsumman
  const total = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Din Kundvagn 🛒</h2>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <p>Din kundvagn är tom.</p>
          <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>Gå tillbaka till produkterna</Link>
        </div>
      ) : (
        <div>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: '#fff' }}>
            {cartItems.map((item) => (
              <div key={item.cartId} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid #eee',
                padding: '10px 0'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>{item.name}</h4>
                  <p style={{ margin: 0, color: '#666' }}>{item.price} kr</p>
                </div>
                <button 
                  onClick={() => onRemove(item.cartId)}
                  style={{ 
                    backgroundColor: '#ff4d4d', 
                    color: 'white', 
                    border: 'none', 
                    padding: '5px 10px', 
                    borderRadius: '4px', 
                    cursor: 'pointer' 
                  }}
                >
                  Ta bort
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button 
              onClick={onClear}
              style={{ 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                padding: '8px 15px', 
                borderRadius: '4px', 
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Töm vagnen
            </button>
          </div>

          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px', 
            textAlign: 'right' 
          }}>
            <h3>Totalt att betala: {total} kr</h3>
            <button style={{ 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              padding: '12px 25px', 
              fontSize: '18px', 
              borderRadius: '5px', 
              cursor: 'pointer',
              marginTop: '10px'
            }}>
              Gå till kassan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
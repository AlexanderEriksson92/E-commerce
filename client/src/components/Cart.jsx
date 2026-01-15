import { useNavigate, Link } from 'react-router-dom'; // Lade till Link här!

function Cart({ cartItems, onRemove, onClear }) {
  const navigate = useNavigate();
  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.price), 0);
  const userId = localStorage.getItem('userId');

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    if (userId) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            items: cartItems,
            totalAmount: totalPrice
          })
        });

        if (response.ok) {
          alert("🎉 Tack för din beställning! Den finns nu sparad under din profil.");
          onClear();
          navigate('/profile');
        } else {
          alert("Kunde inte slutföra köpet i databasen.");
        }
      } catch (err) {
        console.error("Checkout error:", err);
        alert("Kunde inte ansluta till servern.");
      }
    } else {
      const confirmGuest = window.confirm("Du är inte inloggad. Ditt köp sparas inte i någon historik. Vill du fortsätta?");
      if (confirmGuest) {
        alert("🎉 Tack för ditt gästköp! Din varukorg har tömts.");
        onClear();
        navigate('/');
      }
    }
  };

  return (
    <div className="container" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="form-card" style={{ 
        maxWidth: '700px', 
        margin: '40px auto', 
        background: 'white', 
        padding: '30px', 
        borderRadius: '15px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)' 
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🛒 Din Kundvagn</h2>
        
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>Din kundvagn är tom.</p>
            <Link to="/products" className="btn btn-primary" style={{ 
              textDecoration: 'none', 
              display: 'inline-block', 
              marginTop: '20px',
              padding: '12px 30px'
            }}>
              Börja handla
            </Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '30px' }}>
              {cartItems.map((item) => (
                <div key={item.cartId} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '15px 0', 
                  borderBottom: '1px solid #f0f0f0' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <img 
                      src={item.imageUrl?.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`} 
                      alt={item.name} 
                      style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} 
                    />
                    <div>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '1.1rem' }}>{item.name}</p>
                      <p style={{ margin: 0, color: '#28a745', fontWeight: '500' }}>{item.price} kr</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemove(item.cartId)} 
                    className="btn"
                    style={{ 
                      backgroundColor: '#fff1f1', 
                      color: '#ff4d4d', 
                      border: '1px solid #ffcccc', 
                      padding: '8px 15px', 
                      borderRadius: '8px', 
                      fontSize: '13px' 
                    }}
                  >
                    Ta bort
                  </button>
                </div>
              ))}
            </div>

            <div style={{ 
              textAlign: 'right', 
              marginBottom: '30px', 
              padding: '20px', 
              background: '#f8fdf9', 
              borderRadius: '12px',
              border: '1px solid #e8f5e9'
            }}>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Summa att betala:</p>
              <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#1a1a1a' }}>{totalPrice} kr</h3>
              {!userId && <p style={{ color: '#888', fontSize: '12px', marginTop: '10px' }}>💡 Logga in för att samla poäng och se din historik.</p>}
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={onClear} className="btn" style={{ 
                flex: 1, 
                backgroundColor: '#f5f5f5', 
                color: '#666',
                border: 'none'
              }}>
                Töm vagnen
              </button>
              <button 
                onClick={handleCheckout} 
                className="btn btn-primary" 
                style={{ flex: 2, border: 'none', fontSize: '1rem' }}
              >
                {userId ? 'Slutför beställning' : 'Köp som gäst'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
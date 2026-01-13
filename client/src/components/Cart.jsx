import { useNavigate } from 'react-router-dom';

function Cart({ cartItems, onRemove, onClear }) {
  const navigate = useNavigate();
  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.price), 0);
  const userId = localStorage.getItem('userId');

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    // Om användaren är inloggad, skicka till API
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
    } 
    // Om användaren är gäst
    else {
      const confirmGuest = window.confirm("Du är inte inloggad. Ditt köp sparas inte i någon historik. Vill du fortsätta?");
      if (confirmGuest) {
        alert("🎉 Tack för ditt gästköp! Din varukorg har tömts.");
        onClear();
        navigate('/');
      }
    }
  };

  return (
    <div className="container">
      <div className="form-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center' }}>🛒 Din Kundvagn</h2>
        
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Din kundvagn är tom.</p>
            <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '10px' }}>Börja handla</Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              {cartItems.map((item) => (
                <div key={item.cartId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={item.imageUrl} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>{item.name}</p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{item.price} kr</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemove(item.cartId)} 
                    style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Ta bort
                  </button>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'right', marginBottom: '25px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
              <h3 style={{ margin: 0 }}>Totalt: {totalPrice} kr</h3>
              {!userId && <p style={{ color: '#888', fontSize: '11px', marginTop: '5px' }}>Logga in för att spara köpet på din profil.</p>}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={onClear} className="btn" style={{ flex: 1, backgroundColor: '#ddd', color: '#333' }}>
                Töm vagnen
              </button>
              <button 
                onClick={handleCheckout} 
                className="btn btn-primary" 
                style={{ flex: 2, backgroundColor: '#28a745', border: 'none', fontWeight: 'bold' }}
              >
                {userId ? 'Slutför köp' : 'Köp som gäst'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
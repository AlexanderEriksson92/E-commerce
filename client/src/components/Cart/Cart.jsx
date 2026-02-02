import { useNavigate, Link } from 'react-router-dom';
import './Cart.css';

function Cart({ cartItems = [], onRemove, onClear, setGlobalModal }) { 
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  const handleCheckout = async () => {
  if (cartItems.length === 0) return;

  const itemsForBackend = cartItems.map(item => ({
    id: item.id,
    price: item.price,
    selectedSize: item.selectedSize // Skickar exakt den storlek som sparades
  }));

  try {
    const response = await fetch('http://localhost:5000/api/auth/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId ? parseInt(userId) : null,
        items: itemsForBackend,
        totalAmount: totalPrice
      })
    });

    const data = await response.json();

    if (response.ok) {
      onClear();
      setGlobalModal({
        open: true,
        title: 'ORDER BEKRÄFTAD',
        msg: data.message,
        type: 'success'
      });
      navigate('/profile');
    } else {
      setGlobalModal({
        open: true,
        title: 'KUNDE INTE GENOMFÖRAS',
        msg: data.error, 
        type: 'error'
      });
    }
  } catch (err) {
    console.error("Checkout error:", err);
  }
};

  return (
    <div className="cart-page-container">
      <div className="cart-card">
        <h2 className="cart-title">SHOPPING BAG</h2>
        
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your bag is empty.</p>
            <Link to="/products" className="start-shopping-btn">START SHOPPING</Link>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.cartId} className="cart-item">
                  <div className="cart-item-left">
                    <Link to={`/product/${item.id}`}>
                      <img 
                        src={item.imageUrl?.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`} 
                        alt={item.name} 
                        className="cart-item-img"
                      />
                    </Link>
                    <div className="cart-item-info">
                      <p className="item-brand">{item.Brand?.name || 'TRENDNODE'}</p>
                      <Link to={`/product/${item.id}`} className="item-name-link">
                        <p className="item-name">{item.name}</p>
                      </Link>
                      <p className="item-size">SIZE: {item.selectedSize}</p>
                      <p className="item-price">{item.price} kr</p>
                    </div>
                  </div>
                  <button onClick={() => onRemove(item.cartId)} className="remove-item-btn">REMOVE</button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>TOTAL</span>
                <span>{totalPrice} kr</span>
              </div>
            </div>

            <div className="cart-actions">
              <button onClick={onClear} className="clear-cart-btn">CLEAR BAG</button>
              <button onClick={handleCheckout} className="checkout-btn">
                {userId ? 'CHECKOUT' : 'GUEST CHECKOUT'}
              </button>
            </div>
            
            <div className="continue-shopping">
               <Link to="/products">CONTINUE SHOPPING</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
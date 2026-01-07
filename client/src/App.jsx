import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import AddProduct from './components/AddProduct';
import Login from './components/Login';
import EditProduct from './components/EditProduct';
import './App.css';

// Vi skapar en intern komponent för att kunna använda useNavigate() korrekt
function AppContent({ cart, addToCart, removeFromCart, clearCart, isAdmin, setIsAdmin, handleLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    let inactivityTimeout;

    const resetTimer = () => {
      if (localStorage.getItem('token')) {
        clearTimeout(inactivityTimeout);
        // Logga ut efter 15 minuters inaktivitet (900 000 ms)
        // Du kan ändra detta till 3600000 om du vill ha exakt 1h
        inactivityTimeout = setTimeout(() => {
          alert("Din session har gått ut på grund av inaktivitet.");
          handleLogout();
          navigate('/login');
        }, 900000); 
      }
    };

    // Lyssna på användarinteraktion
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer(); // Starta timern direkt

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      clearTimeout(inactivityTimeout);
    };
  }, [isAdmin, navigate, handleLogout]);

  return (
    <div className="App">
      <nav style={{ padding: '20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>
          Min Webbshop 🛒
        </Link>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {isAdmin && (
            <Link to="/add" style={{ textDecoration: 'none', color: '#28a745', border: '1px solid #28a745', padding: '5px 15px', borderRadius: '5px' }}>
              + Lägg till produkt
            </Link>
          )}

          <Link to="/cart" style={{ textDecoration: 'none', color: '#007bff' }}>
            🛒 Kundvagn ({cart.length})
          </Link>

          {localStorage.getItem('token') ? (
            <button onClick={handleLogout} className="btn-logout" style={{ background: 'none', border: '1px solid #999', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' }}>
              Logga ut ({localStorage.getItem('username')})
            </button>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none', color: '#666' }}>Logga in</Link>
          )}
        </div>
      </nav>

      <main className="container">
        <Routes>
          <Route path="/" element={<ProductList onAddToCart={addToCart} />} />
          <Route path="/product/:id" element={<ProductDetail onAddToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cartItems={cart} onRemove={removeFromCart} onClear={clearCart} />} />
          <Route path="/login" element={<Login setAdminStatus={setIsAdmin} />} />
          <Route path="/edit/:id" element={<EditProduct />} />
          <Route path="/add" element={isAdmin ? <AddProduct /> : <Login setAdminStatus={setIsAdmin} />} />
        </Routes>
      </main>
    </div>
  );
}

// Huvud-App komponenten som håller i Router
function App() {
  const [cart, setCart] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
  }, []);

  const addToCart = (product) => {
    const itemWithId = { ...product, cartId: Date.now() + Math.random() };
    setCart([...cart, itemWithId]);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => setCart([]);

  const handleLogout = () => {
    localStorage.clear();
    setIsAdmin(false);
    // Vi använder inte window.location.href här för att undvika helskärms-omladdning
  };

  return (
    <Router>
      <AppContent 
        cart={cart} 
        addToCart={addToCart} 
        removeFromCart={removeFromCart} 
        clearCart={clearCart}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;
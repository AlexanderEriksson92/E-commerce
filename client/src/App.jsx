import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import './App.css';

function App() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    // Vi lägger till ett unikt cartId (t.ex. med Date.now()) 
    // så att vi kan ta bort en specifik vara även om man köpt två likadana tröjor
    const itemWithId = { ...product, cartId: Date.now() + Math.random() };
    setCart([...cart, itemWithId]);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <Router>
      <div className="App">
        <nav style={{ padding: '20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>
            Min Webbshop 🛒
          </Link>
          <Link to="/cart" style={{ textDecoration: 'none', fontSize: '18px', color: '#007bff' }}>
            🛒 Kundvagn ({cart.length})
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<ProductList onAddToCart={addToCart} />} />
          <Route path="/product/:id" element={<ProductDetail onAddToCart={addToCart} />} />
          {/* Här skickar vi med både cartItems, onRemove och onClear */}
          <Route path="/cart" element={
            <Cart 
              cartItems={cart} 
              onRemove={removeFromCart} 
              onClear={clearCart} 
            />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
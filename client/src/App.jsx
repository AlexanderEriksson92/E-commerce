import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Komponenter
import Home from './components/Home';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import AddProduct from './components/AddProduct';
import Login from './components/Login';
import EditProduct from './components/EditProduct';
import Register from './components/Register';
import Profile from './components/Profile'; 
import Favorites from './components/Favorites';
import Navbar from './components/Navbar'; 

// CSS
import './styles/App.css';

function AppContent({ cart, addToCart, removeFromCart, clearCart, isAdmin, setIsAdmin, handleLogout }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [favoriteCount, setFavoriteCount] = useState(0); // Siffra för hjärtat
  const searchRef = useRef(null);
  const userId = localStorage.getItem('userId');

  // Hämta sökdata
  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setAllProducts(data))
      .catch(err => console.error("Kunde inte ladda sökdata:", err));
  }, []);

  // Hämta antal favoriter för badgen
  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:5000/api/auth/favorites/details/${userId}`)
        .then(res => res.json())
        .then(data => setFavoriteCount(data.length))
        .catch(err => console.error("Kunde inte hämta favoriter:", err));
    } else {
      setFavoriteCount(0);
    }
  }, [userId]);

  // Live Search
  useEffect(() => {
    if (searchTerm.length > 1) {
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, allProducts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setSuggestions([]);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (id) => {
    setSuggestions([]);
    setSearchTerm('');
    navigate(`/product/${id}`);
  };

  return (
    <div className="App">
      <Navbar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        suggestions={suggestions}
        setSuggestions={setSuggestions}
        searchRef={searchRef}
        handleSelectSuggestion={handleSelectSuggestion}
        cart={cart}
        favoriteCount={favoriteCount} // Skickas till Navbar
        isAdmin={isAdmin}
        handleLogout={handleLogout}
      />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList onAddToCart={addToCart} />} />
          <Route path="/favorites" element={<Favorites onAddToCart={addToCart} />} />
          <Route path="/product/:id" element={<ProductDetail onAddToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cartItems={cart} onRemove={removeFromCart} onClear={clearCart} />} />
          <Route path="/login" element={<Login setAdminStatus={setIsAdmin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit/:id" element={<EditProduct />} />
          <Route path="/add" element={isAdmin ? <AddProduct /> : <Login setAdminStatus={setIsAdmin} />} />
        </Routes>
      </main>
    </div>
  );
}

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

  const handleLogout = () => {
    localStorage.clear();
    setIsAdmin(false);
    window.location.href = '/'; // Enkel refresh för att nolla allt
  };

  return (
    <Router>
      <AppContent 
        cart={cart} 
        addToCart={addToCart} 
        removeFromCart={removeFromCart} 
        clearCart={() => setCart([])}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;
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
import AdminProductList from './components/AdminProductList';


// CSS
import './styles/App.css';

function AppContent({ cart, addToCart, removeFromCart, clearCart, isAdmin, setIsAdmin, handleLogout }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [favoriteCount, setFavoriteCount] = useState(0); 
  const searchRef = useRef(null);
  
  const userId = localStorage.getItem('userId');

  const refreshFavorites = () => {
    const currentUserId = localStorage.getItem('userId');
    if (currentUserId) {
      fetch(`http://localhost:5000/api/auth/favorites/details/${currentUserId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setFavoriteCount(data.length);
          } else {
            setFavoriteCount(0);
          }
        })
        .catch(err => {
          console.error("Kunde inte uppdatera favoriter:", err);
          setFavoriteCount(0);
        });
    } else {
      setFavoriteCount(0);
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, [userId]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setAllProducts(data))
      .catch(err => console.error("Kunde inte ladda sökdata:", err));
  }, []);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, allProducts]);

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
        favoriteCount={favoriteCount}
        isAdmin={isAdmin}
        handleLogout={handleLogout}
      />

      {/* VIKTIGT: Vi ser till att main inte har konstig positionering i CSS */}
      <main className="main-content-wrapper">
        <Routes>
          <Route path="/" element={<Home refreshFavorites={refreshFavorites} />} />
          <Route path="/products" element={<ProductList onAddToCart={addToCart} refreshFavorites={refreshFavorites} />} />
          <Route path="/favorites" element={<Favorites onAddToCart={addToCart} refreshFavorites={refreshFavorites} />} />
          <Route path="/product/:id" element={<ProductDetail onAddToCart={addToCart} refreshFavorites={refreshFavorites} />} />
          <Route path="/cart" element={<Cart cartItems={cart} onRemove={removeFromCart} onClear={clearCart} />} />
          <Route path="/login" element={<Login setAdminStatus={setIsAdmin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit/:id" element={<EditProduct />} />
         {/* ADMIN RUTTER */}
          <Route path="/admin/products" element={<AdminProductList />} />
          <Route path="/admin/add-product" element={<AddProduct />} />
          <Route path="/admin/edit-product/:id" element={<EditProduct />} />
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

  const clearCart = () => setCart([]);

  const handleLogout = () => {
    localStorage.clear();
    setIsAdmin(false);
    window.location.href = '/'; 
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
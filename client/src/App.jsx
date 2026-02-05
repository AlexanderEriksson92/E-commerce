import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Global styling
import './App.css';

// --- PAGES ---
import Home from './pages/Home/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import AdminProductList from './pages/AdminProductList';
import EditProduct from './pages/EditProduct';

// --- COMPONENTS ---
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cart from './components/Cart';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import AddProduct from './components/AddProduct';
import ManageShop from './components/ManageShop';
import StatusModal from './components/StatusModal';
import ScrollToTop from './components/ScrollToTop';

function AppContent() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [globalModal, setGlobalModal] = useState({ open: false, msg: '', title: '', type: 'success' });
  
  // NYTT: State för den lilla notisen vid kundvagnen
  const [showCartToast, setShowCartToast] = useState(false);

  // Sök-states
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Varukorgs-state
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Sök-logik
  useEffect(() => {
    if (searchTerm.length > 1) {
      // Vi lägger till en lokal filtrering .filter() utifall backenden skickar allt
      fetch(`http://localhost:5000/api/products?search=${searchTerm}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const filtered = data.filter(p => 
              p.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5));
          } else {
            setSuggestions([]);
          }
        })
        .catch(err => console.error("Search error:", err));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);
  const handleSelectSuggestion = (productId) => {
    setSearchTerm("");
    setSuggestions([]);
    navigate(`/product/${productId}`);
  };

  // ADD TO CART - Nu med toast istället för stor modal
  const addToCart = (product, selectedSize = null) => {
    if (!product || !product.inventory) return;

    setCart(prevCart => {
      const availableSizes = Object.keys(product.inventory);
      const finalSize = selectedSize || availableSizes[0];

      return [...prevCart, {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        Brand: product.Brand,
        inventory: product.inventory,
        selectedSize: finalSize,
        cartId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }];
    });

    // Visa den lilla toasten (denna skickas till Navbar)
    setShowCartToast(true);
    setTimeout(() => setShowCartToast(false), 2500);
  };

  const removeFromCart = (cartId) => {
    setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCart([]);
  };

  useEffect(() => {
    const checkAdmin = () => setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    window.addEventListener('storage', checkAdmin);
    return () => window.removeEventListener('storage', checkAdmin);
  }, []);

  const handleLogout = () => {
    // Här använder vi fortfarande den stora rutan eftersom det är en viktig händelse!
    setGlobalModal({
      open: true,
      msg: 'Du har loggats ut. Välkommen åter!',
      title: 'UTLOGGAD',
      type: 'success'
    });

    setTimeout(() => {
      localStorage.clear();
      setIsAdmin(false);
      window.location.href = '/login';
    }, 1500);
  };

  return (
    <div className="app-container">
      <Navbar 
        isAdmin={isAdmin} 
        handleLogout={handleLogout} 
        cart={cart} 
        favoriteCount={0}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        suggestions={suggestions}
        handleSelectSuggestion={handleSelectSuggestion}
        showCartToast={showCartToast} // Skickas in här!
      />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList onAddToCart={addToCart} />} />
          <Route path="/product/:id" element={<ProductDetail onAddToCart={addToCart} />} />
          <Route path="/login" element={<Login setAdminStatus={setIsAdmin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/favorites" element={<Favorites onAddToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cartItems={cart} onRemove={removeFromCart} onClear={clearCart} setGlobalModal={setGlobalModal} />} />
          
          <Route path="/admin" element={<AdminProductList />} />
          <Route path="/admin/add-product" element={<AddProduct />} />
          <Route path="/manage-shop" element={<ManageShop />} />
          <Route path="/admin/edit-product/:id" element={<EditProduct />} />
        </Routes>
      </main>

      <Footer />

      {/* MODALEN FINNS KVAR FÖR LOGOUT OCH ANDRA VIKTIGA MEDDELANDEN */}
      <StatusModal
        isOpen={globalModal.open}
        title={globalModal.title}
        message={globalModal.msg}
        type={globalModal.type}
        onClose={() => setGlobalModal({ ...globalModal, open: false })}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar({ 
  searchTerm, setSearchTerm, suggestions, searchRef, 
  handleSelectSuggestion, cart, favoriteCount, isAdmin, handleLogout 
}) {
  const isLoggedIn = !!localStorage.getItem('token');
  const username = localStorage.getItem('username');

  return (
    <nav className="main-navbar">
      <div className="nav-section left">
        <Link to="/" className="nav-logo">TRENDNODE</Link>
        <Link to="/products" className="nav-link">Collection</Link>
        {isAdmin && <Link to="/admin/products" className="nav-link admin-highlight">Inventory Management</Link>}
      </div>

      <div className="nav-section center">
        <div className="navbar-search-container" ref={searchRef}>
          <input
            type="text"
            placeholder="Search products..."
            className="navbar-search-input expandable-search" // Lagt till ny klass
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* Förstoringsglaset är borttaget härifrån */}
          
          {suggestions.length > 0 && (
            <div className="search-suggestions-dropdown" style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 1000,
              marginTop: '5px'
            }}>
              {suggestions.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => handleSelectSuggestion(p.id)} 
                  className="suggestion-item"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <img 
                    src={p.imageUrl?.startsWith('http') ? p.imageUrl : `http://localhost:5000${p.imageUrl}`} 
                    alt="" 
                    style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }}
                    onError={(e) => { e.target.src = 'https://placehold.co/45x45?text=Img'; }}
                  />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '14px' }}>{p.name}</span>
                    <span style={{ fontSize: '12px', color: '#e74c3c', fontWeight: 'bold' }}>
                      {p.discountPrice ? `${p.discountPrice} kr` : `${p.price} kr`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="nav-section right">
        {!isAdmin && (
          <>
            <Link to="/favorites" className="icon-link" title="Favorites">
              ♡
              {favoriteCount > 0 && <span className="cart-badge fav-badge">{favoriteCount}</span>}
            </Link>
            
            <Link to="/cart" className="icon-link">
              🛒
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </Link>
          </>
        )}

        {isAdmin && (
          <Link to="/admin/add-product" className="icon-link" title="Add Product">➕</Link>
        )}

        <div className={`nav-item-dropdown ${isLoggedIn ? 'is-logged-in' : ''}`}>
          <Link to={isLoggedIn ? "/profile" : "/login"} className="icon-link">👤</Link>
          
          {isLoggedIn && (
            <div className="dropdown-content">
              <div className="dropdown-header">Hi {username}! {isAdmin && "(Admin)"}</div>
              
              {isAdmin ? (
                <>
                  <Link to="/admin/products">📦 Manage Inventory</Link>
                  <Link to="/admin/add-product">➕ Add Product</Link>
                </>
              ) : (
                <>
                  <Link to="/profile">My Profile</Link>
                  <Link to="/favorites">My Favorites</Link>
                </>
              )}
              
              <hr />
              <button onClick={handleLogout} className="dropdown-logout">Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
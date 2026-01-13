import React from 'react';
import { Link } from 'react-router-dom';

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
        <Link to="/products" className="nav-link">Sortiment</Link>
      </div>

      <div className="nav-section center">
        <div className="navbar-search-container" ref={searchRef}>
          <input
            type="text"
            placeholder="Sök produkter..."
            className="navbar-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
          {suggestions.length > 0 && (
            <div className="search-suggestions-dropdown">
              {suggestions.map(p => (
                <div key={p.id} onClick={() => handleSelectSuggestion(p.id)} className="suggestion-item">
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="nav-section right">
        {isAdmin && <Link to="/add" className="icon-link">➕</Link>}
        
        <Link to="/favorites" className="icon-link" title="Favoriter">
          ♡
          {favoriteCount > 0 && <span className="cart-badge fav-badge">{favoriteCount}</span>}
        </Link>
        
        <Link to="/cart" className="icon-link">
          🛒
          {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
        </Link>

        {/* Profil-del med villkorlig hovring */}
        <div className={`nav-item-dropdown ${isLoggedIn ? 'is-logged-in' : ''}`}>
          <Link to={isLoggedIn ? "/profile" : "/login"} className="icon-link">👤</Link>
          
          {isLoggedIn && (
            <div className="dropdown-content">
              <div className="dropdown-header">Hej {username}!</div>
              <Link to="/profile">Min Profil</Link>
              <Link to="/favorites">Mina Favoriter</Link>
              <hr />
              <button onClick={handleLogout} className="dropdown-logout">Logga ut</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
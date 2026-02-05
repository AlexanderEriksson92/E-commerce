import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import API_URL from '../../api';

function Navbar({
  searchTerm = "",
  setSearchTerm = () => { },
  suggestions = [],
  searchRef,
  handleSelectSuggestion = () => { },
  cart = [],
  favoriteCount = 0,
  isAdmin,
  handleLogout,
  showCartToast
}) {
  const isLoggedIn = !!localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Stäng mobilmenyn automatiskt när man byter sida
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav className="main-navbar">
        {/* HAMBURGER-KNAPP (Visas endast i mobil-CSS) */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className="nav-section left">
          <Link to="/" className="nav-logo">TRENDNODE</Link>

          {/* KATEGORIER - klassen 'open' styrs av state */}
          <div className={`nav-categories ${isMenuOpen ? 'open' : ''}`}>
            <Link to="/products" className="nav-link">Collection</Link>
            <Link to="/products?department=Men" className="nav-link">Men</Link>
            <Link to="/products?department=Women" className="nav-link">Women</Link>
            <Link to="/products?department=Kids" className="nav-link">Kids</Link>
            <Link to="/products?department=Sport" className="nav-link">Sport</Link>
            <Link to="/products?sale=true" className="nav-link sale-link" style={{ color: '#ff4d4d', fontWeight: 'bold' }}>REA</Link>

            {/* Mobil-specifik admin-länk inuti menyn */}
            {isAdmin && (
              <Link to="/admin" className="nav-link admin-highlight">
                Inventory
              </Link>
            )}
          </div>
        </div>

        <div className="nav-section right">
          {/* 1. SÖK */}
          <div className={`navbar-search-wrapper ${isSearchExpanded ? 'is-expanded' : ''}`} ref={searchRef}>
            {!isSearchExpanded ? (
              <div className="search-trigger" onClick={() => setIsSearchExpanded(true)}>
                <span className="search-icon-static">
                  <svg className="minimal-search-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <span className="search-text">SÖK</span>
              </div>
            ) : (
              <div className="search-input-container">
                <span className="search-icon-inside">
                  <svg className="minimal-search-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <input
                  autoFocus
                  type="text"
                  placeholder="Search products..."
                  className="navbar-search-input active-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onBlur={() => !searchTerm && setIsSearchExpanded(false)}
                />
                {/* Stäng-knapp för sökfältet (viktigt för mobil) */}
                <button
                  className="close-search-btn"
                  onClick={() => {
                    setIsSearchExpanded(false);
                    setSearchTerm("");
                  }}
                >
                  ✕
                </button>
                {suggestions.length > 0 && (
                  <div className="search-suggestions-dropdown">
                    {suggestions.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          handleSelectSuggestion(p.id);
                          setIsSearchExpanded(false);
                          setSearchTerm("");
                        }}
                        className="suggestion-item"
                      >
                        <img
                          src={p.imageUrl?.startsWith('http') ? p.imageUrl : `http://${API_URL}${p.imageUrl}`}
                          alt=""
                          onError={(e) => { e.target.src = 'https://placehold.co/45x45?text=Img'; }}
                        />
                        <div className="suggestion-info">
                          <span className="suggestion-name">{p.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. PROFIL */}
          <div className={`nav-item-dropdown ${isLoggedIn ? 'is-logged-in' : ''}`}>
            <Link to={isLoggedIn ? "/profile" : "/login"} className="icon-link">👤</Link>
            {isLoggedIn && (
              <div className="dropdown-content">
                <div className="dropdown-header">Hi {username}!</div>
                {isAdmin ? (
                  <>
                    <Link to="/admin">📦 Manage Inventory</Link>
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

          {/* 3. FAVORITER */}
          {!isAdmin && (
            <Link to="/favorites" className="icon-link" title="Favorites">
              ♡
              {favoriteCount > 0 && <span className="cart-badge fav-badge">{favoriteCount}</span>}
            </Link>
          )}

          {/* 4. KASSA */}
          {!isAdmin && (
            <Link to="/cart" className="icon-link" style={{ position: 'relative' }}>
              🛒
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}

              {showCartToast && (
                <div className="cart-mini-toast">
                  ADDED TO CART
                </div>
              )}
            </Link>
          )}
        </div>
      </nav>

      {/* OVERLAY: Mörkar ner sidan när mobilmenyn är öppen och stänger den vid klick */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)}></div>
      )}
      {isSearchExpanded && (
        <div
          className="search-overlay"
          onClick={() => {
            setIsSearchExpanded(false);
            setSearchTerm("");
          }}
        ></div>
      )}
    </>
  );
}

export default Navbar;
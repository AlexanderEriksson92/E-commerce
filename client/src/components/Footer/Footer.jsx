import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-benefits-grid">
        <div className="footer-benefit-item">
          <span className="benefit-icon">🚚</span>
          <b className="benefit-title">Fast Delivery</b>
          <small className="benefit-desc">1-3 Business days</small>
        </div>
        <div className="footer-benefit-item">
          <span className="benefit-icon">🔒</span>
          <b className="benefit-title">Secure Payment</b>
          <small className="benefit-desc">PCI Compliant</small>
        </div>
        <div className="footer-benefit-item">
          <span className="benefit-icon">♻️</span>
          <b className="benefit-title">Sustainable</b>
          <small className="benefit-desc">Eco-friendly materials</small>
        </div>
        <div className="footer-benefit-item">
          <span className="benefit-icon">⭐</span>
          <b className="benefit-title">Top Rated</b>
          <small className="benefit-desc">4.9/5 Customer score</small>
        </div>
      </div>

      <hr className="footer-divider" />

      <div className="footer-main-content">
        <div className="footer-brand-section">
          <h2 className="footer-logo">TRENDNODE</h2>
          <p className="footer-brand-text">
            Elevating your everyday style with curated streetwear since 2024.
          </p>
        </div>

        <div className="footer-links-section">
          <h5 className="footer-heading">SHOP</h5>
          <Link to="/products" className="footer-link">All Products</Link>
          <Link to="/products" className="footer-link" state={{ gender: 'Men' }}>Men's Collection</Link>
          <Link to="/products" className="footer-link" state={{ gender: 'Women' }}>Women's Collection</Link>
          <Link to="/products" className="footer-link" state={{ gender: 'Kids' }}>Kids' Collection</Link>
        </div>

        <div className="footer-links-section">
          <h5 className="footer-heading">SUPPORT</h5>
          <span className="footer-link">Contact Us</span>
          <span className="footer-link">Shipping Policy</span>
          <span className="footer-link">Returns</span>
        </div>
      </div>
      
      <div className="footer-copyright">
        © 2026 TRENDNODE AB. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
};

export default Footer;
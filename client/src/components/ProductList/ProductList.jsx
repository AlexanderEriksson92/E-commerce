import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import StatusModal from '../StatusModal/StatusModal';
import './ProductList.css';
import API_URL from '../../api';

const GridBanner = ({ gender, type, isSalePage }) => {
  const bannerData = {
    top: {
      Men: { title: "MEN'S NEW SEASON", desc: "Discover the latest trends for men.", img: "https://images.pexels.com/photos/4394807/pexels-photo-4394807.jpeg" },
      Women: { title: "WOMEN'S COLLECTION", desc: "This season's most wanted styles are here.", img: "https://images.pexels.com/photos/3756042/pexels-photo-3756042.jpeg" },
      Kids: { title: "KIDS' FAVORITES", desc: "Playful styles for small adventures.", img: "https://images.pexels.com/photos/1619690/pexels-photo-1619690.jpeg" },
      Sale: { title: "SEASONAL SALE", desc: "Great deals on selected favorites.", img: "https://images.pexels.com/photos/5868272/pexels-photo-5868272.jpeg" },
      All: { title: "THE EDIT", desc: "Handpicked favorites from our entire range.", img: "https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg" }
    },
    middle: {
      Men: { title: "URBAN CLASSICS", desc: "Timeless pieces for the modern man.", img: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg" },
      Women: { title: "ACCESSORIES EDIT", desc: "The details that complete your outfit.", img: "https://images.pexels.com/photos/1460838/pexels-photo-1460838.jpeg" },
      Kids: { title: "JUNIOR ESSENTIALS", desc: "Comfort meets style for the little ones.", img: "https://images.pexels.com/photos/1102734/pexels-photo-1102734.jpeg" },
      Sale: { title: "LAST CHANCE", desc: "Don't miss out on our outlet prices.", img: "https://images.pexels.com/photos/3965548/pexels-photo-3965548.jpeg" },
      All: { title: "SNEAKER HUB", desc: "Find your next pair of favorite shoes here.", img: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg" }
    }
  };

  // PRIORITERA "Sale" om isSalePage är true, annars använd vald gender/department
  const activeKey = isSalePage ? "Sale" : (gender || "All");
  const currentContent = bannerData[type]?.[activeKey] || bannerData[type]?.All;

  // Klasser för vit text (Specialfall)
  const specialClass =
    currentContent.title === "THE EDIT" ? "is-the-edit" :
    currentContent.title === "URBAN CLASSICS" ? "is-urban-classics" :
    isSalePage ? "is-sale-banner" : "";

  return (
    <div className={`grid-banner-fullwidth banner-${type} ${specialClass}`}>
      <div className="banner-inner" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${currentContent.img})` }}>
        <div className="banner-content">
          <span className="banner-sub">
            {isSalePage ? "OUTLET" : (type === 'top' ? 'JUST ARRIVED' : 'DON\'T MISS')}
          </span>
          <h2>{currentContent.title}</h2>
          <p className="banner-desc-white">{currentContent.desc}</p>
          <button className="banner-shop-btn">SHOP COLLECTION</button>
        </div>
      </div>
    </div>
  );
};

function ProductList({ refreshFavorites }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = localStorage.getItem('userId');
  
  // Kontrollera om vi är på reasidan via URL ?sale=true
  const isSalePage = searchParams.get('sale') === 'true';

  const queryDept = searchParams.get('department');
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState(queryDept || location.state?.gender || 'All');
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 16;

  const categories = ['All', ...new Set(products.map(p => p.Category?.name || p.category).filter(Boolean))];
  const [modal, setModal] = useState({ open: false, msg: '', title: '', type: '', action: null });

  const getOptimizedImage = (url, width = 500) => {
    const height = Math.round(width * 1.3);
    const placeholder = `https://placehold.co/${width}x${height}/f0f0f0/999999?text=Missing+Image`;
    if (!url || url === "" || url === "null" || url === "undefined") return placeholder;
    if (url.startsWith('http')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=${width}&h=${height}&fit=cover&errorimg=${encodeURIComponent(placeholder)}`;
    }
    return `${API_URL}${url}`;
  };

  useEffect(() => {
    if (queryDept) { setGenderFilter(queryDept); setCurrentPage(1); }
    else if (location.state?.gender) { setGenderFilter(location.state.gender); setCurrentPage(1); }
    else { setGenderFilter('All'); }
  }, [queryDept, location.state]);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Fetch error:", err));

    if (userId) {
      fetch(`${API_URL}/api/auth/favorites/details/${userId}`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setFavorites(data.map(f => f.id)); });
    }
  }, [userId]);

  const toggleFavorite = async (productId) => {
    if (!userId) {
      setModal({ open: true, title: 'LOGIN REQUIRED', msg: 'You must be logged in to save favorites.', type: 'error', action: () => navigate('/login') });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, userId })
      });
      if (res.ok) {
        setFavorites(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
        if (refreshFavorites) refreshFavorites();
      }
    } catch (err) { console.error(err); }
  };

  const filteredProducts = products
    .filter(p => {
      const pCat = p.Category?.name || p.category || 'Uncategorized';
      const pDept = p.department || 'Unisex';
      const name = p.name || '';
      const hasDiscount = p.discountPrice && Number(p.discountPrice) > 0;
      const matchesSale = isSalePage ? hasDiscount : true;
      const matchesCategory = categoryFilter === 'All' || pCat === categoryFilter;
      const matchesSearch = name.toLowerCase().includes(localSearch.toLowerCase());
      let matchesGender = (genderFilter === 'All') ? true : (genderFilter === 'Sport' ? p.isSportswear === true : pDept === genderFilter);
      return matchesSale && matchesCategory && matchesGender && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'priceLow') return a.price - b.price;
      if (sortBy === 'priceHigh') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.id - a.id;
    });

  const currentProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);
  const totalPages = Math.ceil(filteredProducts.length * 1.2 / productsPerPage); // Justering för banners i griden

  return (
    <div className="product-detail-page">
      <div className="product-list-container">
        <header className="product-list-header">
          <h1 className={isSalePage ? 'sale-title' : 'dept-title'}>
            {isSalePage ? 'SPECIAL OFFERS' : (genderFilter === 'All' ? 'COLLECTIONS' : genderFilter)}
          </h1>
          <p className="item-count">{filteredProducts.length} ITEMS</p>
        </header>

        <div className="product-toolbar">
          <button onClick={() => setShowFilters(!showFilters)} className="filter-toggle-btn">
            {showFilters ? '✕ CLOSE' : 'FILTER'}
          </button>
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }} className="sort-select">
            <option value="newest">NEWEST</option>
            <option value="priceLow">PRICE: LOW-HIGH</option>
            <option value="priceHigh">PRICE: HIGH-LOW</option>
            <option value="name">NAME: A-Z</option>
          </select>
        </div>

        {showFilters && (
          <div className="filter-panel">
            <div className="filter-section search-section">
              <label>SEARCH</label>
              <input type="text" placeholder="Keywords..." value={localSearch} onChange={(e) => { setLocalSearch(e.target.value); setCurrentPage(1); }} />
            </div>
            <div className="filter-section category-section">
              <label>CATEGORY</label>
              <div className="category-grid">
                {categories.map(cat => (
                  <button key={cat} onClick={() => { setCategoryFilter(cat); setCurrentPage(1); }}
                    className={`cat-btn ${categoryFilter === cat ? 'active' : ''}`}>
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="product-grid">
          {/* TOP BANNER */}
          <GridBanner gender={genderFilter} type="top" isSalePage={isSalePage} />

          {currentProducts.map((product, index) => {
            const totalStock = product.variants ? product.variants.reduce((sum, v) => sum + v.stock, 0) : 0;
            const isOut = totalStock <= 0;

            return (
              <React.Fragment key={product.id}>
                {/* MIDDLE BANNER */}
                {index === 8 && <GridBanner gender={genderFilter} type="middle" isSalePage={isSalePage} />}

                <div className="product-card-new">
                  {isOut && <div className="product-overlay-soldout"><span>OUT OF STOCK</span></div>}
                  {product.discountPrice && !isOut && <div className="sale-badge">SALE</div>}
                  <button onClick={() => toggleFavorite(product.id)} className="favorite-btn">
                    {favorites.includes(product.id) ? '❤️' : '🤍'}
                  </button>

                  <Link to={`/product/${product.id}`} className="product-link">
                    <div className="list-image-container">
                      <img src={getOptimizedImage(product.imageUrl)} alt={product.name}
                        onError={(e) => { e.target.src = 'https://placehold.co/500x650/f0f0f0/999999?text=No+Image'; }} />
                    </div>
                    <div className="list-product-info">
                      <span className="list-brand">{product.Brand?.name || "DESIGNER"}</span>
                      <h3 className="list-product-name">{product.name}</h3>
                      <div className="price">
                        {product.discountPrice ? (
                          <><span className="sale-price">{product.discountPrice} kr</span><span className="old-price">{product.price} kr</span></>
                        ) : (<span className="reg-price">{product.price} kr</span>)}
                      </div>
                    </div>
                  </Link>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => {
                  setCurrentPage(i + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        <StatusModal
          isOpen={modal.open} title={modal.title} message={modal.msg} type={modal.type}
          onClose={() => setModal({ ...modal, open: false })} onConfirm={modal.action} confirmText="LOGIN"
        />
      </div>
    </div>
  );
}

export default ProductList;
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import StatusModal from '../StatusModal/StatusModal';
import './ProductList.css';
import API_URL from '../../api';

// --- HEADER KOMPONENT ---
const CollectionHeader = ({ gender, isSalePage, setCategoryFilter }) => {
  const contentMap = {
    Men: {
      title: "PREMIUM SELECTION",
      media: "https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?_gl=1*3iq624*_ga*OTY4NDA2OTA1LjE3Njg2NTY1ODc.*_ga_8JE65Q40S6*czE3NzExNDkzODUkbzIzJGcxJHQxNzcxMTQ5NDA2JGozOSRsMCRoMA..",
      puffs: [
        { title: "NEW DENIM", img: "https://images.pexels.com/photos/52518/jeans-pants-blue-shop-52518.jpeg", category: "Denim" },
        { title: "SUITS", img: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg", category: "Suits" },
        { title: "SNEAKERS", img: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg", category: "Shoes" }, // Matchar 'Shoes'
        { title: "SHIRTS", img: "https://images.pexels.com/photos/4066293/pexels-photo-4066293.jpeg", category: "Shirts" }
      ]
    },
    Women: {
      title: "THE NEW CLASSICS",
      media: "https://images.pexels.com/photos/3756042/pexels-photo-3756042.jpeg",
      puffs: [
        { title: "DRESSES", img: "https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg", category: "Dresses" },
        { title: "BAGS", img: "https://images.pexels.com/photos/1460838/pexels-photo-1460838.jpeg", category: "Accessories" },
        { title: "TOPS", img: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg", category: "Tops" },
        { title: "SHOES", img: "https://images.pexels.com/photos/137603/pexels-photo-137603.jpeg", category: "Shoes" }
      ]
    },
    Kids: {
      title: "YOUNG TALENTS",
      media: "https://images.pexels.com/photos/1619690/pexels-photo-1619690.jpeg",
      puffs: [
        { title: "PLAYTIME", img: "https://images.pexels.com/photos/35188/child-children-girl-happy.jpg", category: "Playwear" },
        { title: "BABY", img: "https://images.pexels.com/photos/3845492/pexels-photo-3845492.jpeg", category: "Baby" },
        { title: "SHOES", img: "https://images.pexels.com/photos/267202/pexels-photo-267202.jpeg", category: "Shoes" },
        { title: "JACKETS", img: "https://images.pexels.com/photos/3965548/pexels-photo-3965548.jpeg", category: "Jackets" }
      ]
    },
    Sport: {
      title: "PERFORMANCE TECH",
      media: "https://images.pexels.com/photos/347135/pexels-photo-347135.jpeg?auto=compress&cs=tinysrgb&w=1400",
      puffs: [
        { title: "RUNNING", img: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg", category: "Running" },
        { title: "TRAINING", img: "https://images.pexels.com/photos/3760259/pexels-photo-3760259.jpeg", category: "Training" },
        { title: "YOGA", img: "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg", category: "Yoga" },
        { title: "FOOTWEAR", img: "https://images.pexels.com/photos/1102734/pexels-photo-1102734.jpeg", category: "Shoes" }
      ]
    },
    All: {
      title: "CURATED FOR YOU",
      media: "https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg",
      puffs: [
        { title: "TRENDING", img: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg", category: "All" },
        { title: "NEW IN", img: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg", category: "Tops" },
        { title: "GIFT CARDS", img: "https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg", category: "Accessories" },
        { title: "SALE", img: "https://images.pexels.com/photos/3965548/pexels-photo-3965548.jpeg", category: "All" }
      ]
    }
  };

  const activeKey = isSalePage ? "All" : (gender || "All");
  const content = contentMap[activeKey] || contentMap.All;

  return (
    <div className="collection-header-group">
      <div className="hero-viewport">
        <div className="hero-asset image-asset" style={{ backgroundImage: `url(${content.media})` }} />
        <div className="hero-overlay-text">
          <h1>{isSalePage ? "OUTLET SALE" : content.title}</h1>
        </div>
      </div>
      <div className="promo-quad-grid">
        {content.puffs.map((p, i) => (
          <div 
            key={i} 
            className="quad-item" 
            style={{ backgroundImage: `url(${p.img})`, cursor: 'pointer' }}
            onClick={() => {
              setCategoryFilter(p.category);
              document.querySelector('.product-list-header')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <div className="quad-overlay"><span>{p.title}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MID GRID BANNER ---
const MidGridBanner = ({ gender }) => {
  const midData = {
    Men: { title: "URBAN CLASSICS", img: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg" },
    Women: { title: "EVENING WEAR", img: "https://images.pexels.com/photos/1460838/pexels-photo-1460838.jpeg" },
    Kids: { title: "JUNIOR ESSENTIALS", img: "https://images.pexels.com/photos/1102734/pexels-photo-1102734.jpeg" },
    Sport: { title: "ELITE PERFORMANCE", img: "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg" },
    All: { title: "SNEAKER HUB", img: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg" }
  };
  const content = midData[gender] || midData.All;
  return (
    <div className="mid-grid-banner">
      <div className="mid-banner-inner" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${content.img})` }}>
        <h2>{content.title}</h2>
        <button className="mid-banner-btn">EXPLORE NOW</button>
      </div>
    </div>
  );
};

// --- HUVUDKOMPONENT ---
function ProductList({ refreshFavorites }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = localStorage.getItem('userId');
  const isSalePage = searchParams.get('sale') === 'true';
  const queryDept = searchParams.get('department');

  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState({ open: false, msg: '', title: '', type: '', action: null });
  const productsPerPage = 16;

  // --- ÅTERSTÄLLD: Bildoptimering & Placeholder ---
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
    if (queryDept) setGenderFilter(queryDept);
    else if (location.state?.gender) setGenderFilter(location.state.gender);
    else setGenderFilter('All');
    setCategoryFilter('All');
    setCurrentPage(1);
  }, [queryDept, location.state, isSalePage]);

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
      setModal({ open: true, title: 'LOGIN REQUIRED', msg: 'Please log in to save favorites.', type: 'error', action: () => navigate('/login') });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, userId })
      });
      if (res.ok) setFavorites(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
    } catch (err) { console.error(err); }
  };

  // --- FILTERLOGIK (Nu med Shoes-mappning) ---
  const filteredProducts = products.filter(p => {
    const pCat = (p.Category?.name || p.category || '').toLowerCase();
    const pDept = (p.department || '').toLowerCase();
    const filter = categoryFilter.toLowerCase();
    
    const hasDiscount = p.discountPrice && Number(p.discountPrice) > 0 && Number(p.discountPrice) < Number(p.price);
    const matchesSale = isSalePage ? hasDiscount : true;

    // Smart match för Shoes/Denim
    const matchesCategory = filter === 'all' || 
                           pCat === filter || 
                           (filter === 'shoes' && (pCat.includes('skor') || pCat.includes('sneaker') || pCat.includes('footwear'))) ||
                           (filter === 'denim' && pCat.includes('jeans'));
    
    const matchesSearch = (p.name || '').toLowerCase().includes(localSearch.toLowerCase());
    
    let matchesGender = true;
    const currentGender = genderFilter.toLowerCase();
    if (currentGender === 'sport') matchesGender = p.isSportswear === true;
    else if (currentGender !== 'all') matchesGender = pDept === currentGender;

    return matchesSale && matchesCategory && matchesGender && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'priceLow') return a.price - b.price;
    if (sortBy === 'priceHigh') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return b.id - a.id;
  });

  const currentProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const categoriesList = ['All', ...new Set(products.map(p => p.Category?.name || p.category).filter(Boolean))];

  return (
    <div className="master-list-wrapper">
      <div className="list-main-content-boxed">
        <div className="header-spacing-container">
          <CollectionHeader gender={genderFilter} isSalePage={isSalePage} setCategoryFilter={setCategoryFilter} />
        </div>
        <div className="product-list-container">
          <header className="product-list-header">
            <h1 className={isSalePage ? 'sale-title' : 'dept-title'}>
              {isSalePage ? 'SPECIAL OFFERS' : (genderFilter === 'All' ? 'COLLECTIONS' : genderFilter)}
            </h1>
            <p className="item-count">{filteredProducts.length} ITEMS</p>
          </header>
          <div className="product-toolbar">
            <button onClick={() => setShowFilters(!showFilters)} className="filter-toggle-btn">{showFilters ? '✕ CLOSE' : 'FILTER'}</button>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
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
                <input type="text" placeholder="Keywords..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} />
              </div>
              <div className="filter-section category-section">
                <label>CATEGORY</label>
                <div className="category-grid">
                  {categoriesList.map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)} className={`cat-btn ${categoryFilter === cat ? 'active' : ''}`}>{cat.toUpperCase()}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {filteredProducts.length === 0 ? (
            <div className="no-products-found">
              <h3>No products found in this selection.</h3>
              <button onClick={() => {setCategoryFilter('All'); setLocalSearch('');}} className="clear-filters-btn">CLEAR ALL FILTERS</button>
            </div>
          ) : (
            <div className="product-grid">
              {currentProducts.map((product, index) => {
                const totalStock = product.variants ? product.variants.reduce((sum, v) => sum + v.stock, 0) : 0;
                const isOut = totalStock <= 0;
                return (
                  <React.Fragment key={product.id}>
                    {index === 8 && <MidGridBanner gender={genderFilter} />}
                    <div className="product-card-new">
                      {isOut && <div className="product-overlay-soldout"><span>OUT OF STOCK</span></div>}
                      {product.discountPrice && !isOut && <div className="sale-badge">SALE</div>}
                      <button onClick={() => toggleFavorite(product.id)} className="favorite-btn">{favorites.includes(product.id) ? '❤️' : '🤍'}</button>
                      <Link to={`/product/${product.id}`} className="product-link">
                        <div className="list-image-container">
                          <img src={getOptimizedImage(product.imageUrl)} alt={product.name} onError={(e) => { e.target.src = 'https://placehold.co/500x650/f0f0f0/999999?text=No+Image'; }} />
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
          )}
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      </div>
      <StatusModal isOpen={modal.open} title={modal.title} message={modal.msg} type={modal.type} onClose={() => setModal({ ...modal, open: false })} onConfirm={modal.action} confirmText="LOGIN" />
    </div>
  );
}

export default ProductList;
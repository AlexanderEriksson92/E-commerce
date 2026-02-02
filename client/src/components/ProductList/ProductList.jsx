import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import StatusModal from '../StatusModal/StatusModal';
import './ProductList.css';

function ProductList({ refreshFavorites }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = localStorage.getItem('userId');

  const queryDept = searchParams.get('department');
  const isSaleOnly = searchParams.get('sale') === 'true';

  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState(queryDept || location.state?.gender || 'All');
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 16;

  const [modal, setModal] = useState({ open: false, msg: '', title: '', type: '', action: null });

  // FÖRBÄTTRAD PLACEHOLDER LOGIK
  const getOptimizedImage = (url, width = 500) => {
    const height = Math.round(width * 1.3);
    const placeholder = `https://placehold.co/${width}x${height}/f0f0f0/999999?text=Bild+saknas`;

    if (!url || url === "" || url === "null" || url === "undefined") return placeholder;

    if (url.startsWith('http')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=${width}&h=${height}&fit=cover&errorimg=${encodeURIComponent(placeholder)}`;
    }
    return `http://localhost:5000${url}`;
  };

  useEffect(() => {
    if (queryDept) {
      setGenderFilter(queryDept);
      setCurrentPage(1);
    } else if (location.state?.gender) {
      setGenderFilter(location.state.gender);
      setCurrentPage(1);
    } else {
      setGenderFilter('All');
    }
  }, [queryDept, location.state]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Fetch error:", err));

    if (userId) {
      fetch(`http://localhost:5000/api/auth/favorites/details/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setFavorites(data.map(f => f.id));
        });
    }
  }, [userId]);

  const toggleFavorite = async (productId) => {
    if (!userId) {
      setModal({
        open: true,
        title: 'LOGGA IN',
        msg: 'Du måste vara inloggad för att spara favoriter.',
        type: 'error',
        action: () => navigate('/login')
      });
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/favorites/toggle', {
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

  const categories = ['All', ...new Set(products.map(p => p.Category?.name || p.category).filter(Boolean))];

  const filteredProducts = products
    .filter(p => {
      const pCat = p.Category?.name || p.category || 'Uncategorized';
      const pDept = p.department || 'Unisex';
      const name = p.name || '';
      const hasDiscount = p.discountPrice && Number(p.discountPrice) > 0;
      const matchesSale = isSaleOnly ? hasDiscount : true;
      const matchesCategory = categoryFilter === 'All' || pCat === categoryFilter;
      const matchesGender = genderFilter === 'All' || pDept === genderFilter;
      const matchesSearch = name.toLowerCase().includes(localSearch.toLowerCase());
      return matchesSale && matchesCategory && matchesGender && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'priceLow') return a.price - b.price;
      if (sortBy === 'priceHigh') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.id - a.id;
    });

  const currentProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="product-detail-page">
      <div className="product-list-container">
        <header className="product-list-header">
          <h1 className={isSaleOnly ? 'sale-title' : 'dept-title'}>
            {isSaleOnly ? 'SPECIAL OFFERS / REA' : (genderFilter === 'All' ? 'COLLECTIONS' : genderFilter)}
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
          {currentProducts.map(product => {
            const isOut = Object.values(product.inventory || {}).reduce((a, b) => a + b, 0) <= 0;
            return (
              <div key={product.id} className="product-card-new">
                {isOut && <div className="product-overlay-soldout"><span>SLUTSÅLD</span></div>}
                {product.discountPrice && !isOut && <div className="sale-badge">SALE</div>}

                <button onClick={() => toggleFavorite(product.id)} className="favorite-btn">
                  {favorites.includes(product.id) ? '❤️' : '🤍'}
                </button>

                <Link to={`/product/${product.id}`} className="product-link">
                  <div className="list-image-container">
                    <img
                      src={getOptimizedImage(product.imageUrl)}
                      alt={product.name}
                      onError={(e) => { e.target.src = 'https://placehold.co/500x650/f0f0f0/999999?text=Bild+saknas'; }}
                    />
                  </div>

                  <div className="list-product-info">
                    {/* VISAR MÄRKET FRÅN Brand-MODELLEN */}
                    <span className="list-brand">{product.Brand?.name || "DESIGNER"}</span>
                    <h3 className="list-product-name">{product.name}</h3>

                    <div className="price">
                      {product.discountPrice ? (
                        <>
                          <span className="sale-price">{product.discountPrice} kr</span>
                          <span className="old-price">{product.price} kr</span>
                        </>
                      ) : (
                        <span className="reg-price">{product.price} kr</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i + 1} onClick={() => { setCurrentPage(i + 1); window.scrollTo(0, 0); }}
                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}

        <StatusModal
          isOpen={modal.open}
          title={modal.title}
          message={modal.msg}
          type={modal.type}
          onClose={() => setModal({ ...modal, open: false })}
          onConfirm={modal.action}
          confirmText="LOGGA IN"
        />
      </div>
    </div>
  );
}


export default ProductList;
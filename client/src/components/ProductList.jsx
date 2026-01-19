import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ProductList({ onAddToCart, refreshFavorites }) {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState('');

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Could not fetch products:", err));

    if (userId) {
      fetch(`http://localhost:5000/api/auth/favorites/details/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setFavorites(data.map(f => f.id));
        })
        .catch(err => console.error("Favorites error:", err));
    }
  }, [userId]);

  const categories = ['All', ...new Set(products.map(p => p.Category?.name || p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const pCat = p.Category?.name || p.category || 'Uncategorized';
    const pDept = p.department || 'Unisex';
    const name = p.name || '';
    
    const inventory = p.inventory || {};
    const totalStock = Object.values(inventory).reduce((acc, curr) => acc + curr, 0);
    p.isOutOfStock = totalStock <= 0;

    return (categoryFilter === 'All' || pCat === categoryFilter) &&
           (genderFilter === 'All' || pDept === genderFilter) &&
           (name.toLowerCase().includes(localSearch.toLowerCase()));
  });

  const toggleFavorite = async (productId) => {
    if (!userId) return alert("Please log in first!");
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
    } catch (err) { console.error("Toggle error:", err); }
  };

  return (
    <div className="container" style={{ marginTop: '40px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px', fontWeight: '800' }}>OUR COLLECTION</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>Explore our latest arrivals</p>

      {/* FILTER PANEL */}
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '15px', marginBottom: '50px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>Search</label>
          <input type="text" placeholder="Search..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '200px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>Category</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>Collection</label>
          <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <option value="All">All</option><option value="Men">Men</option><option value="Women">Women</option><option value="Kids">Kids</option>
          </select>
        </div>
        <button onClick={() => {setCategoryFilter('All'); setGenderFilter('All'); setLocalSearch('');}} style={{ padding: '12px 25px', borderRadius: '8px', border: 'none', backgroundColor: '#1a1a1a', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Reset</button>
      </div>

      <div className="product-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card" style={{ position: 'relative', overflow: 'hidden', border: 'none', background: 'transparent' }}>
            {product.discountPrice && <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 5, backgroundColor: '#e74c3c', color: 'white', padding: '5px 12px', borderRadius: '5px', fontWeight: 'bold', fontSize: '11px' }}>SALE</div>}
            {product.isOutOfStock && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '320px', backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}><span style={{ backgroundColor: '#000', color: '#fff', padding: '8px 15px', borderRadius: '4px', fontWeight: 'bold' }}>OUT OF STOCK</span></div>}
            
            <button onClick={() => toggleFavorite(product.id)} style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 6, background: '#fff', border: 'none', borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {favorites.includes(product.id) ? '❤️' : '🤍'}
            </button>

            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ height: '320px', overflow: 'hidden', borderRadius: '12px', marginBottom: '15px' }}>
                <img src={product.imageUrl?.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '5px' }}>
                <p style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', margin: 0 }}>{product.Category?.name} • {product.department}</p>
                <h3 style={{ margin: '5px 0 10px 0', fontSize: '1.1rem', fontWeight: '600' }}>{product.name}</h3>
                {product.discountPrice ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#e74c3c', fontWeight: '800', fontSize: '1.2rem' }}>{product.discountPrice} kr</span>
                    <span style={{ textDecoration: 'line-through', color: '#bbb', fontSize: '0.9rem' }}>{product.price} kr</span>
                  </div>
                ) : <p style={{ fontWeight: '800', fontSize: '1.2rem', margin: 0 }}>{product.price} kr</p>}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
export default ProductList;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminProductList.css';
import API_URL from '../../api';

function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name'
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error("Kunde inte hämta produkter:", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Radera produkt? Detta tar bort alla bilder och varianter.")) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setProducts(products.filter(p => p.id !== id));
    } catch (err) { console.error(err); }
  };

  const getTotalStock = (variants) => {
    if (!variants || !Array.isArray(variants)) return 0;
    return variants.reduce((sum, v) => sum + Number(v.stock), 0);
  };

  const getStockStatusClass = (total) => {
    if (total === 0) return 'stock-out';
    if (total < 10) return 'stock-low';
    return 'stock-ok';
  };

  // Hämta unika kategorier för filter-dropdown
  const categories = ['All', ...new Set(products.map(p => p.Category?.name).filter(Boolean))];

  // FILTRERING OCH SORTERING
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(localSearch.toLowerCase()) || 
                            p.Brand?.name?.toLowerCase().includes(localSearch.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || p.Category?.name === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'oldest') return a.id - b.id;
      return b.id - a.id; // newest (standard)
    });

  if (loading) return <div className="container">Laddar lagerstatus...</div>;

  return (
    <div className="container" style={{ marginTop: '80px', maxWidth: '1400px' }}>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '2px', margin: 0 }}>INVENTORY</h1>
          <p style={{ color: '#999', fontSize: '12px' }}>{filteredProducts.length} MODELS VISIBLE</p>
        </div>
        <Link to="/admin/add-product" className="add-prod-link">
          + ADD NEW PRODUCT
        </Link>
      </div>

      {/* TOOLBAR FÖR FILTRERING OCH SÖK */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <input 
            type="text" 
            placeholder="Search name or brand..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        
        <div className="admin-filter-controls">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">LATEST ADDED</option>
            <option value="oldest">OLDEST</option>
            <option value="name">NAME (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="admin-list-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Product Details</th>
              <th>Price</th>
              <th>Category / Brand</th>
              <th>Stock Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => {
              const totalStock = getTotalStock(p.variants);
              return (
                <tr key={p.id}>
                  <td>
                    <div className="admin-prod-info-cell">
                      <img
                        src={p.imageUrl?.startsWith('http') ? p.imageUrl : `${API_URL}${p.imageUrl}`}
                        alt={p.name}
                        className="admin-prod-img"
                        onError={(e) => { e.target.src = 'https://placehold.co/100x130?text=Missing'; }}
                      />
                      <div>
                        <div className="admin-prod-name">{p.name.toUpperCase()}</div>
                        <div className="admin-prod-ref">REF: #{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="admin-price-display">
                      {p.discountPrice ? (
                        <>
                          <span className="admin-sale-price">{p.discountPrice} kr</span>
                          <span className="admin-old-price">{p.price} kr</span>
                        </>
                      ) : (
                        <span>{p.price} kr</span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '12px' }}>
                    <div style={{ fontWeight: 'bold' }}>{p.Category?.name || '—'}</div>
                    <div style={{ color: '#888' }}>{p.Brand?.name || '—'}</div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`stock-badge ${getStockStatusClass(totalStock)}`}>
                      {totalStock} UNITS
                    </span>
                    <div className="admin-variant-pills">
                      {p.variants?.map(v => (
                        <span key={v.id} className={v.stock === 0 ? 'pill-out' : ''}>
                          {v.size}:{v.stock}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="admin-action-cell">
                      <Link to={`/admin/edit-product/${p.id}`} className="admin-btn-edit">EDIT</Link>
                      <button onClick={() => handleDelete(p.id)} className="admin-btn-delete">DELETE</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminProductList;
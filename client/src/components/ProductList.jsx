import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Vi tar emot refreshFavorites som en prop för att kunna uppdatera navbaren
function ProductList({ onAddToCart, refreshFavorites }) {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('Alla');
  const [localSearch, setLocalSearch] = useState(''); 
  
  const userId = localStorage.getItem('userId');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    // Hämta produkter
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Kunde inte hämta produkter:", err));

    // Hämta favorit-ID:n för att veta vilka hjärtan som ska vara röda
    if (userId) {
      fetch(`http://localhost:5000/api/auth/favorites/details/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setFavorites(data.map(f => f.id));
          }
        })
        .catch(err => console.error("Favorit-fel:", err));
    }
  }, [userId]);

  const categories = ['Alla', ...new Set(products.map(p => 
    p.category || p.Category || p.category_name || p.type || p.kategori
  ).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const pCat = p.category || p.Category || p.category_name || p.type || p.kategori || '';
    const name = p.name || '';
    
    const matchesCategory = categoryFilter === 'Alla' || pCat === categoryFilter;
    const matchesSearch = name.toLowerCase().includes(localSearch.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = async (productId) => {
    if (!userId) return alert("Logga in först!");
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, userId })
      });
      
      if (res.ok) {
        // 1. Uppdatera lokalt state för hjärtat direkt
        setFavorites(prev => 
          prev.includes(productId) 
            ? prev.filter(id => id !== productId) 
            : [...prev, productId]
        );
        
        // 2. Anropa funktionen i App.jsx för att uppdatera navbaren
        if (refreshFavorites) {
          refreshFavorites();
        }
      }
    } catch (err) {
      console.error("Fel vid toggle:", err);
    }
  };

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Sortiment</h1>

      {/* FILTER-SEKTION */}
      <div style={{ 
        backgroundColor: '#f4f4f4', 
        padding: '20px', 
        borderRadius: '12px', 
        marginBottom: '30px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Sök i listan:</label>
          <input 
            type="text" 
            placeholder="Namn på produkt..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', width: '200px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Välj kategori:</label>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '150px' }}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <button 
          onClick={() => {setCategoryFilter('Alla'); setLocalSearch('');}}
          style={{ padding: '8px 15px', marginTop: '20px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #ccc' }}
        >
          Nollställ
        </button>
      </div>

      {/* PRODUKT-GRID */}
      <div className="product-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card" style={{ position: 'relative' }}>
            {/* HJÄRT-KNAPP (Ifyllt/Tomt) */}
            <button 
              onClick={() => toggleFavorite(product.id)} 
              className="fav-btn-circle"
              style={{
                position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                background: 'white', border: 'none', borderRadius: '50%',
                width: '35px', height: '35px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
              }}
            >
              {favorites.includes(product.id) ? '❤️' : '🤍'}
            </button>

            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <img 
                src={
                  product.imageUrl 
                    ? (product.imageUrl.startsWith('http') 
                        ? product.imageUrl 
                        : `http://localhost:5000${product.imageUrl}`)
                    : 'https://placehold.co/250x200?text=Bild+saknas'
                } 
                alt={product.name} 
                onError={(e) => { e.target.src = 'https://placehold.co/250x200?text=Bild+saknas'; }}
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <h3>{product.name}</h3>
              <p className="price">{product.price} kr</p>
            </Link>
            <button className="btn btn-primary btn-block" onClick={() => onAddToCart(product)}>Lägg i varukorg</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
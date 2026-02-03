import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import StatusModal from '../StatusModal/StatusModal';
import './ProductDetail.css';

function ProductDetail({ onAddToCart, refreshFavorites }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [modal, setModal] = useState({ open: false, msg: '', title: '', type: '', action: null });

  const userId = localStorage.getItem('userId');

  const getOptimizedImage = (url, width = 800) => {
    const placeholder = `https://placehold.co/${width}x${Math.round(width * 1.3)}/f0f0f0/999999?text=Bild+saknas`;
    if (!url || url === "" || url === "null" || url === "undefined") return placeholder;
    if (url.startsWith('http')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=${width}&fit=cover&errorimg=${encodeURIComponent(placeholder)}`;
    }
    return `http://localhost:5000${url}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);

        fetch('http://localhost:5000/api/products')
          .then(res => res.json())
          .then(all => {
            const filtered = all
              .filter(p => p.categoryId === data.categoryId && p.id !== data.id)
              .sort(() => 0.5 - Math.random())
              .slice(0, 4);
            setSimilarProducts(filtered);
          });
      }).catch(() => setLoading(false));

    if (userId) {
      fetch(`http://localhost:5000/api/auth/favorites/details/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setIsFavorite(data.some(f => f.id === parseInt(id)));
        });
    }
  }, [id, userId]);

  const handleFavoriteToggle = async () => {
    if (!userId) {
      setModal({ open: true, title: 'LOGGA IN', msg: 'Du måste vara inloggad.', type: 'error', action: () => navigate('/login') });
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, userId })
      });
      if (res.ok) {
        setIsFavorite(!isFavorite);
        if (refreshFavorites) refreshFavorites();
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading">Laddar...</div>;
  if (!product) return <div className="error">Hittades inte.</div>;

  // Räknar ut totalt lager från nya variants-tabellen
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
  const isOut = totalStock <= 0;

  return (
    <div className="product-detail-container">
      <div className="detail-nav">
        <button onClick={() => navigate(-1)} className="back-nav-btn">← TILLBAKA</button>
      </div>

      <div className="main-content-card">
        <div className="image-side">
          <img
            src={getOptimizedImage(product.imageUrl)}
            alt={product.name}
            className={isOut ? 'out-img' : ''}
            onError={(e) => { e.target.src = `https://placehold.co/600x800/f0f0f0/999999?text=Bild+saknas`; }}
          />
          {isOut && <div className="soldout-overlay"><span>SLUTSÅLD</span></div>}
          {product.discountPrice && !isOut && <div className="sale-tag">SALE</div>}
        </div>

        <div className="info-side">
          <span className="dept-label">{product.department}</span>
          <span className="spec-label" style={{ fontSize: '14px', marginBottom: '5px', display: 'block' }}>
            {product.Brand?.name || "DESIGNER"}
          </span>
          <h1 className="prod-title">{product.name}</h1>
          <p className="prod-desc">{product.description}</p>

          <div className="product-specs-container">
            <div className="spec-row">
              <span className="spec-label">FÄRG:</span>
              <span className="spec-value">{product.color || 'Klassisk'}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">MATERIAL:</span>
              <span className="spec-value">{product.Material?.name || 'Premium Mix'}</span>
            </div>

            {product.isSportswear && (
              <div className="sport-badge">
                <span className="bolt-icon">⚡</span> TRÄNINGSKLÄDER
              </div>
            )}
          </div>

          <div className="price-row">
            {product.discountPrice ? (
              <>
                <span className="prod-title new-price" style={{ margin: 0 }}>{product.discountPrice} kr</span>
                <span className="old-price-strike">{product.price} kr</span>
              </>
            ) : (
              <span className="prod-title" style={{ margin: 0 }}>{product.price} kr</span>
            )}
          </div>

          {!isOut && (
            <>
              <span className="label">VÄLJ STORLEK:</span>
              <div className="size-grid">
                {product.variants?.map(v => (
                  <button
                    key={v.id}
                    disabled={v.stock <= 0}
                    className={`size-btn ${selectedSize === v.size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(v.size)}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="button-group">
            <button
              className="buy-btn"
              disabled={isOut || !selectedSize}
              onClick={() => onAddToCart(product, selectedSize)}
            >
              {isOut ? 'SLUTSÅLD' : (selectedSize ? 'LÄGG I VARUKORG' : 'VÄLJ STORLEK')}
            </button>

            <button onClick={handleFavoriteToggle} className="fav-inline-btn">
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="similar-section">
          <h2 className="similar-title">DU KANSKE OCKSÅ GILLAR</h2>
          <div className="similar-grid">
            {similarProducts.map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="product-card-new">
                <img
                  src={getOptimizedImage(p.imageUrl, 400)}
                  alt={p.name}
                  onError={(e) => { e.target.src = `https://placehold.co/400x500/f0f0f0/999999?text=Bild+saknas`; }}
                />
                <div className="product-info">
                  <h3>{p.name}</h3>
                  <p className="price">{p.price} kr</p>
                </div>
              </Link>
            ))}
          </div>
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
  );
}

export default ProductDetail;
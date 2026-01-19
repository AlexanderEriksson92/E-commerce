import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css'; // Vi återanvänder den snygga form-stylingen

function AddProduct() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [image, setImage] = useState(null);
  
  // NYA TILLSTÅND FÖR LAGER OCH REA
  const [stock, setStock] = useState(0);
  const [discountPrice, setDiscountPrice] = useState('');

  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const bRes = await fetch('http://localhost:5000/api/admin/brands');
      const cRes = await fetch('http://localhost:5000/api/admin/categories');
      if (bRes.ok) setAvailableBrands(await bRes.json());
      if (cRes.ok) setAvailableCategories(await cRes.json());
    } catch (err) {
      console.error("Kunde inte hämta filter:", err);
    }
  };

  const handleQuickAdd = async (type, value, setter, toggle) => {
    if (!value) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/${type}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') 
        },
        body: JSON.stringify({ name: value })
      });

      if (res.ok) {
        await fetchFilters();
        setter('');
        toggle(false);
        if (type === 'brands') setBrand(value);
        else setCategory(value);
      }
    } catch (err) {
      alert("Serverfel");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('brand', brand);
    formData.append('imageFile', image); // Viktigt: Matcha namnet med backend 'imageFile'
    
    // SKICKA MED LAGER OCH REA
    formData.append('stock', stock);
    if (discountPrice) {
      formData.append('discountPrice', discountPrice);
    }

    const response = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Authorization': localStorage.getItem('token') },
      body: formData,
    });

    if (response.ok) {
      alert('Produkt tillagd!');
      navigate('/');
    }
  };

  return (
    <div className="reg-page-container">
      <div className="reg-form-card" style={{ maxWidth: '700px' }}>
        <h2>Lägg till ny produkt</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="reg-form-group">
            <label>Produktnamn</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          {/* RAD FÖR PRIS OCH REA */}
          <div className="reg-form-row">
            <div className="reg-form-group">
              <label>Ordinarie Pris (kr)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="reg-form-group">
              <label>Reapris (valfritt)</label>
              <input 
                type="number" 
                placeholder="Ex: 199" 
                value={discountPrice} 
                onChange={(e) => setDiscountPrice(e.target.value)} 
              />
            </div>
          </div>

          {/* RAD FÖR LAGER OCH MÄRKE */}
          <div className="reg-form-row">
            <div className="reg-form-group">
              <label>Antal i lager</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
            </div>
            
            <div className="reg-form-group">
              <label>Märke</label>
              <div style={{ display: 'flex', gap: '5px' }}>
                <select value={brand} onChange={(e) => setBrand(e.target.value)} required style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
                  <option value="">Välj...</option>
                  {availableBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
                <button type="button" className="reg-btn-primary" style={{ width: '45px', padding: '0' }} onClick={() => setShowAddBrand(!showAddBrand)}>
                  {showAddBrand ? '✕' : '+'}
                </button>
              </div>
            </div>
          </div>

          {/* SNABB-LÄGG-TILL MÄRKE */}
          {showAddBrand && (
            <div className="reg-form-group" style={{ background: '#f9f9f9', padding: '10px', borderRadius: '10px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <input type="text" placeholder="Nytt märke..." value={newBrandName} onChange={e => setNewBrandName(e.target.value)} />
                <button type="button" className="reg-btn-primary" style={{ width: 'auto', padding: '0 15px' }} onClick={() => handleQuickAdd('brands', newBrandName, setNewBrandName, setShowAddBrand)}>Spara</button>
              </div>
            </div>
          )}

          <div className="reg-form-group">
            <label>Kategori</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
                <option value="">Välj kategori...</option>
                {availableCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <button type="button" className="reg-btn-primary" style={{ width: '45px', padding: '0' }} onClick={() => setShowAddCategory(!showAddCategory)}>
                {showAddCategory ? '✕' : '+'}
              </button>
            </div>
          </div>

          {/* SNABB-LÄGG-TILL KATEGORI */}
          {showAddCategory && (
            <div className="reg-form-group" style={{ background: '#f9f9f9', padding: '10px', borderRadius: '10px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <input type="text" placeholder="Ny kategori..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                <button type="button" className="reg-btn-primary" style={{ width: 'auto', padding: '0 15px' }} onClick={() => handleQuickAdd('categories', newCategoryName, setNewCategoryName, setShowAddCategory)}>Spara</button>
              </div>
            </div>
          )}

          <div className="reg-form-group">
            <label>Beskrivning</label>
            <textarea rows="3" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="reg-form-group">
            <label>Produktbild</label>
            <input type="file" onChange={(e) => setImage(e.target.files[0])} required />
          </div>

          <button type="submit" className="reg-btn-primary" style={{ marginTop: '20px' }}>
            Publicera produkt 🚀
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
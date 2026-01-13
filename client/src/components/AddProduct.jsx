import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AddProduct() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [image, setImage] = useState(null);
  
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  
  // Tillstånd för "snabb-lägg-till" fälten
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
        await fetchFilters(); // Uppdatera listan
        setter(''); // Töm fältet
        toggle(false); // Stäng lilla rutan
        // Sätt automatiskt det nyss skapade valet som valt i dropdownen
        if (type === 'brands') setBrand(value);
        else setCategory(value);
      } else {
        alert("Kunde inte lägga till. Kanske finns det redan?");
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
    formData.append('image', image);

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
    <div className="container">
      <div className="form-card">
        <h2>Lägg till produkt</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Produktnamn</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Pris (kr)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>

          {/* MÄRKE MED SNABBVAL */}
          <div className="form-group">
            <label>Märke</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={brand} onChange={(e) => setBrand(e.target.value)} required>
                <option value="">Välj märke...</option>
                {availableBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
              <button type="button" className="btn btn-warning" onClick={() => setShowAddBrand(!showAddBrand)}>
                {showAddBrand ? '✕' : '+'}
              </button>
            </div>
            {showAddBrand && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                <input type="text" placeholder="Nytt märke..." value={newBrandName} onChange={e => setNewBrandName(e.target.value)} />
                <button type="button" className="btn btn-primary" onClick={() => handleQuickAdd('brands', newBrandName, setNewBrandName, setShowAddBrand)}>Spara</button>
              </div>
            )}
          </div>

          {/* KATEGORI MED SNABBVAL */}
          <div className="form-group">
            <label>Kategori</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="">Välj kategori...</option>
                {availableCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <button type="button" className="btn btn-warning" onClick={() => setShowAddCategory(!showAddCategory)}>
                {showAddCategory ? '✕' : '+'}
              </button>
            </div>
            {showAddCategory && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                <input type="text" placeholder="Ny kategori..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                <button type="button" className="btn btn-primary" onClick={() => handleQuickAdd('categories', newCategoryName, setNewCategoryName, setShowAddCategory)}>Spara</button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Beskrivning</label>
            <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Produktbild</label>
            <input type="file" onChange={(e) => setImage(e.target.files[0])} required />
          </div>

          <button type="submit" className="btn btn-primary btn-block">Spara produkt</button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddProduct.css';
import API_URL from '../../api';

function AddProduct() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [department, setDepartment] = useState('Unisex');
  const [discountPrice, setDiscountPrice] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [isSportswear, setIsSportswear] = useState(false);

  // Bild-hantering: Fil eller URL
  const [imageSource, setImageSource] = useState('file'); // 'file' eller 'url'
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  // Inventory med fixad layout-state
  const [inventory, setInventory] = useState({
    "XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0
  });

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
      const bRes = await fetch('http://${API_URL}/api/admin/brands');
      const cRes = await fetch('http://${API_URL}/api/admin/categories');
      if (bRes.ok) setAvailableBrands(await bRes.json());
      if (cRes.ok) setAvailableCategories(await cRes.json());
    } catch (err) { console.error(err); }
  };

  const handleInventoryChange = (size, value) => {
    setInventory(prev => ({
      ...prev,
      [size]: parseInt(value) || 0
    }));
  };

  const handleQuickAdd = async (type, value, setter, toggle) => {
    if (!value) return;
    try {
      const res = await fetch(`http://${API_URL}/api/admin/${type}`, {
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
      }
    } catch (err) { alert("Serverfel"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('department', department);
    formData.append('inventory', JSON.stringify(inventory));
    formData.append('color', color);
    formData.append('material', material);
    formData.append('isSportswear', isSportswear);
    if (discountPrice) formData.append('discountPrice', discountPrice);

    const selectedCat = availableCategories.find(c => c.name === category);
    const selectedBrand = availableBrands.find(b => b.name === brand);
    if (selectedCat) formData.append('categoryId', selectedCat.id);
    if (selectedBrand) formData.append('brandId', selectedBrand.id);

    // Hantera bildval
    if (imageSource === 'file' && imageFile) {
      formData.append('imageFile', imageFile);
    } else if (imageSource === 'url' && imageUrl) {
      formData.append('imageUrl', imageUrl);
    } else {
      alert("Vänligen välj en bild eller ange en länk.");
      return;
    }

    const response = await fetch('http://${API_URL}/api/products', {
      method: 'POST',
      headers: { 'Authorization': localStorage.getItem('token') },
      body: formData,
    });

    if (response.ok) {
      alert('Produkt tillagd!');
      navigate('/admin/products');
    }
  };

  return (
    <div className="reg-page-container">
      <div className="reg-form-card" style={{ maxWidth: '800px' }}>
        <h2 style={{ letterSpacing: '2px', fontWeight: '900', textTransform: 'uppercase', fontSize: '18px' }}>
          Add New Product
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="reg-form-group">
            <label>Product Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="reg-form-row">
            <div className="reg-form-group">
              <label>Original Price (SEK)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="reg-form-group">
              <label>Discount Price (Optional)</label>
              <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} />
            </div>
          </div>

          {/* INVENTORY SECTION - FIXAD LAYOUT */}
          <div style={{ background: '#f8f8f8', padding: '20px', borderRadius: '15px', marginBottom: '25px', border: '1px solid #eee' }}>
            <label style={{ fontWeight: '900', fontSize: '10px', letterSpacing: '1px', display: 'block', marginBottom: '15px', color: '#666' }}>
              STOCK LEVELS PER SIZE
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {Object.keys(inventory).map(size => (
                <div key={size} style={{ textAlign: 'center', flex: '1 1 60px', minWidth: '60px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '700', display: 'block' }}>{size}</label>
                  <input
                    type="number"
                    min="0"
                    value={inventory[size]}
                    onChange={(e) => handleInventoryChange(size, e.target.value)}
                    style={{ textAlign: 'center', padding: '8px 0', marginTop: '5px', width: '100%', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="reg-form-row">
            <div className="reg-form-group">
              <label>Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} style={selectStyle}>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            <div className="reg-form-group">
              <label>Brand</label>
              <div style={{ display: 'flex', gap: '5px' }}>
                <select value={brand} onChange={(e) => setBrand(e.target.value)} required style={{ ...selectStyle, flex: 1 }}>
                  <option value="">Select...</option>
                  {availableBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
                <button type="button" className="reg-btn-primary" style={{ width: '45px', padding: '0' }} onClick={() => setShowAddBrand(!showAddBrand)}>
                  {showAddBrand ? '✕' : '+'}
                </button>
              </div>
            </div>
          </div>

          {showAddBrand && (
            <div style={quickAddBox}>
              <input type="text" placeholder="New Brand..." value={newBrandName} onChange={e => setNewBrandName(e.target.value)} style={{ flex: 1, padding: '8px' }} />
              <button type="button" onClick={() => handleQuickAdd('brands', newBrandName, setNewBrandName, setShowAddBrand)} style={{ padding: '8px 15px' }}>Save</button>
            </div>
          )}
          <div className="reg-form-row">
            <div className="reg-form-group">
              <label>Color</label>
              <input type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. Navy Blue" />
            </div>
            <div className="reg-form-group">
              <label>Material</label>
              <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="e.g. 100% Wool" />
            </div>
          </div>

          <div className="reg-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <input
              type="checkbox"
              checked={isSportswear}
              onChange={(e) => setIsSportswear(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <label style={{ marginBottom: 0 }}>Mark as Sportswear / Träningskläder</label>
          </div>
          <div className="reg-form-group">
            <label>Category</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required style={{ ...selectStyle, flex: 1 }}>
                <option value="">Select Category...</option>
                {availableCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <button type="button" className="reg-btn-primary" style={{ width: '45px', padding: '0' }} onClick={() => setShowAddCategory(!showAddCategory)}>
                {showAddCategory ? '✕' : '+'}
              </button>
            </div>
          </div>

          {showAddCategory && (
            <div style={quickAddBox}>
              <input type="text" placeholder="New Category..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} style={{ flex: 1, padding: '8px' }} />
              <button type="button" onClick={() => handleQuickAdd('categories', newCategoryName, setNewCategoryName, setShowAddCategory)} style={{ padding: '8px 15px' }}>Save</button>
            </div>
          )}

          <div className="reg-form-group">
            <label>Description</label>
            <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
          </div>

          {/* BILDHANTERING SEKTION */}
          <div style={{ background: '#f0f4f8', padding: '20px', borderRadius: '15px', marginBottom: '25px' }}>
            <label style={{ fontWeight: '900', fontSize: '10px', display: 'block', marginBottom: '10px' }}>PRODUCT IMAGE</label>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <input type="radio" checked={imageSource === 'file'} onChange={() => setImageSource('file')} /> Upload File
              </label>
              <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <input type="radio" checked={imageSource === 'url'} onChange={() => setImageSource('url')} /> Image URL
              </label>
            </div>

            {imageSource === 'file' ? (
              <input type="file" onChange={(e) => setImageFile(e.target.files[0])} />
            ) : (
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            )}

            {/* Preview av bilden */}
            {(imageUrl && imageSource === 'url') && (
              <div style={{ marginTop: '10px' }}>
                <img src={imageUrl} alt="Preview" style={{ height: '80px', borderRadius: '8px' }} onError={(e) => e.target.src = 'https://placehold.co/80x80?text=Invalid+URL'} />
              </div>
            )}
          </div>

          <button type="submit" className="reg-btn-primary" style={{ width: '100%', padding: '15px', fontWeight: '900', fontSize: '14px' }}>
            PUBLISH PRODUCT
          </button>
        </form>
      </div>
    </div>
  );
}

const selectStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #ddd', background: '#fff', width: '100%' };
const quickAddBox = { display: 'flex', gap: '5px', background: '#eee', padding: '10px', borderRadius: '10px', marginBottom: '15px' };

export default AddProduct;
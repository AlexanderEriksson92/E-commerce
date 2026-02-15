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

  const [imageSource, setImageSource] = useState('file');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const [inventory, setInventory] = useState({
    "XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0
  });

  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);

  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddColor, setShowAddColor] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const [bRes, cRes, colRes, matRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/brands`),
        fetch(`${API_URL}/api/admin/categories`),
        fetch(`${API_URL}/api/admin/colors`),
        fetch(`${API_URL}/api/admin/materials`)
      ]);
      
      if (bRes.ok) setAvailableBrands(await bRes.json());
      if (cRes.ok) setAvailableCategories(await cRes.json());
      if (colRes.ok) setAvailableColors(await colRes.json());
      if (matRes.ok) setAvailableMaterials(await matRes.json());
    } catch (err) { console.error("Error fetching filters:", err); }
  };

  const handleInventoryChange = (size, value) => {
    setInventory(prev => ({ ...prev, [size]: parseInt(value) || 0 }));
  };

  const handleQuickAdd = async (type, value, setter, toggle) => {
    if (!value) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: value })
      });
      if (res.ok) {
        await fetchFilters();
        setter('');
        toggle(false);
      }
    } catch (err) { alert("Server error"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('department', department);
    formData.append('inventory', JSON.stringify(inventory));
    formData.append('isSportswear', isSportswear);
    if (discountPrice) formData.append('discountPrice', discountPrice);

    const selectedCat = availableCategories.find(c => c.name === category);
    const selectedBrand = availableBrands.find(b => b.name === brand);
    const selectedColor = availableColors.find(c => c.name === color);
    const selectedMaterial = availableMaterials.find(m => m.name === material);

    if (selectedCat) formData.append('categoryId', selectedCat.id);
    if (selectedBrand) formData.append('brandId', selectedBrand.id);
    if (selectedColor) formData.append('color', selectedColor.name); 
    if (selectedMaterial) formData.append('materialId', selectedMaterial.id);

    if (imageSource === 'file' && imageFile) {
      formData.append('imageFile', imageFile);
    } else if (imageSource === 'url' && imageUrl) {
      formData.append('imageUrl', imageUrl);
    } else {
      alert("Please select an image.");
      return;
    }

    const response = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    if (response.ok) {
      alert('Product added successfully!');
      navigate('/admin/products');
    }
  };

  return (
    <div className="reg-page-container">
      <div className="reg-form-card">
        <h2 className="reg-form-title">Add New Product</h2>

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

          <div className="inventory-section">
            <label className="section-label">STOCK LEVELS PER SIZE</label>
            <div className="inventory-grid">
              {Object.keys(inventory).map(size => (
                <div key={size} className="inventory-item">
                  <label>{size}</label>
                  <input
                    type="number" min="0" value={inventory[size]}
                    onChange={(e) => handleInventoryChange(size, e.target.value)}
                    className="inventory-input"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="reg-form-row">
            <div className="reg-form-group">
              <label>Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="reg-select">
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            <div className="reg-form-group">
              <label>Brand</label>
              <div className="quick-add-wrapper">
                <select value={brand} onChange={(e) => setBrand(e.target.value)} required className="reg-select">
                  <option value="">Select...</option>
                  {availableBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
                <button type="button" className="plus-btn" onClick={() => setShowAddBrand(!showAddBrand)}>
                  {showAddBrand ? '✕' : '+'}
                </button>
              </div>
            </div>
          </div>
          {showAddBrand && (
            <div className="quick-add-box">
              <input type="text" placeholder="New Brand..." value={newBrandName} onChange={e => setNewBrandName(e.target.value)} />
              <button type="button" onClick={() => handleQuickAdd('brands', newBrandName, setNewBrandName, setShowAddBrand)}>Save</button>
            </div>
          )}

          <div className="reg-form-row">
            <div className="reg-form-group">
              <label>Color</label>
              <div className="quick-add-wrapper">
                <select value={color} onChange={(e) => setColor(e.target.value)} required className="reg-select">
                  <option value="">Select...</option>
                  {availableColors.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <button type="button" className="plus-btn" onClick={() => setShowAddColor(!showAddColor)}>
                  {showAddColor ? '✕' : '+'}
                </button>
              </div>
            </div>

            <div className="reg-form-group">
              <label>Material</label>
              <div className="quick-add-wrapper">
                <select value={material} onChange={(e) => setMaterial(e.target.value)} required className="reg-select">
                  <option value="">Select...</option>
                  {availableMaterials.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
                <button type="button" className="plus-btn" onClick={() => setShowAddMaterial(!showAddMaterial)}>
                  {showAddMaterial ? '✕' : '+'}
                </button>
              </div>
            </div>
          </div>
          {showAddColor && (
            <div className="quick-add-box">
              <input type="text" placeholder="New Color..." value={newColorName} onChange={e => setNewColorName(e.target.value)} />
              <button type="button" onClick={() => handleQuickAdd('colors', newColorName, setNewColorName, setShowAddColor)}>Save</button>
            </div>
          )}
          {showAddMaterial && (
            <div className="quick-add-box">
              <input type="text" placeholder="New Material..." value={newMaterialName} onChange={e => setNewMaterialName(e.target.value)} />
              <button type="button" onClick={() => handleQuickAdd('materials', newMaterialName, setNewMaterialName, setShowAddMaterial)}>Save</button>
            </div>
          )}

          <div className="sportswear-toggle">
            <input type="checkbox" checked={isSportswear} onChange={(e) => setIsSportswear(e.target.checked)} />
            <label>Mark as Sportswear</label>
          </div>

          <div className="reg-form-group">
            <label>Category</label>
            <div className="quick-add-wrapper">
              <select value={category} onChange={(e) => setCategory(e.target.value)} required className="reg-select">
                <option value="">Select Category...</option>
                {availableCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <button type="button" className="plus-btn" onClick={() => setShowAddCategory(!showAddCategory)}>
                {showAddCategory ? '✕' : '+'}
              </button>
            </div>
          </div>
          {showAddCategory && (
            <div className="quick-add-box">
              <input type="text" placeholder="New Category..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
              <button type="button" onClick={() => handleQuickAdd('categories', newCategoryName, setNewCategoryName, setShowAddCategory)}>Save</button>
            </div>
          )}

          <div className="reg-form-group">
            <label>Description</label>
            <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required className="reg-textarea" />
          </div>

          <div className="image-upload-section">
            <label className="section-label">PRODUCT IMAGE</label>
            <div className="image-source-toggles">
              <label className="radio-label"><input type="radio" checked={imageSource === 'file'} onChange={() => setImageSource('file')} /> Upload File</label>
              <label className="radio-label"><input type="radio" checked={imageSource === 'url'} onChange={() => setImageSource('url')} /> Image URL</label>
            </div>

            {imageSource === 'file' ? (
              <input type="file" onChange={(e) => setImageFile(e.target.files[0])} className="file-input" />
            ) : (
              <input type="text" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="url-input" />
            )}

            {(imageUrl && imageSource === 'url') && (
              <div className="image-preview">
                <img src={imageUrl} alt="Preview" onError={(e) => e.target.src = 'https://placehold.co/80x80?text=Invalid+URL'} />
              </div>
            )}
          </div>

          <button type="submit" className="publish-btn">PUBLISH PRODUCT</button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
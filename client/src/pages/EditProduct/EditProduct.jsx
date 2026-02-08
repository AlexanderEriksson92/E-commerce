import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusModal from '../../components/StatusModal/StatusModal';
import '../../styles/FormStyles.css';
import './EditProduct.css';
import API_URL from '../../api';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

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
  const [inventory, setInventory] = useState({ "XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0, "ONESIZE": 0 });

  // NYA STATES FÖR FLERA BILDER
  const [images, setImages] = useState([]); // Innehåller { url, file, isExisting, preview }
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [urlInput, setUrlInput] = useState(''); // STATE FÖR URL-INPUT

  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  
  const [modal, setModal] = useState({ open: false, msg: '', title: '', type: 'success' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const [bRes, cRes, colRes, matRes, pRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/brands`).then(r => r.json()).catch(() => []),
          fetch(`${API_URL}/api/admin/categories`).then(r => r.json()).catch(() => []),
          fetch(`${API_URL}/api/admin/colors`).then(r => r.json()).catch(() => []),
          fetch(`${API_URL}/api/admin/materials`).then(r => r.json()).catch(() => []),
          fetch(`${API_URL}/api/products/${id}`).then(r => r.json())
        ]);

        setAvailableBrands(bRes);
        setAvailableCategories(cRes);
        setAvailableColors(colRes);
        setAvailableMaterials(matRes);

        if (pRes) {
          setName(pRes.name || '');
          setPrice(pRes.price || '');
          setDescription(pRes.description || '');
          setDepartment(pRes.department || 'Unisex');
          setDiscountPrice(pRes.discountPrice || '');
          setIsSportswear(pRes.isSportswear || false);
          setColor(pRes.Color?.name || pRes.color || '');
          setMaterial(pRes.Material?.name || pRes.material || '');
          setBrand(pRes.Brand?.name || '');
          setCategory(pRes.Category?.name || '');

          if (pRes.images && pRes.images.length > 0) {
            setImages(pRes.images.map(img => ({ 
              url: img.imageUrl, 
              isExisting: true 
            })));
            const mainIdx = pRes.images.findIndex(img => img.isMain);
            setMainImageIndex(mainIdx >= 0 ? mainIdx : 0);
          }

          if (pRes.variants && Array.isArray(pRes.variants)) {
            const invObj = { "XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0, "ONESIZE": 0 };
            pRes.variants.forEach(v => { invObj[v.size] = v.stock; });
            setInventory(invObj);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // LÄGG TILL BILD VIA URL
  const handleAddImageUrl = () => {
    if (!urlInput) return;
    if (images.length >= 5) {
      alert("Max 5 bilder totalt.");
      return;
    }
    setImages([...images, { url: urlInput, isExisting: true }]);
    setUrlInput('');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      alert("Max 5 bilder totalt.");
      return;
    }
    const newImages = files.map(file => ({
      file: file,
      preview: URL.createObjectURL(file),
      isExisting: false
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (idx) => {
    const updated = images.filter((_, i) => i !== idx);
    setImages(updated);
    if (mainImageIndex >= updated.length) setMainImageIndex(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('department', department);
    formData.append('discountPrice', discountPrice === '' ? 'null' : discountPrice);
    formData.append('color', color);
    formData.append('material', material);
    formData.append('isSportswear', isSportswear);
    formData.append('inventory', JSON.stringify(inventory));
    formData.append('mainImageIndex', mainImageIndex);
    
    const selectedCat = availableCategories.find(c => c.name === category);
    const selectedBrand = availableBrands.find(b => b.name === brand);
    if (selectedCat) formData.append('categoryId', selectedCat.id);
    if (selectedBrand) formData.append('brandId', selectedBrand.id);

    images.forEach((img) => {
      if (!img.isExisting) {
        formData.append('imageFiles', img.file);
      } else {
        formData.append('existingImages', img.url);
      }
    });

    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': token },
        body: formData,
      });
      if (response.ok) {
        setModal({ open: true, title: 'SUCCESS', msg: 'Product updated!', type: 'success' });
        setTimeout(() => navigate('/admin'), 1500);
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="form-card edit-card-custom">
      <div className="edit-header-section">
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
          PRODUCT IMAGES (Click to set Main)
        </label>
        
        <div className="image-grid-edit">
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className={`image-preview-wrapper ${mainImageIndex === idx ? 'main-selected' : ''}`}
              onClick={() => setMainImageIndex(idx)}
            >
              <img 
                src={img.isExisting ? (img.url.startsWith('http') ? img.url : `${API_URL}${img.url}`) : img.preview} 
                alt="Preview" 
              />
              <button type="button" className="remove-img-btn" onClick={(e) => { e.stopPropagation(); removeImage(idx); }}>×</button>
              {mainImageIndex === idx && <span className="main-badge">MAIN</span>}
            </div>
          ))}
          {images.length < 5 && <div className="no-images-placeholder">Slot {images.length + 1} Available</div>}
        </div>

        <div className="image-edit-inputs">
          {/* URL INPUT - ÅTERINFÖRD */}
          <div className="form-group">
            <label>Add Image via URL</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                className="edit-input-field" 
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <button type="button" className="btn-add-url" onClick={handleAddImageUrl}>ADD</button>
            </div>
          </div>

          <div className="form-group">
            <label>Upload New Images (Max 5 total)</label>
            <input type="file" multiple onChange={handleFileChange} accept="image/*" />
          </div>
        </div>

        <div className="form-group">
          <label>Product Name</label>
          <input type="text" className="edit-input-field" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select className="edit-input-field" value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">Select Category...</option>
            {availableCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="header-options-under-image">
          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <select className="edit-input-field" value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
            <div className="form-group">
              <label>Brand</label>
              <select className="edit-input-field" value={brand} onChange={(e) => setBrand(e.target.value)} required>
                <option value="">Select Brand...</option>
                {availableBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Color</label>
            <select className="edit-input-field" value={color} onChange={(e) => setColor(e.target.value)}>
              <option value="">Select Color...</option>
              {availableColors.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Material</label>
            <select className="edit-input-field" value={material} onChange={(e) => setMaterial(e.target.value)}>
              <option value="">Select Material...</option>
              {availableMaterials.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>
        </div>

        <div className="sportswear-row">
          <input type="checkbox" checked={isSportswear} onChange={(e) => setIsSportswear(e.target.checked)} id="sportswear" />
          <label htmlFor="sportswear" style={{ marginBottom: 0 }}>Sportswear Product</label>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price</label>
            <input type="number" className="edit-input-field" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Discount Price</label>
            <input type="number" className="edit-input-field" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} />
          </div>
        </div>

        <div className="inventory-container">
          <label>STOCK</label>
          <div className="inventory-flex">
            {Object.keys(inventory).map(size => (
              <div key={size} className="inventory-box">
                <label>{size}</label>
                <input 
                  type="number" 
                  value={inventory[size]} 
                  onChange={(e) => setInventory({...inventory, [size]: parseInt(e.target.value) || 0})} 
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea className="edit-input-field" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div className="edit-actions-custom">
          <button type="submit" className="btn-submit">SAVE CHANGES</button>
          <button type="button" className="btn-cancel-custom" onClick={() => navigate(-1)}>CANCEL</button>
        </div>
      </form>
      <StatusModal isOpen={modal.open} title={modal.title} message={modal.msg} type={modal.type} onClose={() => setModal({ ...modal, open: false })} />
    </div>
  );
}

export default EditProduct;
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
  const [currentImage, setCurrentImage] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [isSportswear, setIsSportswear] = useState(false);
  const [inventory, setInventory] = useState({ "XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0 });
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [modal, setModal] = useState({ open: false, msg: '', title: '', type: 'success' });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const [bRes, cRes, pRes] = await Promise.all([
          fetch('http://${API_URL}/api/admin/brands'),
          fetch('http://${API_URL}/api/admin/categories'),
          fetch(`http://${API_URL}/api/products/${id}`)
        ]);
        const brandsData = await bRes.json();
        const catsData = await cRes.json();
        const p = await pRes.json();

        setAvailableBrands(brandsData);
        setAvailableCategories(catsData);
        setName(p.name); setPrice(p.price); setDescription(p.description);
        setDepartment(p.department || 'Unisex'); setDiscountPrice(p.discountPrice || '');
        setCurrentImage(p.imageUrl); setColor(p.color || ''); setMaterial(p.material || '');
        setIsSportswear(p.isSportswear || false);
        if (p.inventory) setInventory(p.inventory);
        if (p.Brand) setBrand(p.Brand.name);
        if (p.Category) setCategory(p.Category.name);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [id]);

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
    
    const selectedCat = availableCategories.find(c => c.name === category);
    const selectedBrand = availableBrands.find(b => b.name === brand);
    if (selectedCat) formData.append('categoryId', selectedCat.id);
    if (selectedBrand) formData.append('brandId', selectedBrand.id);

    if (newImage) formData.append('imageFile', newImage);
    else formData.append('imageUrl', currentImage);

    try {
      const response = await fetch(`http://${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': token },
        body: formData,
      });
      if (response.ok) {
        setModal({ open: true, title: 'KLART', msg: 'Produkten har uppdaterats!', type: 'success' });
        setTimeout(() => setModal(prev => ({ ...prev, open: false })), 2000);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="form-page-container">
      <div className="form-card edit-card-custom">
        <h2 className="edit-title-custom">Edit Product #{id}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input type="text" className="edit-input-field" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Color</label>
              <input type="text" className="edit-input-field" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Material</label>
              <input type="text" className="edit-input-field" value={material} onChange={(e) => setMaterial(e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" checked={isSportswear} onChange={(e) => setIsSportswear(e.target.checked)} style={{ width: '20px', height: '20px' }} />
            <label style={{ marginBottom: 0 }}>Träningskläder</label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (SEK)</label>
              <input type="number" className="edit-input-field" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Discount Price</label>
              <input type="number" className="edit-input-field" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} />
            </div>
          </div>

          <div className="inventory-container-custom">
            <label className="inventory-label-custom">LAGERSALDO</label>
            <div className="inventory-flex-custom">
              {Object.keys(inventory).map(size => (
                <div key={size} className="inventory-box-custom">
                  <label>{size}</label>
                  <input type="number" value={inventory[size]} onChange={(e) => setInventory({...inventory, [size]: parseInt(e.target.value) || 0})} />
                </div>
              ))}
            </div>
          </div>

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

          <div className="form-group">
            <label>Category</label>
            <select className="edit-input-field" value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="">Select Category...</option>
              {availableCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea className="edit-input-field" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} required style={{ height: 'auto' }} />
          </div>

          <div className="form-group">
            <label>Image</label>
            <div className="preview-box-custom">
              <img src={newImage ? URL.createObjectURL(newImage) : currentImage} alt="Preview" />
            </div>
            <input type="text" className="edit-input-field" value={currentImage} onChange={(e) => setCurrentImage(e.target.value)} style={{ marginBottom: '10px' }} />
            <input type="file" onChange={(e) => setNewImage(e.target.files[0])} />
          </div>

          <div className="edit-actions-custom">
            <button type="submit" className="btn-submit" style={{ flex: 2 }}>SAVE CHANGES</button>
            <button type="button" className="btn-cancel-custom" onClick={() => navigate(-1)}>CANCEL</button>
          </div>
        </form>
      </div>

      <StatusModal isOpen={modal.open} title={modal.title} message={modal.msg} type={modal.type} onClose={() => setModal({ ...modal, open: false })} />
    </div>
  );
}

export default EditProduct;
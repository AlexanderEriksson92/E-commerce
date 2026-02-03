import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/FormStyles.css';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // States för produkten
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

  // Inventory state (matchar din JSONB-modell)
  const [inventory, setInventory] = useState({
    "XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0
  });

  // Filter states
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Hämta märke/kategori-listor
        const bRes = await fetch('http://localhost:5000/api/admin/brands');
        const cRes = await fetch('http://localhost:5000/api/admin/categories');
        const brandsData = await bRes.json();
        const catsData = await cRes.json();
        setAvailableBrands(brandsData);
        setAvailableCategories(catsData);

        // Hämta produktens nuvarande data
        const pRes = await fetch(`http://localhost:5000/api/products/${id}`);
        const p = await pRes.json();

        setName(p.name);
        setPrice(p.price);
        setDescription(p.description);
        setDepartment(p.department || 'Unisex');
        setDiscountPrice(p.discountPrice || '');
        setCurrentImage(p.imageUrl);
        setColor(p.color || '');
        setMaterial(p.material || '');
        setIsSportswear(p.isSportswear || false);

        // Sätt inventory om det finns, annars behåll default
        if (p.inventory) {
          setInventory(p.inventory);
        }

        // Matcha märke och kategori namn för select-boxarna
        if (p.Brand) setBrand(p.Brand.name);
        if (p.Category) setCategory(p.Category.name);

      } catch (err) {
        console.error("Kunde inte hämta produktdata:", err);
      }
    };
    fetchData();
  }, [id]);

  const handleInventoryChange = (size, value) => {
    setInventory(prev => ({
      ...prev,
      [size]: parseInt(value) || 0
    }));
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

    // Skicka med ID för relationerna
    const selectedCat = availableCategories.find(c => c.name === category);
    const selectedBrand = availableBrands.find(b => b.name === brand);
    if (selectedCat) formData.append('categoryId', selectedCat.id);
    if (selectedBrand) formData.append('brandId', selectedBrand.id);

    // Skicka inventory som JSON-sträng
    formData.append('inventory', JSON.stringify(inventory));

    if (newImage) {
      formData.append('imageFile', newImage);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': token },
        body: formData,
      });

      if (response.ok) {
        alert('Produkten har uppdaterats!');
        navigate('/admin/products');
      }
    } catch (err) {
      alert("Fel vid uppdatering");
    }
  };

  return (
    <div className="reg-page-container">
      <div className="reg-form-card" style={{ maxWidth: '800px' }}>
        <h2 style={{ letterSpacing: '2px', fontWeight: '900', textTransform: 'uppercase', fontSize: '18px' }}>
          Edit Product #{id}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="reg-form-group">
            <label>Product Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="reg-form-row">
            <div className="reg-form-group">
              <label>Color</label>
              <input type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. Black" />
            </div>
            <div className="reg-form-group">
              <label>Material</label>
              <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="e.g. 100% Cotton" />
            </div>
          </div>

          <div className="reg-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <input
              type="checkbox"
              checked={isSportswear}
              onChange={(e) => setIsSportswear(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <label style={{ marginBottom: 0 }}>Mark as Sportswear / Träningskläder</label>
          </div>
          <div className="reg-form-row">
            <div className="reg-form-group">
              <label>Price (SEK)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="reg-form-group">
              <label>Discount Price</label>
              <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} />
            </div>
          </div>

          {/* INVENTORY EDIT SECTION */}
          <div style={{
            background: '#f8f8f8',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '25px',
            border: '1px solid #eee'
          }}>
            <label style={{
              fontWeight: '900',
              fontSize: '10px',
              letterSpacing: '1px',
              display: 'block',
              marginBottom: '15px',
              color: '#666'
            }}>
              UPDATE STOCK LEVELS
            </label>
            <div style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap', // Gör att de hoppar ner på ny rad om det blir trångt
              justifyContent: 'space-between'
            }}>
              {Object.keys(inventory).map(size => (
                <div key={size} style={{
                  textAlign: 'center',
                  flex: '1 1 60px', // Ger varje box en basbredd på 60px men låter den växa
                  minWidth: '60px'
                }}>
                  <label style={{ fontSize: '10px', fontWeight: '700', display: 'block' }}>{size}</label>
                  <input
                    type="number"
                    min="0"
                    value={inventory[size]}
                    onChange={(e) => handleInventoryChange(size, e.target.value)}
                    style={{
                      textAlign: 'center',
                      padding: '8px 0',
                      marginTop: '5px',
                      width: '100%', // Fyller ut sin flex-box
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}
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
              <select value={brand} onChange={(e) => setBrand(e.target.value)} required style={selectStyle}>
                <option value="">Select Brand...</option>
                {availableBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="reg-form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required style={selectStyle}>
              <option value="">Select Category...</option>
              {availableCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="reg-form-group">
            <label>Description</label>
            <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>

          <div className="reg-form-group">
            <label>Current Image Preview</label>
            <div style={{ marginBottom: '15px', textAlign: 'center', background: '#fdfdfd', padding: '10px', borderRadius: '12px', border: '1px dashed #ccc' }}>
              <img
                src={newImage ? URL.createObjectURL(newImage) : currentImage}
                alt="Preview"
                style={{
                  width: '150px',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/400x500/EEE/999?text=Invalid+URL';
                }}
              />
            </div>

            <label>Change via Image URL (Pexels etc.)</label>
            <input
              type="text"
              value={currentImage}
              onChange={(e) => setCurrentImage(e.target.value)}
              placeholder="https://images.pexels.com/..."
              style={{ ...selectStyle, marginBottom: '10px' }}
            />

            <label>Or Upload Local File</label>
            <input
              type="file"
              onChange={(e) => setNewImage(e.target.files[0])}
              style={{ fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button type="submit" className="reg-btn-primary" style={{ flex: 2, fontWeight: '900' }}>
              SAVE CHANGES
            </button>
            <button type="button" onClick={() => navigate('/admin/products')} style={{ flex: 1, background: '#eee', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const selectStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', background: '#fff' };

export default EditProduct;
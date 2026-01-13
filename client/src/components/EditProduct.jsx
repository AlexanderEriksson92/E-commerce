import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    brand: '',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setFormData(data);
        setPreview(data.imageUrl?.startsWith('http') 
          ? data.imageUrl 
          : `http://localhost:5000${data.imageUrl}`);
        setLoading(false);
      })
      .catch(err => console.error("Fel vid hämtning:", err));
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('brand', formData.brand);
    
    if (imageFile) {
      data.append('imageFile', imageFile);
    } else {
      data.append('imageUrl', formData.imageUrl);
    }

    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': localStorage.getItem('token') },
        body: data
      });

      if (res.ok) {
        alert("Produkten har uppdaterats!");
        navigate('/');
      }
    } catch (err) {
      alert("Kunde inte spara ändringar.");
    }
  };

  if (loading) return <div className="container">Laddar...</div>;

  return (
    <div className="container">
      <div className="form-card">
        <h2 style={{ textAlign: 'center' }}>Redigera produkt</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Produktnamn</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required
            />
          </div>

          <div className="form-group">
            <label>Märke</label>
            <input 
              type="text" 
              value={formData.brand || ''} 
              onChange={e => setFormData({...formData, brand: e.target.value})} 
            />
          </div>

          <div className="form-group">
            <label>Kategori</label>
            <select 
              value={formData.category || ''} 
              onChange={e => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="">Välj kategori</option>
              <option value="Jeans">Jeans</option>
              <option value="Tröjor">Tröjor</option>
              <option value="Accessoarer">Accessoarer</option>
              <option value="Skor">Skor</option>
            </select>
          </div>

          <div className="form-group">
            <label>Pris (kr)</label>
            <input 
              type="number" 
              value={formData.price} 
              onChange={e => setFormData({...formData, price: e.target.value})} 
              required
            />
          </div>

          <div className="form-group">
            <label>Beskrivning</label>
            <textarea 
              style={{ height: '100px' }}
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              required
            />
          </div>

          <div className="form-group" style={{ textAlign: 'center' }}>
            <label>Bild</label>
            <div style={{ marginBottom: '10px' }}>
              <img src={preview} alt="Preview" style={{ width: '120px', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>
            <input type="file" onChange={handleFileChange} />
          </div>

          <div className="button-group">
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/')}>Avbryt</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Spara ändringar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
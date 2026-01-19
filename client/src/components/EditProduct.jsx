import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', price: '', description: '', stock: 0, discountPrice: ''
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          name: data.name,
          price: data.price,
          description: data.description,
          stock: data.stock,
          discountPrice: data.discountPrice || ''
        });
      })
      .catch(err => console.error("Kunde inte hämta produkt:", err));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('description', formData.description);
    data.append('stock', formData.stock);
    
    // Viktigt: Skicka tom sträng som null-värde för databasen
    data.append('discountPrice', formData.discountPrice === '' ? '' : formData.discountPrice);

    if (image) {
      data.append('imageFile', image);
    }

    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}` // Lägg till Bearer prefix
          // OBS: Ingen Content-Type header här!
        },
        body: data
      });

      if (res.ok) {
        alert("Produkten uppdaterad!");
        navigate('/admin/products');
      } else {
        const errData = await res.json();
        alert("Fel: " + errData.error);
      }
    } catch (err) {
      alert("Nätverksfel vid uppdatering");
    }
  };

  return (
    <div className="reg-page-container">
      <div className="reg-form-card">
        <h2>Redigera produkt</h2>
        <form onSubmit={handleSubmit}>
          <div className="reg-form-group">
            <label>Namn</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          
          <div className="reg-form-row">
            <div className="reg-form-group">
              <label>Pris (kr)</label>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
            </div>
            <div className="reg-form-group">
              <label>Reapris</label>
              <input type="number" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})} />
            </div>
          </div>

          <div className="reg-form-group">
            <label>Lagerstatus</label>
            <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
          </div>

          <div className="reg-form-group">
            <label>Beskrivning</label>
            <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
          </div>

          <div className="reg-form-group">
            <label>Byt bild (valfritt)</label>
            <input type="file" onChange={e => setImage(e.target.files[0])} />
          </div>

          <button type="submit" className="reg-btn-primary">Spara ändringar</button>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddProduct() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // För extern URL
  const [imageFile, setImageFile] = useState(null); // För fil från datorn
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // FormData behövs för att skicka filer
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    
    if (imageFile) {
      formData.append('imageFile', imageFile); // Skickar filen
    } else {
      formData.append('imageUrl', imageUrl); // Skickar URL:en om ingen fil finns
    }

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 
          'Authorization': localStorage.getItem('token')
          // OBS: Skicka INTE 'Content-Type': 'application/json' här, 
          // webbläsaren fixar rätt header automatiskt för FormData.
        },
        body: formData
      });

      if (response.ok) {
        alert('Produkten sparad!');
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Lägg till produkt</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" placeholder="Namn" onChange={(e) => setName(e.target.value)} required />
        <input type="number" placeholder="Pris" onChange={(e) => setPrice(e.target.value)} required />
        <textarea placeholder="Beskrivning" onChange={(e) => setDescription(e.target.value)} required />
        
        <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>Bildkälla:</p>
          
          <label>Ladda upp fil:</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          
          <p style={{ textAlign: 'center', margin: '10px 0' }}>— ELLER —</p>
          
          <label>Bild-URL:</label>
          <input 
            type="text" 
            placeholder="https://..." 
            disabled={imageFile !== null} // Inaktivera om fil är vald
            onChange={(e) => setImageUrl(e.target.value)} 
          />
        </div>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
          Spara produkt
        </button>
      </form>
    </div>
  );
}

export default AddProduct;
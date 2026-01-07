import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ setAdminStatus }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('isAdmin', data.isAdmin);
        localStorage.setItem('username', data.username);
        
        setAdminStatus(data.isAdmin);
        alert(`Välkommen ${data.username}!`);
        navigate('/');
      } else {
        alert(data.error || 'Inloggning misslyckades');
      }
    } catch (err) {
      console.error("Inloggningsfel:", err);
      alert('Kunde inte ansluta till servern');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '300px', margin: '0 auto', textAlign: 'center' }}>
      <h2>Logga in</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Användarnamn" 
          value={username}
          onChange={(e) => setUsername(e.target.value)} 
          required 
          style={{ padding: '8px' }}
        />
        <input 
          type="password" 
          placeholder="Lösenord" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ padding: '8px' }}
        />
        <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
          Logga in
        </button>
      </form>
    </div>
  );
}

// DENNA RAD ÄR VIKTIGAST:
export default Login;
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login({ setAdminStatus }) {
  const [email, setEmail] = useState(''); // Ändrat här
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // Skickar email istället
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('isAdmin', data.isAdmin);
        localStorage.setItem('userId', data.userId);
        
        setAdminStatus(data.isAdmin);
        navigate('/');
      } else {
        alert(data.error || "Fel uppstod");
      }
    } catch (err) {
      alert("Kunde inte ansluta till servern");
    }
  };

  return (
    <div className="container">
      <div className="form-card">
        <h2>Logga in</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>E-post</label>
            <input 
              type="email" 
              placeholder="din@mail.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Lösenord</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Logga in</button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          Inget konto? <Link to="/register" style={{ color: '#28a745', fontWeight: 'bold' }}>Registrera dig</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
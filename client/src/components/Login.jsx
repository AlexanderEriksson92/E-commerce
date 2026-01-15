import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';

function Login({ setAdminStatus }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
    <div className="login-page-container">
      <div className="login-form-card">
        <h2>Logga in</h2>
        <form onSubmit={handleLogin}>
          <div className="login-form-group">
            <label>E-post</label>
            <input type="email" placeholder="din@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="login-form-group">
            <label>Lösenord</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="login-btn-primary">Logga in</button>
        </form>
        <p className="login-footer-text">
          Inget konto? <Link to="/register">Registrera dig</Link>
        </p>
      </div>
    </div>
  );
}
export default Login;
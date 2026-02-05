import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import StatusModal from '../../components/StatusModal/StatusModal';
import './Login.css';
import API_URL from '../../api';

function Login({ setAdminStatus }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modal, setModal] = useState({ open: false, msg: '', type: '' }); // Modal state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('http://${API_URL}/api/auth/login', {
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
      
      // 1. Visa Success-modal
      setModal({ 
        open: true, 
        msg: `Välkommen tillbaka, ${data.username}!`, 
        type: 'success',
        title: 'INLOGGAD'
      });

      // 2. Väntar 1.5 sekund så användaren hinner se meddelandet
      setTimeout(() => {
        if (typeof setAdminStatus === 'function') {
          setAdminStatus(data.isAdmin);
        }
        window.location.href = '/'; 
      }, 1500);

    } else {
      setModal({ open: true, msg: data.message || "Fel e-post eller lösenord", type: 'error' });
    }
  } catch (err) {
    setModal({ open: true, msg: "Kunde inte ansluta till servern", type: 'error' });
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

      <StatusModal 
        isOpen={modal.open} 
        message={modal.msg} 
        type={modal.type} 
        onClose={() => setModal({ ...modal, open: false })} 
      />
    </div>
  );
}
export default Login;
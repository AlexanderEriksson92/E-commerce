import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import StatusModal from '../../components/StatusModal/StatusModal';
import '../../styles/FormStyles.css';

function Register({ setAdminStatus }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modal, setModal] = useState({ open: false, msg: '', type: '', title: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setModal({ open: true, msg: "Lösenorden matchar inte!", type: 'error', title: 'FEL' });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('isAdmin', data.isAdmin);
        localStorage.setItem('userId', data.userId);
        
        if(setAdminStatus) setAdminStatus(data.isAdmin);

        // Visa modalen - notera att vi INTE skickar med en "action" här
        setModal({ 
          open: true, 
          msg: "Välkommen! Ditt konto är skapat och du har loggats in.", 
          type: 'success',
          title: 'KONTO SKAPAT'
        });

        // Precis som i Login: Vänta lite och navigera sen
        setTimeout(() => {
          window.location.href = '/'; 
        }, 1500);

      } else {
        setModal({ open: true, msg: data.error || "Något gick fel", type: 'error', title: 'FEL' });
      }
    } catch (err) {
      setModal({ open: true, msg: "Kunde inte ansluta till servern", type: 'error', title: 'FEL' });
    }
  };

  return (
    <div className="reg-page-container">
      <div className="reg-form-card">
        <h2>Skapa konto</h2>
        <form onSubmit={handleRegister}>
          <div className="reg-form-row">
            <div className="reg-form-group">
              <label>Förnamn</label>
              <input type="text" placeholder="Erik" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="reg-form-group">
              <label>Efternamn</label>
              <input type="text" placeholder="Svensson" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="reg-form-group">
            <label>E-post</label>
            <input type="email" placeholder="din@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="reg-form-group">
            <label>Lösenord</label>
            <input type="password" placeholder="******" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="reg-form-group">
            <label>Bekräfta lösenord</label>
            <input type="password" placeholder="******" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className="reg-btn-primary">Registrera dig</button>
        </form>
        <p className="reg-footer-text">
          Har du redan ett konto? <Link to="/login">Logga in här</Link>
        </p>
      </div>

      {/* MODALEN - Nu identisk logik med Login */}
      <StatusModal 
        isOpen={modal.open} 
        title={modal.title}
        message={modal.msg} 
        type={modal.type} 
        onClose={() => setModal({ ...modal, open: false })} 
      />
    </div>
  );
}

export default Register;
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Register.css';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Lösenorden matchar inte!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (response.ok) {
        alert("Konto skapat! Du kan nu logga in.");
        navigate('/login');
      } else {
        const data = await response.json();
        alert(data.error || "Något gick fel");
      }
    } catch (err) {
      alert("Kunde inte ansluta till servern");
    }
  };

  return (
    <div className="reg-page-container">
      <div className="reg-form-card">
        <h2>Skapa konto</h2>
        <form onSubmit={handleRegister}>
          {/* Rad med förnamn och efternamn */}
          <div className="reg-form-row">
            <div className="reg-form-group">
              <label>Förnamn</label>
              <input 
                type="text" 
                placeholder="Erik"
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                required 
              />
            </div>
            <div className="reg-form-group">
              <label>Efternamn</label>
              <input 
                type="text" 
                placeholder="Svensson"
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="reg-form-group">
            <label>E-post</label>
            <input 
              type="email" 
              placeholder="din@mail.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="reg-form-group">
            <label>Lösenord</label>
            <input 
              type="password" 
              placeholder="******"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="reg-form-group">
            <label>Bekräfta lösenord</label>
            <input 
              type="password" 
              placeholder="******"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="reg-btn-primary">Registrera dig</button>
        </form>
        <p className="reg-footer-text">
          Har du redan ett konto? <Link to="/login">Logga in här</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
import React, { useState } from 'react';
import { CredentialResponse } from '@react-oauth/google';
import GoogleLoginComponent from './components/GoogleLogin';
import './App.css';

interface UserData {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleLoginSuccess = (userData: UserData, credentialResponse: CredentialResponse) => {
    setUser(userData);
    setToken(credentialResponse.credential as string);
    console.log('Token:', credentialResponse.credential);
    // Aqui você pode fazer requisições ao Google Sheets
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <div className="App">
      {!user ? (
        <GoogleLoginComponent onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h2>Bem-vindo, {user.name}!</h2>
          <img 
            src={user.picture} 
            alt={user.name} 
            style={{ borderRadius: '50%', width: '100px', height: '100px' }}
          />
          <p>Email: {user.email}</p>
          <button 
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

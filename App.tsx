import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, CredentialResponse } from '@react-oauth/google';
import GoogleLoginComponent from './Components/GoogleLogin';
import CompanySetup from './Components/CompanySetup';
import Dashboard from './Components/Dashboard';
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
  const [companyConfigured, setCompanyConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se empresa já foi configurada
    const savedCompanyData = localStorage.getItem('companyData');
    if (savedCompanyData) {
      setCompanyConfigured(true);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData: UserData, credentialResponse: CredentialResponse) => {
    setUser(userData);
    setToken(credentialResponse.credential as string);
  };

  const handleSetupComplete = (companyData: any) => {
    setCompanyConfigured(true);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setCompanyConfigured(false);
    localStorage.removeItem('companyData');
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
      <div className="App">
        {!user ? (
          // Tela de Login
          <GoogleLoginComponent onLoginSuccess={handleLoginSuccess} />
        ) : !companyConfigured ? (
          // Tela de Configuração da Empresa
          <CompanySetup onSetupComplete={handleSetupComplete} token={token!} />
        ) : (
          // Dashboard Principal
          <Dashboard user={user} token={token!} onLogout={handleLogout} />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;

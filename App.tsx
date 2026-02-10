import React, { useState } from 'react';
import { GoogleOAuthProvider, CredentialResponse } from '@react-oauth/google';
import GoogleLoginComponent from './Components/GoogleLogin';
import { fetchSheetData } from './Components/sheetsService';
import './App.css';

interface UserData {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

interface SheetData {
  values: string[][];
  range: string;
}

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSuccess = (userData: UserData, credentialResponse: CredentialResponse) => {
    setUser(userData);
    setToken(credentialResponse.credential as string);
    console.log('Token:', credentialResponse.credential);
  };

  const handleFetchSheetData = async () => {
    if (!token) {
      setError('Token não disponível');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const spreadsheetId = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID;
      
      if (!spreadsheetId) {
        throw new Error('ID da planilha não configurado no .env');
      }

      // Buscar dados da aba "Sheet1" (ajuste conforme necessário)
      const data = await fetchSheetData(spreadsheetId, 'Sheet1', token);
      setSheetData(data);
      console.log('Dados da planilha:', data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao buscar dados: ${errorMessage}`);
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setSheetData(null);
    setError(null);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
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
              onClick={handleFetchSheetData}
              disabled={loading}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginRight: '10px',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Carregando...' : 'Buscar Dados da Planilha'}
            </button>

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

            {error && (
              <div style={{ color: 'red', marginTop: '20px' }}>
                <p>{error}</p>
              </div>
            )}

            {sheetData && (
              <div style={{ marginTop: '20px', textAlign: 'left' }}>
                <h3>Dados da Planilha:</h3>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <tbody>
                    {sheetData.values.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td 
                            key={cellIndex}
                            style={{
                              border: '1px solid #ddd',
                              padding: '8px',
                              backgroundColor: rowIndex === 0 ? '#f2f2f2' : 'white'
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;

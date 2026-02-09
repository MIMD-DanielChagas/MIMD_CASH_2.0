import React from 'react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

interface UserData {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

interface GoogleLoginComponentProps {
  onLoginSuccess: (userData: UserData, credentialResponse: CredentialResponse) => void;
}

const GoogleLoginComponent: React.FC<GoogleLoginComponentProps> = ({ onLoginSuccess }) => {
  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      // Decodificar o JWT para obter informações do usuário
      const decoded = jwtDecode<UserData>(credentialResponse.credential as string);
      
      console.log('Usuário autenticado:', decoded);
      
      // Chamar função de sucesso
      onLoginSuccess(decoded, credentialResponse);
    } catch (error) {
      console.error('Erro ao processar login:', error);
    }
  };

  const handleError = () => {
    console.log('Falha no login');
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h2>Conectar com Google</h2>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          text="signin_with"
          size="large"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginComponent;

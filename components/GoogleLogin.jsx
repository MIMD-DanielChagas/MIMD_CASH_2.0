import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const GoogleLoginComponent = ({ onLoginSuccess }) => {
  const handleSuccess = async (credentialResponse) => {
    try {
      // Enviar o token para o backend (ou processar localmente)
      const token = credentialResponse.credential;
      
      // Decodificar o JWT para obter informações do usuário
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const userData = JSON.parse(jsonPayload);
      console.log('Usuário autenticado:', userData);
      
      // Chamar função de sucesso
      onLoginSuccess(userData, credentialResponse);
    } catch (error) {
      console.error('Erro ao processar login:', error);
    }
  };

  const handleError = () => {
    console.log('Falha no login');
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Conectar com Google</h2>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text="signin_with"
        size="large"
      />
    </div>
  );
};

export default GoogleLoginComponent;

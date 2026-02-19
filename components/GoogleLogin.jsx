import React from 'react';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
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

  // Hook para obter Access Token com escopos
  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        console.log('🔐 Obtendo Access Token...');
        
        // Trocar o authorization code por um access token
        const response = await axios.post(
          'https://oauth2.googleapis.com/token',
          {
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
            code: codeResponse.code,
            grant_type: 'authorization_code',
            redirect_uri: window.location.origin,
          }
        );

        const accessToken = response.data.access_token;
        console.log('✅ Access Token obtido com sucesso!');

        // Obter informações do usuário usando o access token
        const userResponse = await axios.get(
          'https://www.googleapis.com/oauth2/v2/userinfo',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const userData = userResponse.data;
        console.log('Usuário autenticado:', userData);

        // Criar um objeto credentialResponse compatível
        const credentialResponse = {
          credential: accessToken,
          access_token: accessToken,
        };

        // Chamar função de sucesso
        onLoginSuccess(userData, credentialResponse);
      } catch (error) {
        console.error('❌ Erro ao obter Access Token:', error);
      }
    },
    onError: () => {
      console.log('❌ Falha no login');
    },
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
  });

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Conectar com Google</h2>
      <button
        onClick={() => login()}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4285F4',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Conectar com Google
      </button>
    </div>
  );
};

export default GoogleLoginComponent;
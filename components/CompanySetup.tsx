import React, { useState } from 'react';

interface CompanyData {
  profilePhoto: File | null;
  userName: string;
  companyName: string;
  address: string;
  contact: string;
  drivePath: string;
}

const CompanySetup: React.FC<{ onSetupComplete: (data: CompanyData) => void; token: string }> = ({ onSetupComplete, token }) => {
  const [formData, setFormData] = useState<CompanyData>({
    profilePhoto: null,
    userName: '',
    companyName: '',
    address: '',
    contact: '',
    drivePath: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        profilePhoto: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.userName || !formData.companyName || !formData.address || !formData.contact || !formData.drivePath) {
        throw new Error('Todos os campos são obrigatórios');
      }

      localStorage.setItem('companyData', JSON.stringify({
        ...formData,
        setupDate: new Date().toISOString(),
      }));

      onSetupComplete(formData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao configurar empresa: ${errorMessage}`);
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Configuração da Empresa</h2>
      <p>Preencha os dados abaixo para configurar sua empresa:</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="profilePhoto">Foto do Perfil:</label>
          <input
            type="file"
            id="profilePhoto"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'block', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="userName">Nome do Usuário:</label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            placeholder="Digite seu nome"
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="companyName">Nome da Empresa:</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            placeholder="Digite o nome da empresa"
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="address">Endereço:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Digite o endereço"
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="contact">Contato:</label>
          <input
            type="text"
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            placeholder="Digite o contato"
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="drivePath">Caminho do Diretório no Drive:</label>
          <input
            type="text"
            id="drivePath"
            name="drivePath"
            value={formData.drivePath}
            onChange={handleInputChange}
            placeholder="Ex: /Meu Drive/Empresas"
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
          />
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe0e0', borderRadius: '5px' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontSize: '16px',
          }}
        >
          {loading ? 'Configurando...' : 'Configurar Empresa'}
        </button>
      </form>
    </div>
  );
};

export default CompanySetup;

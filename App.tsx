import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, CredentialResponse } from '@react-oauth/google';
import { 
  LayoutDashboard, 
  ClipboardList, 
  TrendingUp, 
  Settings, 
  Menu, 
  X,
  Plus,
  ArrowRightLeft,
  LogOut
} from 'lucide-react';
import GoogleLoginComponent from './Components/GoogleLogin';
import CompanySetup from './Components/CompanySetup';
import Dashboard from './Components/Dashboard';
import TransactionForm from './Components/TransactionForm';
import Registrations from './Components/Registrations';
import DRE from './Components/DRE';
import SettingsPage from './Components/SettingsPage';
import './App.css';
import { AppState, TransactionType, Transaction } from './types';

interface UserData {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

// Definição do estado inicial da aplicação
const initialAppState: AppState = {
  transactions: [],
  accounts: [],
  paymentMethods: [],
  incomeCategories: [],
  expenseCategories: [],
  suppliers: [],
  origins: [],
  config: {
    companyName: 'Minha Empresa',
    logoUrl: '',
  },
};

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [companyConfigured, setCompanyConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appState, setAppState] = useState<AppState>(initialAppState);
  
  // Estados para navegação e modais
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registrations' | 'dre' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState<TransactionType | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Menu items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'registrations', label: 'Cadastros', icon: ClipboardList },
    { id: 'dre', label: 'DRE', icon: TrendingUp },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  useEffect(() => {
    // Verificar se empresa já foi configurada
    const savedCompanyData = localStorage.getItem('companyData');
    if (savedCompanyData) {
      const parsedData = JSON.parse(savedCompanyData);
      setCompanyConfigured(true);
      // Recuperar spreadsheetId do localStorage
      if (parsedData.spreadsheetId) {
        setAppState(prev => ({
          ...prev,
          config: {
            ...prev.config,
            spreadsheetId: parsedData.spreadsheetId,
          },
        }));
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData: UserData, credentialResponse: CredentialResponse) => {
    setUser(userData);
    setToken(credentialResponse.credential as string);
  };

  const handleSetupComplete = (companyData: any) => {
    setCompanyConfigured(true);
    setAppState(prev => ({
      ...prev,
      accounts: companyData.accounts || [],
      incomeCategories: companyData.incomeCategories || [],
      expenseCategories: companyData.expenseCategories || [],
      suppliers: companyData.suppliers || [],
      origins: companyData.origins || [],
      paymentMethods: companyData.paymentMethods || [],
      config: {
        ...prev.config,
        companyName: companyData.companyName || prev.config.companyName,
        spreadsheetId: companyData.spreadsheetId,
      },
    }));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setCompanyConfigured(false);
    localStorage.removeItem('companyData');
    setAppState(initialAppState);
    setActiveTab('dashboard');
  };

  // Funções para o Dashboard
  const handleTypeSelect = (type: TransactionType) => {
    setShowTransactionModal(type);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      setAppState(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id),
      }));
    }
  };

  const handleAddTransaction = async (data: any) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      ...data,
    };
    
    // Adicionar ao estado local
    setAppState(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTransaction],
    }));

    // Sincronizar com Google Sheets se spreadsheetId estiver configurado
    if (appState.config?.spreadsheetId && token) {
      console.log('📤 Sincronizando lançamento com Google Sheets...');
      
      try {
        const values = [
          newTransaction.id,
          newTransaction.data,
          newTransaction.descricao,
          newTransaction.valor,
          newTransaction.tipo,
          newTransaction.categoria,
          newTransaction.metodo_pagamento,
          newTransaction.conta,
          newTransaction.status || 'COMPLETED',
          newTransaction.fornecedor || '',
          newTransaction.notas || '',
          newTransaction.anexo || '',
          newTransaction.data_vencimento || '',
          newTransaction.data_pagamento || '',
          newTransaction.repeticao || '',
          newTransaction.parcelas || '',
          newTransaction.comissao_percent || '',
          newTransaction.check_in || '',
          newTransaction.check_out || '',
          newTransaction.hospedes || '',
        ];

        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${appState.config.spreadsheetId}/values/lancamentos:append?valueInputOption=USER_ENTERED`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              values: [values],
            }),
          }
        );

        if (response.ok) {
          console.log('✅ Lançamento sincronizado com sucesso!');
        } else {
          const errorData = await response.json();
          console.error('❌ Erro ao sincronizar lançamento:', errorData);
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar com Sheets:', error);
      }
    }

    setShowTransactionModal(null);
    setEditingTransaction(null);
  };

  const handleUpdateTransaction = (id: string, data: any) => {
    setAppState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === id ? { ...t, ...data } : t),
    }));
    setShowTransactionModal(null);
    setEditingTransaction(null);
  };

  const handleAddItem = async (type: string, item: any) => {
    console.log(`Adicionando ${type}:`, item);
    
    // Adicionar ao estado local
    if (type === 'suppliers') {
      setAppState(prev => ({
        ...prev,
        suppliers: [...(prev.suppliers || []), { id: Date.now().toString(), ...item }],
      }));
    } else if (type === 'expenseCategories') {
      setAppState(prev => ({
        ...prev,
        expenseCategories: [...prev.expenseCategories, { id: Date.now().toString(), ...item, ativa: true }],
      }));
    } else if (type === 'incomeCategories') {
      setAppState(prev => ({
        ...prev,
        incomeCategories: [...prev.incomeCategories, { id: Date.now().toString(), ...item, ativa: true }],
      }));
    } else if (type === 'accounts') {
      setAppState(prev => ({
        ...prev,
        accounts: [...prev.accounts, { id: Date.now().toString(), ...item }],
      }));
    } else if (type === 'paymentMethods') {
      setAppState(prev => ({
        ...prev,
        paymentMethods: [...prev.paymentMethods, { id: Date.now().toString(), ...item, ativa: true }],
      }));
    } else if (type === 'origins') {
      setAppState(prev => ({
        ...prev,
        origins: [...(prev.origins || []), { id: Date.now().toString(), ...item, ativa: true }],
      }));
    }

    // Sincronizar com Google Sheets se spreadsheetId estiver configurado
    if (appState.config?.spreadsheetId && token) {
      console.log('📤 Sincronizando com Google Sheets...');
      
      try {
        let sheetName = '';
        let values: any[] = [];

        if (type === 'expenseCategories') {
          sheetName = 'categorias_saida';
          values = [
            Date.now().toString(),
            item.nome_categoria || item.name || '',
            item.descricao || '',
            'SIM',
          ];
        } else if (type === 'incomeCategories') {
          sheetName = 'categorias_entrada';
          values = [
            Date.now().toString(),
            item.nome_categoria || item.name || '',
            item.descricao || '',
            'SIM',
          ];
        } else if (type === 'suppliers') {
          sheetName = 'Fornecedores';
          values = [
            Date.now().toString(),
            item.nome || item.name || '',
            item.email || '',
            item.telefone || '',
            item.endereco || '',
            item.cidade || '',
            item.estado || '',
            new Date().toISOString().split('T')[0],
            'SIM',
          ];
        } else if (type === 'accounts') {
          sheetName = 'Contas';
          values = [
            Date.now().toString(),
            item.nome_banco || item.name || '',
            item.agencia || '',
            item.numero_conta || '',
            item.saldo_inicial || 0,
            item.saldo_atual || 0,
            new Date().toISOString().split('T')[0],
          ];
        } else if (type === 'paymentMethods') {
          sheetName = 'metodos_pagamento';
          values = [
            Date.now().toString(),
            item.nome_metodo || item.name || '',
            item.descricao || '',
            'SIM',
          ];
        } else if (type === 'origins') {
          sheetName = 'Origens';
          values = [
            Date.now().toString(),
            item.name || '',
            item.descricao || '',
            'SIM',
          ];
        }

        if (sheetName && values.length > 0) {
          const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${appState.config.spreadsheetId}/values/${sheetName}:append?valueInputOption=USER_ENTERED`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                values: [values],
              }),
            }
          );

          if (response.ok) {
            console.log(`✅ ${type} sincronizado com sucesso!`);
          } else {
            const errorData = await response.json();
            console.error(`❌ Erro ao sincronizar ${type}:`, errorData);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar com Sheets:', error);
      }
    }
  };

  const handleDeleteItem = (type: string, id: string) => {
    console.log(`Deletando ${type}:`, id);
    
    if (type === 'suppliers') {
      setAppState(prev => ({
        ...prev,
        suppliers: prev.suppliers.filter(s => s.id !== id),
      }));
    } else if (type === 'expenseCategories') {
      setAppState(prev => ({
        ...prev,
        expenseCategories: prev.expenseCategories.filter(c => c.id !== id),
      }));
    } else if (type === 'incomeCategories') {
      setAppState(prev => ({
        ...prev,
        incomeCategories: prev.incomeCategories.filter(c => c.id !== id),
      }));
    } else if (type === 'accounts') {
      setAppState(prev => ({
        ...prev,
        accounts: prev.accounts.filter(a => a.id !== id),
      }));
    } else if (type === 'paymentMethods') {
      setAppState(prev => ({
        ...prev,
        paymentMethods: prev.paymentMethods.filter(p => p.id !== id),
      }));
    } else if (type === 'origins') {
      setAppState(prev => ({
        ...prev,
        origins: prev.origins.filter(o => o.id !== id),
      }));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  // DEBUG: Verificar se a variável de ambiente está sendo lida
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  console.log('=== DEBUG GOOGLE OAUTH ===');
  console.log('VITE_GOOGLE_CLIENT_ID:', clientId);
  console.log('Client ID vazio?', clientId === '');
  console.log('========================');

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="App">
        {!user ? (
          // Tela de Login
          <GoogleLoginComponent onLoginSuccess={handleLoginSuccess} />
        ) : !companyConfigured ? (
          // Tela de Configuração da Empresa
          <CompanySetup onSetupComplete={handleSetupComplete} token={token!} />
        ) : (
          // Layout Principal com Sidebar + Header + Content
          <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-full shadow-sm z-30`}>
              <div className="p-6 flex items-center gap-3 border-b border-gray-100 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {isSidebarOpen && (
                  <div className="overflow-hidden whitespace-nowrap">
                    <h1 className="font-bold text-gray-800 leading-tight">{user.name}</h1>
                    <p className="text-xs text-indigo-500 font-medium">MIMD CASH</p>
                  </div>
                )}
              </div>

              <nav className="flex-1 px-3 space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                      activeTab === item.id 
                        ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-500'
                    }`}
                  >
                    <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                    {isSidebarOpen && <span>{item.label}</span>}
                  </button>
                ))}
              </nav>

              <div className="p-4 border-t border-gray-100">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
                >
                  <LogOut size={22} />
                  {isSidebarOpen && <span>Sair</span>}
                </button>
              </div>

              <div className="p-4">
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 ml-auto block"
                >
                  {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
              {/* Header */}
              <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-20 sticky top-0">
                <h2 className="text-xl font-bold text-gray-800 capitalize">
                  {menuItems.find(m => m.id === activeTab)?.label || 'App'}
                </h2>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowTransactionModal(TransactionType.INCOME)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md active:scale-95"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Receita</span>
                  </button>
                  <button 
                    onClick={() => setShowTransactionModal(TransactionType.EXPENSE)}
                    className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md active:scale-95"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Despesa</span>
                  </button>
                  <button 
                    onClick={() => setShowTransactionModal(TransactionType.TRANSFER)}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md active:scale-95"
                  >
                    <ArrowRightLeft size={18} />
                    <span className="hidden sm:inline">Transferir</span>
                  </button>
                </div>
              </header>

              {/* Dynamic Content Area */}
              <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                {activeTab === 'dashboard' && (
                  <Dashboard 
                    state={appState} 
                    onTypeSelect={handleTypeSelect} 
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                  />
                )}
                {activeTab === 'registrations' && (
                  <Registrations 
                    state={appState} 
                    addItem={handleAddItem} 
                    deleteItem={handleDeleteItem} 
                  />
                )}
                {activeTab === 'dre' && <DRE state={appState} />}
                {activeTab === 'settings' && (
                  <SettingsPage 
                    config={appState.config || {}} 
                    updateConfig={(config: any) => {
                      setAppState(prev => ({
                        ...prev,
                        config: { ...prev.config, ...config },
                      }));
                    }} 
                  />
                )}
              </div>
            </main>

            {/* Transaction Modals */}
            {(showTransactionModal || editingTransaction) && (
              <TransactionForm 
                type={editingTransaction ? editingTransaction.type : showTransactionModal!} 
                initialData={editingTransaction || undefined}
                state={appState} 
                onClose={() => {
                  setShowTransactionModal(null);
                  setEditingTransaction(null);
                }} 
                onSubmit={(data) => {
                  if (editingTransaction) {
                    handleUpdateTransaction(editingTransaction.id, data);
                  } else {
                    handleAddTransaction(data);
                  }
                }}
                onAddSupplier={(name) => handleAddItem('suppliers', { name })}
              />
            )}
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
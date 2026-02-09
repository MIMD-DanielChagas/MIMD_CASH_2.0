
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  TrendingUp, 
  Settings, 
  Menu, 
  X,
  Plus,
  Trash2,
  DollarSign,
  ArrowRightLeft,
  Calendar,
  Building2
} from 'lucide-react';
import { useAppState } from './hooks/useAppState';
import { TransactionType, Transaction } from './types';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import Registrations from './components/Registrations';
import DRE from './components/DRE';
import SettingsPage from './components/SettingsPage';

const App: React.FC = () => {
  const { state, updateConfig, addTransaction, updateTransaction, deleteTransaction, addItem, deleteItem } = useAppState();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'registrations' | 'dre' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState<TransactionType | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'registrations', label: 'Cadastros', icon: ClipboardList },
    { id: 'dre', label: 'DRE', icon: TrendingUp },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleEditTransaction = (t: Transaction) => {
    setEditingTransaction(t);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-full shadow-sm z-30`}>
        <div className="p-6 flex items-center gap-3 border-b border-gray-100 mb-4">
          <img 
            src={state.config.logoUrl || "https://picsum.photos/40/40"} 
            alt="Logo" 
            className="w-10 h-10 rounded-lg object-cover bg-indigo-50" 
          />
          {isSidebarOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-bold text-gray-800 leading-tight">{state.config.companyName}</h1>
              <p className="text-xs text-indigo-500 font-medium">HospedaFinance</p>
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
              state={state} 
              onTypeSelect={(type) => setShowTransactionModal(type)} 
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          )}
          {activeTab === 'registrations' && <Registrations state={state} addItem={addItem} deleteItem={deleteItem} />}
          {activeTab === 'dre' && <DRE state={state} />}
          {activeTab === 'settings' && <SettingsPage config={state.config} updateConfig={updateConfig} />}
        </div>
      </main>

      {/* Transaction Modals */}
      {(showTransactionModal || editingTransaction) && (
        <TransactionForm 
          type={editingTransaction ? editingTransaction.type : showTransactionModal!} 
          initialData={editingTransaction || undefined}
          state={state} 
          onClose={() => {
            setShowTransactionModal(null);
            setEditingTransaction(null);
          }} 
          onSubmit={(data) => {
            if (editingTransaction) {
              updateTransaction(editingTransaction.id, data);
            } else {
              addTransaction(data);
            }
            setShowTransactionModal(null);
            setEditingTransaction(null);
          }}
          onAddSupplier={(name) => addItem('suppliers', { name })}
        />
      )}
    </div>
  );
};

export default App;


import React, { useState } from 'react';
import { Plus, Trash2, Tag, Landmark, CreditCard, Building, UserCheck, Hotel, Receipt } from 'lucide-react';
import { AppState, Category } from '../types';

interface RegistrationsProps {
  state: AppState;
  addItem: <T extends { id: string }>(key: keyof AppState, item: Omit<T, 'id'>) => void;
  deleteItem: (key: keyof AppState, id: string) => void;
}

const Registrations: React.FC<RegistrationsProps> = ({ state, addItem, deleteItem }) => {
  const [activeTab, setActiveTab] = useState<keyof AppState>('incomeCategories');
  const [incomeParent, setIncomeParent] = useState<'hospedagem' | 'outras_receitas'>('hospedagem');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFee, setNewFee] = useState('0');

  const tabs: { id: keyof AppState; label: string; icon: any }[] = [
    { id: 'incomeCategories', label: 'Categorias Entrada', icon: Tag },
    { id: 'expenseCategories', label: 'Categorias Saída', icon: Tag },
    { id: 'accounts', label: 'Contas Financeiras', icon: Landmark },
    { id: 'paymentMethods', label: 'Métodos de Pagamento', icon: CreditCard },
    { id: 'origins', label: 'Origens de Hóspedes', icon: UserCheck },
    { id: 'suppliers', label: 'Fornecedores', icon: Building },
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const data: any = { name: newName };
    if (activeTab === 'paymentMethods' || activeTab === 'origins') {
      data.fee = parseFloat(newFee) || 0;
    }
    if (activeTab === 'incomeCategories') {
      data.parentId = incomeParent;
    }

    addItem(activeTab, data);
    setNewName('');
    setNewFee('0');
    setShowAddForm(false);
  };

  const listData = activeTab === 'incomeCategories' 
    ? (state.incomeCategories as Category[]).filter(c => c.parentId === incomeParent)
    : state[activeTab] as any[];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap gap-2 mb-8 bg-gray-100 p-2 rounded-2xl overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-800">
              Gerenciar {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            {activeTab === 'incomeCategories' && (
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setIncomeParent('hospedagem')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all ${incomeParent === 'hospedagem' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 text-gray-400'}`}
                >
                  <Hotel size={14} /> HOSPEDAGEM
                </button>
                <button 
                  onClick={() => setIncomeParent('outras_receitas')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all ${incomeParent === 'outras_receitas' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 text-gray-400'}`}
                >
                  <Receipt size={14} /> OUTRAS RECEITAS
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} />
            Adicionar Novo
          </button>
        </div>

        {showAddForm && (
          <div className="p-8 bg-indigo-50/50 border-b border-indigo-100 animate-in slide-in-from-top-4 duration-300">
            <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <label className="text-xs font-bold text-indigo-400 uppercase mb-2 block">Nome / Descrição</label>
                <input 
                  type="text" value={newName} onChange={e => setNewName(e.target.value)}
                  className="w-full p-4 bg-white border border-indigo-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  placeholder="Ex: Chalé Luxo, Pix Bradesco..." required
                />
              </div>
              {(activeTab === 'paymentMethods' || activeTab === 'origins') && (
                <div className="w-full sm:w-32">
                  <label className="text-xs font-bold text-indigo-400 uppercase mb-2 block">Taxa (%)</label>
                  <input type="number" step="0.01" value={newFee} onChange={e => setNewFee(e.target.value)} className="w-full p-4 bg-white border border-indigo-100 rounded-2xl focus:ring-indigo-500" />
                </div>
              )}
              <div className="flex gap-2 w-full sm:w-auto">
                <button type="submit" className="flex-1 sm:flex-none bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-600 shadow-md">Salvar</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="bg-white text-gray-500 px-6 py-4 rounded-2xl font-bold border border-gray-200">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {listData.length === 0 ? (
            <div className="p-20 text-center text-gray-400"><Plus size={48} className="mx-auto mb-4 opacity-20" /><p className="font-medium">Nenhum registro encontrado.</p></div>
          ) : (
            listData.map((item) => (
              <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-50 transition-colors">
                    {activeTab === 'incomeCategories' 
                      ? (incomeParent === 'hospedagem' ? <Hotel size={20} /> : <Receipt size={20} />)
                      : React.createElement(tabs.find(t => t.id === activeTab)?.icon || Tag, { size: 20 })}
                  </div>
                  <div><h4 className="font-bold text-gray-800">{item.name}</h4>{item.fee !== undefined && <p className="text-sm text-indigo-500 font-medium">Taxa: {item.fee}%</p>}</div>
                </div>
                <button onClick={() => deleteItem(activeTab, item.id)} className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={20} /></button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Registrations;

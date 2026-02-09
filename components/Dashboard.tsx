
import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  ArrowRightLeft,
  Edit2,
  Trash2,
  RefreshCw,
  Landmark,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  Package,
  ChevronDown,
  PieChart as PieChartIcon,
  Tag
} from 'lucide-react';
import { AppState, TransactionType, Transaction } from '../types';
import { projectTransaction } from '../utils/transactionUtils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface DashboardProps {
  state: AppState;
  onTypeSelect: (type: TransactionType) => void;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#4ade80', '#fb7185'];

const Dashboard: React.FC<DashboardProps> = ({ state, onTypeSelect, onEdit, onDelete }) => {
  const today = new Date().toISOString().split('T')[0];
  const [visibleBalances, setVisibleBalances] = useState<Record<string, boolean>>({});
  const [isAccountsExpanded, setIsAccountsExpanded] = useState(true);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}`;
  };

  // Projetar todas as transações para obter o fluxo de caixa real
  const allProjected = useMemo(() => {
    return state.transactions.flatMap(t => projectTransaction(t, state.paymentMethods));
  }, [state.transactions, state.paymentMethods]);

  // Cálculo dos saldos individuais de cada conta
  const accountBalances = useMemo(() => {
    return state.accounts.map(account => {
      let currentBalance = account.balance || 0;
      const relevantProjections = allProjected.filter(p => p.date <= today);
      relevantProjections.forEach(p => {
        const t = p.originalTransaction;
        if (t.type === TransactionType.INCOME && t.accountId === account.id) {
          currentBalance += p.value;
        } else if (t.type === TransactionType.EXPENSE && t.accountId === account.id) {
          currentBalance -= p.value;
        } else if (t.type === TransactionType.TRANSFER) {
          if (t.accountId === account.id) currentBalance -= p.value;
          if (t.targetAccountId === account.id) currentBalance += p.value;
        }
      });
      return { ...account, currentBalance };
    });
  }, [state.accounts, allProjected, today]);

  // Dados para os Gráficos de Pizza
  const incomePieData = useMemo(() => {
    const map: Record<string, number> = {};
    allProjected
      .filter(p => p.originalTransaction.type === TransactionType.INCOME)
      .forEach(p => {
        const catId = p.originalTransaction.categoryId;
        const catName = state.incomeCategories.find(c => c.id === catId)?.name || 'Outras Receitas';
        map[catName] = (map[catName] || 0) + p.value;
      });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [allProjected, state.incomeCategories]);

  const expensePieData = useMemo(() => {
    const map: Record<string, number> = {};
    allProjected
      .filter(p => p.originalTransaction.type === TransactionType.EXPENSE)
      .forEach(p => {
        const catId = p.originalTransaction.categoryId;
        const catName = state.expenseCategories.find(c => c.id === catId)?.name || 'Outras Despesas';
        map[catName] = (map[catName] || 0) + p.value;
      });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [allProjected, state.expenseCategories]);

  const totalIncomeValue = useMemo(() => incomePieData.reduce((acc, curr) => acc + curr.value, 0), [incomePieData]);
  const totalExpenseValue = useMemo(() => expensePieData.reduce((acc, curr) => acc + curr.value, 0), [expensePieData]);

  const toggleBalance = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisibleBalances(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getAccountLogo = (name: string) => {
    const lowerName = name.toLowerCase();
    let domain = '';
    
    if (lowerName.includes('stone')) domain = 'stone.com.br';
    else if (lowerName.includes('inter')) domain = 'bancointer.com.br';
    else if (lowerName.includes('getnet')) domain = 'getnet.com.br';
    else if (lowerName.includes('mercado pago') || lowerName.includes('mercadopago')) domain = 'mercadopago.com.br';
    else if (lowerName.includes('asas') || lowerName.includes('asaas')) domain = 'asaas.com';
    else if (lowerName.includes('pagseguro')) domain = 'pagseguro.com.br';

    if (domain) {
      return (
        <img 
          src={`https://logo.clearbit.com/${domain}`} 
          className="w-full h-full object-contain rounded-lg p-0.5" 
          alt={name}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) parent.innerHTML = '<div class="text-indigo-500"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="21" x2="21" y2="21"></line><line x1="3" y1="7" x2="21" y2="7"></line><polyline points="4 7 4 21"></polyline><polyline points="20 7 20 21"></polyline><line x1="9" y1="11" x2="9" y2="17"></line><line x1="15" y1="11" x2="15" y2="17"></line><path d="M4 7L12 3L20 7"></path></svg></div>';
          }}
        />
      );
    }

    if (lowerName.includes('pessoal') || lowerName.includes('daniel') || lowerName.includes('julia')) {
      return <div className="bg-indigo-100 text-indigo-600 w-full h-full flex items-center justify-center rounded-lg"><User size={20} /></div>;
    }
    if (lowerName.includes('caixinha')) {
      return <div className="bg-amber-100 text-amber-600 w-full h-full flex items-center justify-center rounded-lg"><Package size={20} /></div>;
    }
    
    return <Landmark size={20} className="text-indigo-500" />;
  };

  const totalIncome = allProjected
    .filter(p => p.originalTransaction.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.value, 0);

  const totalExpense = allProjected
    .filter(p => p.originalTransaction.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.value, 0);

  const balance = totalIncome - totalExpense;

  const barChartData = [
    { name: 'Receitas', value: totalIncome, color: '#10b981' },
    { name: 'Despesas', value: totalExpense, color: '#f43f5e' }
  ];

  const renderCustomLegend = (data: any[], total: number) => {
    return (
      <div className="flex flex-col gap-3 mt-4 w-full">
        {data.map((entry, index) => {
          const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
          return (
            <div key={`item-${index}`} className="flex items-center justify-between text-[11px] font-bold border-b border-gray-50 pb-2 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-gray-600 truncate max-w-[140px]">{entry.name}</span>
              </div>
              <div className="flex items-center gap-4 text-gray-400">
                <span className="text-gray-800 tabular-nums">{formatCurrency(entry.value)}</span>
                <span className="w-12 text-right text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTransactionList = (type: TransactionType) => {
    const transactions = state.transactions
      .filter(t => t.type === type)
      .slice(0, 15); // Top 15 mais recentes

    const isIncome = type === TransactionType.INCOME;

    return (
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col h-full">
        <h4 className={`text-lg font-black ${isIncome ? 'text-emerald-500' : 'text-rose-500'} mb-6 flex items-center gap-3`}>
          {isIncome ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
          {isIncome ? 'Receitas Recentes' : 'Despesas Recentes'}
        </h4>
        
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-2 no-scrollbar">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <PlusCircle size={40} className="mb-2 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">Nenhum registro</p>
            </div>
          ) : (
            transactions.map(t => {
              const account = state.accounts.find(a => a.id === t.accountId);
              const category = isIncome 
                ? state.incomeCategories.find(c => c.id === t.categoryId)
                : state.expenseCategories.find(c => c.id === t.categoryId);

              return (
                <div key={t.id} className="group relative flex flex-col p-4 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 rounded-2xl transition-all shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-800 line-clamp-1">{t.description}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                        {formatDate(t.date)} • {account?.name || 'S/ Conta'}
                      </span>
                    </div>
                    <span className={`text-sm font-black ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(t.value)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-100 rounded-full">
                      <Tag size={10} className="text-indigo-400" />
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                        {category?.name || 'Geral'}
                      </span>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(t)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg"><Edit2 size={12} /></button>
                      <button onClick={() => onDelete(t.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {transactions.length > 0 && (
          <button className="mt-6 flex items-center justify-center gap-2 w-full py-4 text-[9px] font-black text-gray-300 hover:text-indigo-500 transition-colors uppercase tracking-[0.2em] border-t border-gray-50">
            Ver tudo <ArrowRight size={12} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* 1. CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <span className="text-emerald-500 flex items-center text-sm font-medium">
              <ArrowUpRight size={16} /> Recebido
            </span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Total de Entradas (Caixa)</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalIncome)}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-rose-50 p-3 rounded-2xl text-rose-600 group-hover:scale-110 transition-transform">
              <TrendingDown size={24} />
            </div>
            <span className="text-rose-500 flex items-center text-sm font-medium">
              <ArrowDownRight size={16} /> Pago
            </span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Total de Saídas (Caixa)</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalExpense)}</h3>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg border border-indigo-500 group">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/10 p-3 rounded-2xl text-white group-hover:rotate-12 transition-transform">
              <Wallet size={24} />
            </div>
            <span className="text-indigo-200 text-sm font-medium">Saldo Real</span>
          </div>
          <p className="text-indigo-100 text-sm font-medium">Saldo Disponível</p>
          <h3 className="text-2xl font-bold text-white mt-1">{formatCurrency(balance)}</h3>
        </div>
      </div>

      {/* 2. CONTAS FINANCEIRAS */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all duration-300">
        <div 
          className="flex items-center justify-between mb-0 cursor-pointer group/header"
          onClick={() => setIsAccountsExpanded(!isAccountsExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover/header:scale-110 transition-transform">
              <Landmark size={22} />
            </div>
            <div>
              <h4 className="text-lg font-black text-gray-800">Contas Financeiras</h4>
              {isAccountsExpanded && <p className="text-xs text-gray-400 font-medium mt-0.5">Clique no ícone para ver o saldo</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {!isAccountsExpanded && (
               <span className="hidden sm:inline-block px-3 py-1 bg-gray-50 text-[10px] font-black text-indigo-500 rounded-full uppercase tracking-widest border border-indigo-100 animate-in fade-in zoom-in">
                 {state.accounts.length} Contas ativas
               </span>
            )}
            <button className={`p-2 hover:bg-gray-50 rounded-full transition-all duration-300 ${isAccountsExpanded ? '' : '-rotate-180'}`}>
              <ChevronDown size={24} className="text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-500 overflow-hidden ${isAccountsExpanded ? 'max-h-[2000px] mt-8 opacity-100' : 'max-h-0 mt-0 opacity-0'}`}>
          {accountBalances.map(acc => {
            const isVisible = visibleBalances[acc.id];
            return (
              <div 
                key={acc.id} 
                onClick={(e) => toggleBalance(acc.id, e)}
                className="group relative p-6 bg-white border border-gray-100 hover:border-indigo-200 rounded-3xl transition-all cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 p-1 bg-white rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg overflow-hidden border border-gray-100 shadow-sm">
                    {getAccountLogo(acc.name)}
                  </div>
                  <div className="flex items-center gap-2">
                    {isVisible ? <Eye size={14} className="text-indigo-400" /> : <EyeOff size={14} className="text-gray-300" />}
                    <div className={`h-2 w-2 rounded-full ${acc.currentBalance >= 0 ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{acc.name}</p>
                  <div className="flex items-center gap-2 h-8">
                    {isVisible ? (
                      <h5 className={`text-xl font-black tracking-tight ${acc.currentBalance >= 0 ? 'text-gray-800' : 'text-rose-600'} animate-in fade-in duration-300`}>
                        {formatCurrency(acc.currentBalance)}
                      </h5>
                    ) : (
                      <div className="flex gap-1 animate-pulse">
                        {[1, 2, 3, 4].map(i => <div key={i} className="w-2.5 h-2.5 bg-gray-100 rounded-full" />)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. GRÁFICOS DE PIZZA (MOVIDOS PARA CÁ) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Receitas por Categoria */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
          <h4 className="text-lg font-black text-gray-800 mb-8 flex items-center gap-2">
            <PieChartIcon size={20} className="text-emerald-500" />
            Receitas por Categoria
          </h4>
          <div className="flex flex-col xl:flex-row items-center gap-8 flex-1">
            <div className="h-[280px] w-full xl:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {incomePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full xl:w-1/2 max-h-[280px] overflow-y-auto no-scrollbar pr-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Detalhamento</p>
              {renderCustomLegend(incomePieData, totalIncomeValue)}
            </div>
          </div>
        </div>

        {/* Despesas por Categoria */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
          <h4 className="text-lg font-black text-gray-800 mb-8 flex items-center gap-2">
            <PieChartIcon size={20} className="text-rose-500" />
            Despesas por Categoria
          </h4>
          <div className="flex flex-col xl:flex-row items-center gap-8 flex-1">
            <div className="h-[280px] w-full xl:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full xl:w-1/2 max-h-[280px] overflow-y-auto no-scrollbar pr-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Detalhamento</p>
              {renderCustomLegend(expensePieData, totalExpenseValue)}
            </div>
          </div>
        </div>
      </div>

      {/* 4. FLUXO DE CAIXA REALIZADO */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h4 className="text-lg font-black text-gray-800 mb-8 flex items-center gap-2">
          <TrendingUp size={22} className="text-indigo-500" />
          Fluxo de Caixa Realizado (Caixa)
        </h4>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 'bold'}} />
              <YAxis hide />
              <Tooltip 
                cursor={{fill: '#f9fafb'}}
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={80}>
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. LANÇAMENTOS ORIGINAIS (DIVIDIDOS E DETALHADOS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderTransactionList(TransactionType.INCOME)}
        {renderTransactionList(TransactionType.EXPENSE)}
      </div>
    </div>
  );
};

export default Dashboard;

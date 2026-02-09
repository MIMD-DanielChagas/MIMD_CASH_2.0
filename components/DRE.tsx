
import React, { useState, useMemo } from 'react';
import { AppState, TransactionType } from '../types';
import { projectTransaction } from '../utils/transactionUtils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  PieChart, 
  Calculator,
  ChevronDown,
  DollarSign,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';

interface DREProps {
  state: AppState;
}

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

interface DRERowProps {
  label: string;
  value: number;
  variant?: 'normal' | 'header' | 'total' | 'negative' | 'sub-item';
}

const DRERow: React.FC<DRERowProps> = ({ label, value, variant = 'normal' }) => {
  const styles = {
    header: "bg-gray-800 text-white font-bold py-5 px-6 rounded-2xl shadow-sm mb-2",
    total: "bg-indigo-600 text-white font-black py-6 px-8 rounded-[2rem] shadow-lg mt-6",
    subtotal: "bg-emerald-50 text-emerald-800 font-bold py-4 px-6 rounded-xl border border-emerald-100 mb-2",
    negative: "text-rose-500 font-bold py-2 px-6 border-b border-gray-50 flex justify-between",
    normal: "text-gray-600 font-medium py-3 px-6 border-b border-gray-50 flex justify-between",
    'sub-item': "text-gray-500 font-medium py-2 px-6 pl-12 border-b border-gray-50 flex justify-between text-sm"
  };

  if (variant === 'header' || variant === 'total') {
    return (
      <div className={`flex justify-between items-center ${styles[variant === 'header' ? 'header' : 'total']}`}>
        <span className="uppercase tracking-widest text-[11px]">{label}</span>
        <span className="text-xl tabular-nums">{formatCurrency(value)}</span>
      </div>
    );
  }

  if (label === '(=) RECEITA LÍQUIDA') {
      return (
        <div className={`flex justify-between items-center bg-indigo-50 text-indigo-700 font-black py-5 px-6 rounded-2xl border border-indigo-100 my-4 shadow-sm`}>
          <span className="uppercase tracking-widest text-[11px]">{label}</span>
          <span className="text-xl tabular-nums">{formatCurrency(value)}</span>
        </div>
      );
  }

  return (
    <div className={`${variant === 'sub-item' ? styles['sub-item'] : variant === 'negative' ? styles['negative'] : styles['normal']}`}>
      <span className="flex items-center gap-2">
          {variant === 'sub-item' && <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>}
          {label}
      </span>
      <span className="tabular-nums">
        {variant === 'negative' ? `- ${formatCurrency(value)}` : formatCurrency(value)}
      </span>
    </div>
  );
};

const DRE: React.FC<DREProps> = ({ state }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAccountingView, setShowAccountingView] = useState(true);

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);

  // Projetar todas as transações uma única vez para performance
  const allProjected = useMemo(() => {
    return state.transactions.flatMap(t => projectTransaction(t, state.paymentMethods));
  }, [state.transactions, state.paymentMethods]);

  const getDRECalculations = (month: number, year: number) => {
    // Filtrar projeções que caem no mês/ano selecionado
    const periodProjections = allProjected.filter(p => {
      const d = new Date(p.date);
      return d.getUTCMonth() === month && d.getUTCFullYear() === year;
    });

    const incomes = periodProjections.filter(p => p.originalTransaction.type === TransactionType.INCOME);
    const expenses = periodProjections.filter(p => p.originalTransaction.type === TransactionType.EXPENSE);

    // 1. RECEITA BRUTA (Soma das parcelas que caem no mês)
    const receitaBruta = incomes.reduce((acc, p) => acc + p.value, 0);

    // 1.1 Totais por Categoria de Entrada
    const incomeByCategory = state.incomeCategories.map(cat => {
      const total = incomes
        .filter(p => p.originalTransaction.categoryId === cat.id)
        .reduce((acc, p) => acc + p.value, 0);
      return { name: cat.name, total };
    }).filter(c => c.total > 0);

    // 2. DEDUÇÕES (Taxas e Comissões proporcionais à parcela)
    const feesByPaymentMethod = state.paymentMethods.map(pm => {
      const totalOnMethod = incomes
        .filter(p => p.originalTransaction.paymentMethodId === pm.id)
        .reduce((acc, p) => acc + p.value, 0);
      
      const totalFee = totalOnMethod * (pm.fee / 100);
      return { name: pm.name, total: totalFee };
    }).filter(f => f.total > 0);

    const totalFees = feesByPaymentMethod.reduce((acc, f) => acc + f.total, 0);
    const totalCommissions = incomes.reduce((acc, p) => acc + (p.value * ((p.originalTransaction.commissionPercent || 0) / 100)), 0);

    // 3. RECEITA LÍQUIDA
    const receitaLiquida = receitaBruta - totalFees - totalCommissions;

    // 4. DESPESAS OPERACIONAIS
    const expensesByCategory = state.expenseCategories.map(cat => {
      const total = expenses
        .filter(p => p.originalTransaction.categoryId === cat.id)
        .reduce((acc, p) => acc + p.value, 0);
      return { name: cat.name, total };
    }).filter(c => c.total > 0);

    const totalExpenses = expensesByCategory.reduce((acc, c) => acc + c.total, 0);

    // 5. LUCRO LÍQUIDO
    const lucroLiquido = receitaLiquida - totalExpenses;

    return {
      receitaBruta,
      incomeByCategory,
      feesByPaymentMethod,
      totalFees,
      totalCommissions,
      receitaLiquida,
      expensesByCategory,
      totalExpenses,
      lucroLiquido,
      margem: receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0
    };
  };

  const data = getDRECalculations(selectedMonth, selectedYear);

  const historyData = months.map((m, idx) => {
    const d = getDRECalculations(idx, selectedYear);
    return { 
      month: m.substring(0, 3), 
      'Bruto': d.receitaBruta, 
      'Líquido': d.receitaLiquida,
      'Lucro': d.lucroLiquido 
    };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex-1 flex gap-2 w-full">
          <div className="relative flex-1">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(Number(e.target.value))} 
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
            >
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>
          <select 
            value={selectedYear} 
            onChange={e => setSelectedYear(Number(e.target.value))} 
            className="w-28 px-4 py-3 bg-gray-50 border border-transparent rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none text-center"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setShowAccountingView(true)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-[10px] tracking-wider transition-all ${showAccountingView ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
          >
            <Layers size={14} /> ESTRUTURA
          </button>
          <button 
            onClick={() => setShowAccountingView(false)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-[10px] tracking-wider transition-all ${!showAccountingView ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
          >
            <PieChart size={14} /> INDICADORES
          </button>
        </div>
      </div>

      {showAccountingView ? (
        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
          <div className="p-8 lg:p-12">
            <div className="flex justify-between items-center mb-12 border-b border-gray-50 pb-8">
              <div>
                <h3 className="text-2xl font-black text-gray-800 tracking-tight">Relatório de Resultado (Caixa)</h3>
                <p className="text-indigo-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Período: {months[selectedMonth]} {selectedYear}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-2xl">
                <FileText className="text-indigo-600" size={28} />
              </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-1">
              <DRERow label="RECEITA OPERACIONAL BRUTA" value={data.receitaBruta} variant="header" />
              
              <div className="pb-4">
                {data.incomeByCategory.map(cat => (
                  <DRERow key={cat.name} label={`(=) ${cat.name}`} value={cat.total} />
                ))}
              </div>

              <div className="py-4 space-y-1 bg-gray-50/30 rounded-2xl px-2 mb-4">
                <p className="px-6 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 mt-2">Deduções Reais</p>
                {data.feesByPaymentMethod.map(fee => (
                  <DRERow key={fee.name} label={`(-) Taxa ${fee.name}`} value={fee.total} variant="negative" />
                ))}
                <DRERow label="(-) Comissões" value={data.totalCommissions} variant="negative" />
              </div>

              <DRERow label="(=) RECEITA LÍQUIDA" value={data.receitaLiquida} />

              <div className="mt-8 mb-4">
                <div className="flex justify-between items-center px-6 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl mb-2">
                    <span className="uppercase tracking-widest text-[11px]">(-) DESPESAS OPERACIONAIS</span>
                    <span className="tabular-nums">-{formatCurrency(data.totalExpenses)}</span>
                </div>
                <div className="space-y-1">
                  {data.expensesByCategory.map(cat => (
                    <DRERow key={cat.name} label={`(-) ${cat.name}`} value={cat.total} variant="negative" />
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <div className={`p-8 rounded-[2.5rem] shadow-xl border-4 border-white transition-all flex justify-between items-center ${data.lucroLiquido >= 0 ? 'bg-indigo-600' : 'bg-rose-600'} text-white`}>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 block mb-1">Resultado Final</span>
                    <h4 className="text-3xl font-black tracking-tight uppercase">(=) LUCRO LÍQUIDO</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black block tabular-nums">{formatCurrency(data.lucroLiquido)}</span>
                    <div className="mt-2 inline-flex items-center gap-2 bg-white/15 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest">
                        MARGEM: {data.margem.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Calculator size={20} /></div>
                 <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Eficiência Financeira</h4>
               </div>
               <div className="space-y-8">
                 <div className="flex justify-between items-end">
                    <div>
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-1">Margem Líquida</span>
                        <span className={`text-2xl font-black ${data.margem >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{data.margem.toFixed(1)}%</span>
                    </div>
                    <div className="text-right">
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-1">Impacto de Caixa</span>
                        <span className="text-xl font-bold text-gray-700">{formatCurrency(data.receitaBruta)}</span>
                    </div>
                 </div>
                 <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
                    <div className={`h-full rounded-full transition-all duration-1000 ${data.margem >= 30 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{width: `${Math.min(100, Math.max(0, data.margem))}%`}}></div>
                 </div>
               </div>
             </div>
             
             <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-2">Saídas de Caixa</p>
                <h3 className="text-3xl font-black mb-6 tracking-tight text-rose-400">-{formatCurrency(data.totalExpenses)}</h3>
                <div className="flex items-center gap-2 text-[10px] font-black bg-white/10 w-fit px-4 py-2 rounded-full tracking-wider uppercase">
                   Saída de {((data.totalExpenses / (data.receitaBruta || 1)) * 100).toFixed(1)}% da Entrada
                </div>
             </div>
          </div>

          <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h4 className="text-sm font-black text-gray-400 mb-10 flex items-center gap-3 uppercase tracking-widest">
              <TrendingUp size={18} className="text-indigo-500" />
              Histórico de Recebimentos Reais
            </h4>
            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 700}} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800}} 
                    cursor={{fill: '#f8fafc'}} 
                  />
                  <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontWeight: 700, fontSize: '11px'}} />
                  <Bar name="Recebimento Bruto" dataKey="Bruto" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar name="Recebimento Líquido" dataKey="Líquido" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar name="Lucro de Caixa" dataKey="Lucro" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DRE;

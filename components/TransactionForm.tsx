import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Paperclip, 
  Tag, 
  User, 
  Building2, 
  Plus, 
  ArrowRightLeft, 
  CreditCard, 
  Landmark,
  Hotel,
  Receipt,
  Delete,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AppState, TransactionType, Transaction, Category, Supplier } from '../types';

interface TransactionFormProps {
  type: TransactionType;
  initialData?: Transaction;
  state: AppState;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id'>) => void;
  onAddSupplier?: (name: string) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ type, initialData, state, onClose, onSubmit, onAddSupplier }) => {
  const [valueStr, setValueStr] = useState(initialData ? initialData.value.toFixed(2).replace('.', ',') : '0,00');
  const [isValueFocused, setIsValueFocused] = useState(true);
  const [description, setDescription] = useState(initialData?.description || '');
  const [mainCategoryId, setMainCategoryId] = useState<'hospedagem' | 'outras_receitas' | undefined>(initialData?.mainCategoryId || (type === TransactionType.INCOME ? 'hospedagem' : undefined));
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [accountId, setAccountId] = useState(initialData?.accountId || '');
  const [targetAccountId, setTargetAccountId] = useState(initialData?.targetAccountId || '');
  const [paymentMethodId, setPaymentMethodId] = useState(initialData?.paymentMethodId || '');
  
  const [supplierId, setSupplierId] = useState(initialData?.supplierId || '');
  const [supplierSearch, setSupplierSearch] = useState((state.suppliers || []).find(s => s.id === (initialData?.supplierId))?.name || '');
  const [showSupplierResults, setShowSupplierResults] = useState(false);

  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [checkIn, setCheckIn] = useState(initialData?.checkIn || '');
  const [checkOut, setCheckOut] = useState(initialData?.checkOut || '');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const [guests, setGuests] = useState(initialData?.guests || 1);
  const [commissionPercent, setCommissionPercent] = useState(initialData?.commissionPercent || 0);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [repeatType, setRepeatType] = useState<'FIXO' | 'PARCELADO' | 'NONE'>(initialData?.repeatType || 'NONE');
  const [installments, setInstallments] = useState(initialData?.installments || 1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supplierResultsRef = useRef<HTMLDivElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);

  const theme = {
    bg: type === TransactionType.INCOME ? 'bg-emerald-600' : type === TransactionType.EXPENSE ? 'bg-rose-600' : 'bg-gray-900',
    text: type === TransactionType.INCOME ? 'text-emerald-600' : type === TransactionType.EXPENSE ? 'text-rose-600' : 'text-gray-900',
    border: type === TransactionType.INCOME ? 'border-emerald-600' : type === TransactionType.EXPENSE ? 'border-rose-600' : 'border-gray-900',
    ring: type === TransactionType.INCOME ? 'ring-emerald-500/10' : type === TransactionType.EXPENSE ? 'ring-rose-500/10' : 'ring-gray-900/10',
    lightBg: type === TransactionType.INCOME ? 'bg-emerald-50' : type === TransactionType.EXPENSE ? 'bg-rose-50' : 'bg-gray-100',
    lightBorder: type === TransactionType.INCOME ? 'border-emerald-100' : type === TransactionType.EXPENSE ? 'border-rose-100' : 'border-gray-200',
    focusRing: type === TransactionType.INCOME ? 'focus:ring-emerald-500' : type === TransactionType.EXPENSE ? 'focus:ring-rose-500' : 'focus:ring-gray-900',
  };

  const formatValue = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '0,00';
    const numberValue = parseInt(digits) / 100;
    return numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleKeypad = (val: string) => {
    if (!isValueFocused) return;
    const currentDigits = valueStr.replace(/\D/g, '');
    setValueStr(formatValue(currentDigits + val));
  };

  const handleBackspace = () => {
    if (!isValueFocused) return;
    const currentDigits = valueStr.replace(/\D/g, '');
    setValueStr(formatValue(currentDigits.slice(0, -1)));
  };

  const handleManualValueInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setValueStr(formatValue(rawValue));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (supplierResultsRef.current && !supplierResultsRef.current.contains(event.target as Node)) setShowSupplierResults(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const filteredSubcategories = type === TransactionType.INCOME 
    ? (state.incomeCategories || []).filter(c => c.parentId === mainCategoryId)
    : (state.expenseCategories || []);

  const selectSupplier = (s: Supplier) => {
    setSupplierId(s.id);
    setSupplierSearch(s.name);
    setShowSupplierResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(valueStr.replace(/\./g, '').replace(',', '.'));
    onSubmit({
      type,
      value: numValue,
      description,
      date,
      categoryId: type === TransactionType.TRANSFER ? 'TRANSFER' : categoryId,
      accountId,
      targetAccountId: type === TransactionType.TRANSFER ? targetAccountId : undefined,
      paymentMethodId,
      mainCategoryId,
      supplierId: type === TransactionType.EXPENSE ? supplierId : undefined,
      checkIn: (type === TransactionType.INCOME && mainCategoryId === 'hospedagem') ? checkIn : undefined,
      checkOut: (type === TransactionType.INCOME && mainCategoryId === 'hospedagem') ? checkOut : undefined,
      guests: (type === TransactionType.INCOME && mainCategoryId === 'hospedagem') ? guests : undefined,
      commissionPercent: type !== TransactionType.TRANSFER ? commissionPercent : undefined,
      notes,
      repeatType,
      installments: repeatType === 'PARCELADO' ? installments : undefined
    });
  };

  // Lógica do Calendário Customizado (Booking Style)
  const calendarDays = useMemo(() => {
    const start = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const end = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
    const days = [];
    
    // Preencher dias vazios antes do início do mês
    const startDay = start.getDay();
    for (let i = 0; i < startDay; i++) days.push(null);
    
    // Preencher os dias do mês
    for (let i = 1; i <= end.getDate(); i++) {
      days.push(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i));
    }
    
    return days;
  }, [calendarMonth]);

  const handleDateClick = (d: Date) => {
    const dateStr = d.toISOString().split('T')[0];
    
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut('');
    } else if (checkIn && !checkOut) {
      if (new Date(dateStr) < new Date(checkIn)) {
        setCheckIn(dateStr);
      } else if (dateStr === checkIn) {
        setCheckIn('');
      } else {
        setCheckOut(dateStr);
        setShowCalendar(false); // Fecha ao completar o período
      }
    }
  };

  const isDateInRange = (d: Date) => {
    if (!checkIn || !checkOut) return false;
    const current = d.getTime();
    return current > new Date(checkIn).getTime() && current < new Date(checkOut).getTime();
  };

  const formatDateLabel = (str: string) => {
    if (!str) return 'Selecionar';
    const [y, m, d] = str.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-[3.5rem] w-full max-w-6xl my-auto overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className={`p-6 flex items-center justify-between text-white ${theme.bg}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-2xl">
              {type === TransactionType.INCOME ? <Plus size={24} /> : 
               type === TransactionType.EXPENSE ? <Plus size={24} /> : <ArrowRightLeft size={24} />}
            </div>
            <h3 className="text-2xl font-black">
              {initialData ? 'Editar Lançamento' : (
                type === TransactionType.INCOME ? 'Nova Receita' : 
                type === TransactionType.EXPENSE ? 'Nova Despesa' : 'Nova Transferência'
              )}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90">
            <X size={32} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-8 bg-gray-50/50 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* SESSÃO 1: LANÇAMENTO (Valor e Teclado) */}
            <div 
              className={`bg-white p-8 rounded-[3rem] shadow-sm border-2 transition-all cursor-pointer flex flex-col ${
                isValueFocused ? `${theme.border} ring-4 ${theme.ring}` : 'border-gray-100 hover:border-gray-200'
              }`}
              onClick={() => {
                setIsValueFocused(true);
                valueInputRef.current?.focus();
              }}
            >
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 block">Sessão 1: Lançamento</label>
              
              <div className="flex items-center gap-2 mb-8 bg-gray-50 p-8 rounded-[2.5rem] w-full justify-center border border-gray-100 group">
                <span className={`text-3xl font-black ${theme.text}`}>R$</span>
                <input
                  ref={valueInputRef}
                  type="text"
                  inputMode="numeric"
                  value={valueStr}
                  onChange={handleManualValueInput}
                  onFocus={() => setIsValueFocused(true)}
                  className="bg-transparent text-6xl font-black text-gray-800 tabular-nums border-none outline-none focus:ring-0 w-full text-center max-w-[320px]"
                />
              </div>

              <div className={`grid grid-cols-3 gap-4 w-full max-w-[340px] mx-auto flex-1 items-center transition-all duration-300 ${!isValueFocused ? 'opacity-20 grayscale pointer-events-none' : 'opacity-100'}`}>
                {[1,2,3,4,5,6,7,8,9,0].map(n => (
                  <button 
                    key={n} type="button" 
                    onClick={(e) => { e.stopPropagation(); handleKeypad(n.toString()); valueInputRef.current?.focus(); }}
                    className={`h-14 bg-white hover:${theme.lightBg} font-black text-2xl rounded-2xl border border-gray-100 transition-all active:scale-95 text-gray-700 shadow-sm`}
                  >
                    {n}
                  </button>
                ))}
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); handleBackspace(); valueInputRef.current?.focus(); }}
                  className={`h-14 col-span-2 bg-white hover:${theme.lightBg} font-black text-xl rounded-2xl border border-gray-100 transition-all active:scale-95 flex items-center justify-center shadow-sm text-gray-700`}
                >
                  <Delete size={24} />
                </button>
              </div>
            </div>

            {/* SESSÃO 2: INFORMAÇÕES (Descrição, Categoria, Datas) */}
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 space-y-6 flex flex-col">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Sessão 2: Informações</label>
              
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" placeholder="Descrição do lançamento..." 
                  value={description} onChange={e => setDescription(e.target.value)}
                  onFocus={() => { setIsValueFocused(false); setShowCalendar(false); }}
                  className={`w-full pl-16 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-full focus:outline-none focus:ring-2 ${theme.focusRing} transition-all font-bold text-gray-700 shadow-sm`}
                  required
                />
              </div>

              {type === TransactionType.INCOME ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => { setIsValueFocused(false); setMainCategoryId('hospedagem'); setCategoryId(''); }} className={`flex items-center justify-center gap-2 py-4 rounded-full font-black text-xs transition-all border-2 ${mainCategoryId === 'hospedagem' ? `${theme.bg} text-white ${theme.border}` : 'bg-gray-50 text-gray-400 border-gray-100'}`}><Hotel size={18} /> HOSPEDAGEM</button>
                    <button type="button" onClick={() => { setIsValueFocused(false); setMainCategoryId('outras_receitas'); setCategoryId(''); setShowCalendar(false); }} className={`flex items-center justify-center gap-2 py-4 rounded-full font-black text-xs transition-all border-2 ${mainCategoryId === 'outras_receitas' ? `${theme.bg} text-white ${theme.border}` : 'bg-gray-50 text-gray-400 border-gray-100'}`}><Receipt size={18} /> OUTRAS RECEITAS</button>
                  </div>
                  <div className="relative">
                    <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select value={categoryId} onFocus={() => { setIsValueFocused(false); setShowCalendar(false); }} onChange={e => setCategoryId(e.target.value)} className={`w-full pl-16 pr-12 py-5 bg-gray-50 border border-gray-100 rounded-full appearance-none cursor-pointer font-bold text-gray-700 shadow-sm`} required>
                      <option value="">{mainCategoryId === 'hospedagem' ? 'SELECIONAR UH' : 'SELECIONAR SERVIÇO'}</option>
                      {filteredSubcategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  
                  {mainCategoryId === 'hospedagem' && (
                    <div className={`${theme.lightBg} p-6 rounded-[2.5rem] border ${theme.lightBorder} space-y-4`}>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          type="button" 
                          onClick={() => { setIsValueFocused(false); setShowCalendar(true); }}
                          className={`flex flex-col items-center justify-center p-3 bg-white border ${showCalendar && !checkOut ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-100'} rounded-[1.5rem] transition-all`}
                        >
                          <span className={`text-[8px] font-black uppercase mb-1 ${theme.text}`}>Check-in</span>
                          <span className="text-sm font-black text-gray-700">{formatDateLabel(checkIn)}</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => { setIsValueFocused(false); setShowCalendar(true); }}
                          className={`flex flex-col items-center justify-center p-3 bg-white border ${showCalendar && checkIn && !checkOut ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-100'} rounded-[1.5rem] transition-all`}
                        >
                          <span className={`text-[8px] font-black uppercase mb-1 ${theme.text}`}>Check-out</span>
                          <span className="text-sm font-black text-gray-700">{formatDateLabel(checkOut)}</span>
                        </button>
                      </div>

                      {/* Painel de Calendário "Booking Style" */}
                      {showCalendar && (
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center justify-between mb-4 px-2">
                            <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} className="p-2 hover:bg-gray-50 rounded-full text-gray-400"><ChevronLeft size={20}/></button>
                            <span className="font-black text-gray-700 uppercase tracking-widest text-xs">{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(calendarMonth)}</span>
                            <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} className="p-2 hover:bg-gray-50 rounded-full text-gray-400"><ChevronRight size={20}/></button>
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['D','S','T','Q','Q','S','S'].map(d => <span key={d} className="text-[9px] font-black text-gray-300">{d}</span>)}
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((d, i) => {
                              if (!d) return <div key={`empty-${i}`} className="h-9" />;
                              const dateStr = d.toISOString().split('T')[0];
                              const isToday = dateStr === new Date().toISOString().split('T')[0];
                              const isStart = dateStr === checkIn;
                              const isEnd = dateStr === checkOut;
                              const inRange = isDateInRange(d);
                              
                              return (
                                <button
                                  key={dateStr}
                                  type="button"
                                  onClick={() => handleDateClick(d)}
                                  className={`h-9 relative flex items-center justify-center text-xs font-bold rounded-lg transition-all
                                    ${inRange ? 'bg-emerald-50 text-emerald-700' : ''}
                                    ${isStart || isEnd ? 'bg-emerald-600 text-white z-10 scale-110 shadow-md !rounded-full' : 'hover:bg-gray-100 text-gray-600'}
                                    ${isToday && !isStart && !isEnd ? 'border-2 border-emerald-100' : ''}
                                  `}
                                >
                                  {d.getDate()}
                                  {isToday && !isStart && !isEnd && <div className="absolute bottom-1 w-1 h-1 bg-emerald-500 rounded-full" />}
                                </button>
                              );
                            })}
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setShowCalendar(false)} 
                            className="w-full mt-4 py-2 bg-gray-50 text-[10px] font-black text-gray-400 rounded-xl hover:bg-gray-100 uppercase"
                          >
                            Fechar Calendário
                          </button>
                        </div>
                      )}

                      <div className="flex justify-between items-center px-4">
                        <span className={`text-[10px] font-black ${theme.text} uppercase`}>Diárias: {calculateNights()}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black ${theme.text} uppercase`}>Pessoas:</span>
                          <input type="number" value={guests} onFocus={() => { setIsValueFocused(false); setShowCalendar(false); }} onChange={e => setGuests(Number(e.target.value))} className="w-16 p-2 bg-white border border-gray-100 rounded-full text-xs font-black text-center" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : type === TransactionType.EXPENSE ? (
                <div className="space-y-4">
                  <div className="relative" ref={supplierResultsRef}>
                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Buscar Fornecedor..." value={supplierSearch} onFocus={() => { setIsValueFocused(false); setShowSupplierResults(true); }} onChange={(e) => { setSupplierSearch(e.target.value); setSupplierId(''); setShowSupplierResults(true); }} className={`w-full pl-16 pr-12 py-5 bg-gray-50 border border-gray-100 rounded-full font-bold text-gray-700 shadow-sm`} />
                    {showSupplierResults && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-50 max-h-48 overflow-y-auto p-2">
                        {(state.suppliers || []).filter(s => s.name.toLowerCase().includes(supplierSearch.toLowerCase())).map(s => (
                          <button key={s.id} type="button" onClick={() => selectSupplier(s)} className="w-full text-left p-4 hover:bg-gray-50 rounded-2xl transition-colors font-bold text-gray-700">{s.name}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select value={categoryId} onFocus={() => setIsValueFocused(false)} onChange={e => setCategoryId(e.target.value)} className={`w-full pl-16 pr-12 py-5 bg-gray-50 border border-gray-100 rounded-full appearance-none font-bold text-gray-700 shadow-sm`} required>
                      <option value="">Selecionar Categoria de Saída</option>
                      {filteredSubcategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              ) : null}

              <div className="relative mt-auto">
                <CalendarIcon className={`absolute left-6 top-1/2 -translate-y-1/2 ${theme.text}`} size={20} />
                <input 
                  type="date" value={date} onChange={e => setDate(e.target.value)}
                  onFocus={() => { setIsValueFocused(false); setShowCalendar(false); }}
                  className={`w-full pl-16 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-full font-black text-gray-700 shadow-sm`}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-gray-100 space-y-8">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">Sessão 3: Dados de Pagamento / Destino</label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                {type === TransactionType.TRANSFER ? <Landmark className={`absolute left-6 top-1/2 -translate-y-1/2 ${theme.text}`} size={20} /> : <CreditCard className={`absolute left-6 top-1/2 -translate-y-1/2 ${theme.text}`} size={20} />}
                <select 
                  value={type === TransactionType.TRANSFER ? accountId : paymentMethodId} 
                  onFocus={() => { setIsValueFocused(false); setShowCalendar(false); }}
                  onChange={e => type === TransactionType.TRANSFER ? setAccountId(e.target.value) : setPaymentMethodId(e.target.value)} 
                  className={`w-full pl-16 pr-12 py-5 bg-gray-50 border border-gray-100 rounded-full appearance-none font-bold text-gray-700 shadow-sm text-center`} 
                  required
                >
                  <option value="">{type === TransactionType.TRANSFER ? 'CONTA DE ORIGEM' : 'MÉTODO DE PAGAMENTO'}</option>
                  {(type === TransactionType.TRANSFER ? (state.accounts || []) : (state.paymentMethods || [])).map(p => <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="relative">
                <Landmark className={`absolute left-6 top-1/2 -translate-y-1/2 ${theme.text}`} size={20} />
                <select 
                  value={type === TransactionType.TRANSFER ? targetAccountId : accountId} 
                  onFocus={() => { setIsValueFocused(false); setShowCalendar(false); }}
                  onChange={e => type === TransactionType.TRANSFER ? setTargetAccountId(e.target.value) : setAccountId(e.target.value)} 
                  className={`w-full pl-16 pr-12 py-5 bg-gray-50 border border-gray-100 rounded-full appearance-none font-bold text-gray-700 shadow-sm text-center`} 
                  required
                >
                  <option value="">{type === TransactionType.TRANSFER ? 'CONTA DE DESTINO' : 'CONTA FINANCEIRA'}</option>
                  {(state.accounts || []).map(a => <option key={a.id} value={a.id}>{a.name.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="flex flex-wrap items-center justify-center gap-6 py-5 px-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 min-h-[90px]">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Repetição</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setIsValueFocused(false); setRepeatType('FIXO'); setShowCalendar(false); }} className={`px-8 py-3 rounded-full font-black text-[10px] transition-all ${repeatType === 'FIXO' ? `${theme.bg} text-white` : `bg-white text-gray-400 border border-gray-200`}`}>FIXO</button>
                  <button type="button" onClick={() => { setIsValueFocused(false); setRepeatType('PARCELADO'); setShowCalendar(false); }} className={`px-8 py-3 rounded-full font-black text-[10px] transition-all ${repeatType === 'PARCELADO' ? `${theme.bg} text-white` : `bg-white text-gray-400 border border-gray-200`}`}>PARCELADO</button>
                </div>
                {repeatType === 'PARCELADO' && (
                  <input type="number" min="2" value={installments} onFocus={() => { setIsValueFocused(false); setShowCalendar(false); }} onChange={e => setInstallments(parseInt(e.target.value))} className={`w-20 p-3 bg-white border border-gray-200 rounded-full text-center font-black ${theme.text}`} placeholder="Qtd" />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                <button type="button" onClick={() => { setIsValueFocused(false); setShowCalendar(false); fileInputRef.current?.click(); }} className="flex items-center justify-center gap-3 py-5 bg-gray-50 border border-gray-100 rounded-[2.5rem] text-gray-400 font-black text-[10px] uppercase hover:bg-gray-100 transition-all">Anexar <Paperclip size={18} className={theme.text} /></button>
                <input type="file" ref={fileInputRef} className="hidden" />
                
                {type !== TransactionType.TRANSFER ? (
                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[2.5rem] overflow-hidden p-1">
                    <span className="px-4 text-[9px] font-black text-gray-400 uppercase">Comissão</span>
                    <input type="number" value={commissionPercent} onFocus={() => { setIsValueFocused(false); setShowCalendar(false); }} onChange={e => setCommissionPercent(Number(e.target.value))} className="w-full h-full bg-white rounded-full font-black text-center text-sm focus:outline-none" />
                    <span className={`px-4 font-black ${theme.text}`}>%</span>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200 flex items-center justify-center text-[9px] font-black text-gray-300 uppercase">Transferência Isenta</div>
                )}
              </div>
            </div>

            <textarea 
              value={notes} 
              onFocus={() => { setIsValueFocused(false); setShowCalendar(false); }}
              onChange={e => setNotes(e.target.value)}
              placeholder="Notas adicionais e observações importantes..."
              className="w-full p-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[120px]"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 pb-8">
            <button type="button" onClick={onClose} className="px-10 py-5 bg-white border border-gray-200 text-gray-500 font-black rounded-full hover:bg-gray-50 transition-all active:scale-95 uppercase tracking-widest text-xs">Cancelar</button>
            <button type="submit" className={`px-12 py-5 ${theme.bg} text-white font-black rounded-full shadow-2xl transition-all active:scale-95 uppercase tracking-widest text-xs`}>Salvar Lançamento</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
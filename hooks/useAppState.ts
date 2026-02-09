
import { useState, useEffect, useCallback } from 'react';
import { AppState, Category, Account, PaymentMethod, Origin, Supplier, Transaction, AppConfig } from '../types';
import { 
  INITIAL_INCOME_CATEGORIES, 
  INITIAL_EXPENSE_CATEGORIES, 
  INITIAL_ACCOUNTS, 
  INITIAL_PAYMENT_METHODS, 
  INITIAL_ORIGINS 
} from '../constants';

const STORAGE_KEY = 'hospeda_finance_state';

export const useAppState = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      config: {
        companyName: 'Minha Hospedagem',
        logoUrl: 'https://picsum.photos/200/200',
        googleDriveFolder: '',
        googleSheetsLink: ''
      },
      incomeCategories: INITIAL_INCOME_CATEGORIES,
      expenseCategories: INITIAL_EXPENSE_CATEGORIES,
      accounts: INITIAL_ACCOUNTS,
      paymentMethods: INITIAL_PAYMENT_METHODS,
      origins: INITIAL_ORIGINS,
      suppliers: [],
      transactions: []
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateConfig = (config: Partial<AppConfig>) => {
    setState(prev => ({ ...prev, config: { ...prev.config, ...config } }));
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: Date.now().toString() };
    setState(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions]
    }));
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const deleteTransaction = (id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  // Fixed TypeScript error by casting to any[] to safely spread generic state arrays
  const addItem = useCallback(<T extends { id: string },>(key: keyof AppState, item: Omit<T, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() } as unknown as T;
    setState(prev => ({
      ...prev,
      [key]: [...(prev[key] as any[]), newItem]
    }));
  }, []);

  const deleteItem = useCallback((key: keyof AppState, id: string) => {
    setState(prev => ({
      ...prev,
      [key]: (prev[key] as any[]).filter(item => item.id !== id)
    }));
  }, []);

  return {
    state,
    updateConfig,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addItem,
    deleteItem
  };
};

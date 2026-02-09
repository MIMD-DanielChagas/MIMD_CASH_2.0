
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export interface Category {
  id: string;
  name: string;
  parentId?: 'hospedagem' | 'outras_receitas'; // Identificador da categoria pai para Entradas
}

export interface PaymentMethod {
  id: string;
  name: string;
  fee: number;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
}

export interface Origin {
  id: string;
  name: string;
  fee: number;
}

export interface Supplier {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  value: number;
  description: string;
  date: string;
  categoryId: string;
  paymentMethodId: string;
  accountId: string; // Target account for Income, Source for Expense
  targetAccountId?: string; // Only for Transfer
  supplierId?: string; // Only for Expense
  
  // Specific for Income
  mainCategoryId?: 'hospedagem' | 'outras_receitas';
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  originId?: string;
  commissionPercent?: number;
  
  notes?: string;
  attachment?: string;
  repeatType?: 'FIXO' | 'PARCELADO' | 'NONE';
  installments?: number;
}

export interface AppConfig {
  companyName: string;
  logoUrl: string;
  googleDriveFolder: string;
  googleSheetsLink: string;
}

export interface AppState {
  config: AppConfig;
  incomeCategories: Category[];
  expenseCategories: Category[];
  accounts: Account[];
  paymentMethods: PaymentMethod[];
  origins: Origin[];
  suppliers: Supplier[];
  transactions: Transaction[];
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum RepeatType {
  NONE = 'NONE',
  FIXO = 'FIXO',
  PARCELADO = 'PARCELADO'
}

export interface Category {
  id: string;
  nome_categoria: string;
  descricao: string;
  ativa: boolean;
  parentId?: string;
}

export interface Origin {
  id: string;
  name: string;
  descricao?: string;
  ativa: boolean;
}

export interface PaymentMethod {
  id: string;
  nome_metodo: string;
  descricao: string;
  ativa: boolean;
}

export interface Account {
  id: string;
  nome_banco: string;
  agencia: string;
  numero_conta: string;
  saldo_inicial: number;
  saldo_atual: number;
  data_criacao: string;
}

export interface Supplier {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  data_criacao: string;
  ativa: boolean;
}

export interface Transaction {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: TransactionType;
  categoria: string;
  metodo_pagamento: string;
  conta: string;
  status: TransactionStatus;
  fornecedor?: string;
  notas?: string;
  anexo?: string;
  data_vencimento?: string;
  data_pagamento?: string;
  repeticao?: RepeatType;
  parcelas?: number;
  comissao_percent?: number;
  check_in?: string;
  check_out?: string;
  hospedes?: number;
  origem?: string;
  type?: TransactionType;
  mainCategoryId?: string;
  targetAccountId?: string;
  paymentMethodId?: string;
  supplierId?: string;
  checkIn?: string;
  checkOut?: string;
}

export interface DREReport {
  total_receitas: number;
  total_despesas: number;
  lucro_liquido: number;
  margem_lucro: number;
}

export interface AppConfig {
  id?: string;
  nome_empresa?: string;
  foto_url?: string;
  email?: string;
  telefone?: string;
  data_criacao?: string;
  spreadsheetId?: string;
  spreadsheetName?: string;
  companyName?: string;
  logoUrl?: string;
}

export interface AppState {
  config: AppConfig;
  incomeCategories: Category[];
  expenseCategories: Category[];
  accounts: Account[];
  paymentMethods: PaymentMethod[];
  suppliers: Supplier[];
  origins: Origin[];
  transactions: Transaction[];
  dre?: DREReport;
}
import axios from 'axios';
import { Transaction, Account, PaymentMethod, Category, Supplier, AppConfig, TransactionType } from '../types';

const GOOGLE_SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

// Interface para dados da planilha
export interface SheetData {
  values: string[][];
  range: string;
}

// Interface para resposta de append
export interface AppendResponse {
  spreadsheetId: string;
  updatedRange: string;
  updatedRows: number;
  updatedColumns: number;
  updatedCells: number;
}

// Interface para resposta de update
export interface UpdateResponse {
  spreadsheetId: string;
  updatedRange: string;
  updatedRows: number;
  updatedColumns: number;
  updatedCells: number;
}

// Interface para resposta de clear
export interface ClearResponse {
  spreadsheetId: string;
  clearedRange: string;
}

/**
 * Busca dados de um intervalo específico da planilha
 * @param spreadsheetId - ID da planilha
 * @param range - Intervalo (ex: "lancamentos!A:F")
 * @param token - Token de autenticação do Google
 * @returns Dados da planilha
 */
export const fetchSheetData = async (
  spreadsheetId: string,
  range: string,
  token: string
): Promise<SheetData> => {
  try {
    if (!spreadsheetId || !range || !token) {
      throw new Error('spreadsheetId, range e token são obrigatórios');
    }

    const response = await axios.get(
      `${GOOGLE_SHEETS_API_URL}/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados do Google Sheets:', error);
    throw new Error(`Erro ao buscar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

/**
 * Adiciona dados ao final de um intervalo (append)
 * @param spreadsheetId - ID da planilha
 * @param range - Intervalo (ex: "lancamentos!A:F")
 * @param values - Dados a adicionar
 * @param token - Token de autenticação do Google
 * @returns Resposta da operação
 */
export const appendSheetData = async (
  spreadsheetId: string,
  range: string,
  values: string[][],
  token: string
): Promise<AppendResponse> => {
  try {
    if (!spreadsheetId || !range || !values || values.length === 0 || !token) {
      throw new Error('spreadsheetId, range, values e token são obrigatórios');
    }

    const response = await axios.post(
      `${GOOGLE_SHEETS_API_URL}/${spreadsheetId}/values/${encodeURIComponent(range)}:append`,
      {
        values,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          valueInputOption: 'USER_ENTERED',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar dados ao Google Sheets:', error);
    throw new Error(`Erro ao adicionar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

/**
 * Atualiza dados em um intervalo específico
 * @param spreadsheetId - ID da planilha
 * @param range - Intervalo (ex: "lancamentos!A2:F2")
 * @param values - Dados a atualizar
 * @param token - Token de autenticação do Google
 * @returns Resposta da operação
 */
export const updateSheetData = async (
  spreadsheetId: string,
  range: string,
  values: string[][],
  token: string
): Promise<UpdateResponse> => {
  try {
    if (!spreadsheetId || !range || !values || values.length === 0 || !token) {
      throw new Error('spreadsheetId, range, values e token são obrigatórios');
    }

    const response = await axios.put(
      `${GOOGLE_SHEETS_API_URL}/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      {
        values,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          valueInputOption: 'USER_ENTERED',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar dados do Google Sheets:', error);
    throw new Error(`Erro ao atualizar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

/**
 * Limpa dados em um intervalo específico
 * @param spreadsheetId - ID da planilha
 * @param range - Intervalo (ex: "lancamentos!A2:F2")
 * @param token - Token de autenticação do Google
 * @returns Resposta da operação
 */
export const clearSheetData = async (
  spreadsheetId: string,
  range: string,
  token: string
): Promise<ClearResponse> => {
  try {
    if (!spreadsheetId || !range || !token) {
      throw new Error('spreadsheetId, range e token são obrigatórios');
    }

    const response = await axios.post(
      `${GOOGLE_SHEETS_API_URL}/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao limpar dados do Google Sheets:', error);
    throw new Error(`Erro ao limpar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

/**
 * Busca dados de múltiplos intervalos simultaneamente
 * @param spreadsheetId - ID da planilha
 * @param ranges - Array de intervalos (ex: ["config!A:B", "lancamentos!A:F"])
 * @param token - Token de autenticação do Google
 * @returns Array com dados de cada intervalo
 */
export const fetchMultipleRanges = async (
  spreadsheetId: string,
  ranges: string[],
  token: string
): Promise<SheetData[]> => {
  try {
    if (!spreadsheetId || !ranges || ranges.length === 0 || !token) {
      throw new Error('spreadsheetId, ranges e token são obrigatórios');
    }

    const response = await axios.get(
      `${GOOGLE_SHEETS_API_URL}/${spreadsheetId}/values:batchGet`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          ranges: ranges,
        },
      }
    );

    return response.data.valueRanges || [];
  } catch (error) {
    console.error('Erro ao buscar múltiplos intervalos do Google Sheets:', error);
    throw new Error(`Erro ao buscar múltiplos intervalos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

/**
 * Atualiza múltiplos intervalos simultaneamente
 * @param spreadsheetId - ID da planilha
 * @param data - Array com { range, values }
 * @param token - Token de autenticação do Google
 * @returns Resposta da operação
 */
export const batchUpdateSheetData = async (
  spreadsheetId: string,
  data: Array<{ range: string; values: string[][] }>,
  token: string
): Promise<any> => {
  try {
    if (!spreadsheetId || !data || data.length === 0 || !token) {
      throw new Error('spreadsheetId, data e token são obrigatórios');
    }

    const response = await axios.post(
      `${GOOGLE_SHEETS_API_URL}/${spreadsheetId}/values:batchUpdate`,
      {
        valueInputOption: 'USER_ENTERED',
        data: data,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar múltiplos intervalos do Google Sheets:', error);
    throw new Error(`Erro ao atualizar múltiplos intervalos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

/**
 * Valida se a planilha existe e é acessível
 * @param spreadsheetId - ID da planilha
 * @param token - Token de autenticação do Google
 * @returns true se a planilha é acessível
 */
export const validateSpreadsheet = async (
  spreadsheetId: string,
  token: string
): Promise<boolean> => {
  try {
    if (!spreadsheetId || !token) {
      throw new Error('spreadsheetId e token são obrigatórios');
    }

    const response = await axios.get(
      `${GOOGLE_SHEETS_API_URL}/${spreadsheetId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error('Erro ao validar planilha:', error);
    return false;
  }
};

// ===== FUNÇÕES DE NEGÓCIO (Alto Nível) =====

/**
 * Inicializa a planilha com as abas necessárias
 * @param spreadsheetId - ID da planilha
 * @param token - Token de autenticação do Google
 */
export const initializeSpreadsheet = async (
  spreadsheetId: string,
  token: string
): Promise<boolean> => {
  try {
    // Validar se a planilha existe
    const isValid = await validateSpreadsheet(spreadsheetId, token);
    if (!isValid) {
      throw new Error('Planilha não encontrada ou não acessível');
    }

    // Definir headers para cada aba
    const sheetsHeaders = {
      'config': [['chave', 'valor']],
      'contas': [['id', 'nome', 'saldo']],
      'metodos_pagamento': [['id', 'nome', 'taxa']],
      'categorias_receita': [['id', 'nome', 'categoria_pai']],
      'categorias_despesa': [['id', 'nome', 'categoria_pai']],
      'fornecedores': [['id', 'nome']],
      'lancamentos': [['id', 'tipo', 'valor', 'descricao', 'data', 'categoria_id', 'conta_id', 'metodo_pagamento_id', 'conta_destino_id', 'fornecedor_id', 'categoria_principal', 'check_in', 'check_out', 'hospedes', 'origem_id', 'comissao_percent', 'notas', 'anexo', 'tipo_repeticao', 'parcelas']],
    };

    // Tentar adicionar headers em cada aba
    for (const [sheetName, headers] of Object.entries(sheetsHeaders)) {
      try {
        await appendSheetData(spreadsheetId, `${sheetName}!A1`, headers, token);
      } catch (error) {
        // Aba pode já existir, continuar
        console.log(`Aba ${sheetName} já existe ou foi criada`);
      }
    }

    return true;
  } catch (error) {
    console.error('Erro ao inicializar planilha:', error);
    return false;
  }
};

// ===== CARREGAR DADOS =====

/**
 * Carrega todas as contas da planilha
 */
export const loadAccounts = async (
  spreadsheetId: string,
  token: string
): Promise<Account[]> => {
  try {
    const data = await fetchSheetData(spreadsheetId, 'contas!A2:C', token);
    
    if (!data.values) return [];

    return data.values.map((row: string[]) => ({
      id: row[0],
      name: row[1],
      balance: parseFloat(row[2]) || 0,
    }));
  } catch (error) {
    console.error('Erro ao carregar contas:', error);
    return [];
  }
};

/**
 * Carrega todos os métodos de pagamento da planilha
 */
export const loadPaymentMethods = async (
  spreadsheetId: string,
  token: string
): Promise<PaymentMethod[]> => {
  try {
    const data = await fetchSheetData(spreadsheetId, 'metodos_pagamento!A2:C', token);
    
    if (!data.values) return [];

    return data.values.map((row: string[]) => ({
      id: row[0],
      name: row[1],
      fee: parseFloat(row[2]) || 0,
    }));
  } catch (error) {
    console.error('Erro ao carregar métodos de pagamento:', error);
    return [];
  }
};

/**
 * Carrega todas as categorias de receita da planilha
 */
export const loadIncomeCategories = async (
  spreadsheetId: string,
  token: string
): Promise<Category[]> => {
  try {
    const data = await fetchSheetData(spreadsheetId, 'categorias_receita!A2:C', token);
    
    if (!data.values) return [];

    return data.values.map((row: string[]) => ({
      id: row[0],
      name: row[1],
      parentId: row[2] as 'hospedagem' | 'outras_receitas' | undefined,
    }));
  } catch (error) {
    console.error('Erro ao carregar categorias de receita:', error);
    return [];
  }
};

/**
 * Carrega todas as categorias de despesa da planilha
 */
export const loadExpenseCategories = async (
  spreadsheetId: string,
  token: string
): Promise<Category[]> => {
  try {
    const data = await fetchSheetData(spreadsheetId, 'categorias_despesa!A2:C', token);
    
    if (!data.values) return [];

    return data.values.map((row: string[]) => ({
      id: row[0],
      name: row[1],
      parentId: row[2] as 'hospedagem' | 'outras_receitas' | undefined,
    }));
  } catch (error) {
    console.error('Erro ao carregar categorias de despesa:', error);
    return [];
  }
};

/**
 * Carrega todos os fornecedores da planilha
 */
export const loadSuppliers = async (
  spreadsheetId: string,
  token: string
): Promise<Supplier[]> => {
  try {
    const data = await fetchSheetData(spreadsheetId, 'fornecedores!A2:B', token);
    
    if (!data.values) return [];

    return data.values.map((row: string[]) => ({
      id: row[0],
      name: row[1],
    }));
  } catch (error) {
    console.error('Erro ao carregar fornecedores:', error);
    return [];
  }
};

/**
 * Carrega todos os lançamentos da planilha
 */
export const loadTransactions = async (
  spreadsheetId: string,
  token: string
): Promise<Transaction[]> => {
  try {
    const data = await fetchSheetData(spreadsheetId, 'lancamentos!A2:T', token);
    
    if (!data.values) return [];

    return data.values.map((row: string[]) => ({
      id: row[0],
      type: row[1] as TransactionType,
      value: parseFloat(row[2]) || 0,
      description: row[3],
      date: row[4],
      categoryId: row[5],
      accountId: row[6],
      paymentMethodId: row[7],
      targetAccountId: row[8] || undefined,
      supplierId: row[9] || undefined,
      mainCategoryId: row[10] as 'hospedagem' | 'outras_receitas' | undefined,
      checkIn: row[11] || undefined,
      checkOut: row[12] || undefined,
      guests: row[13] ? parseInt(row[13]) : undefined,
      originId: row[14] || undefined,
      commissionPercent: row[15] ? parseFloat(row[15]) : undefined,
      notes: row[16] || undefined,
      attachment: row[17] || undefined,
      repeatType: row[18] as 'FIXO' | 'PARCELADO' | 'NONE' | undefined,
      installments: row[19] ? parseInt(row[19]) : undefined,
    }));
  } catch (error) {
    console.error('Erro ao carregar lançamentos:', error);
    return [];
  }
};

/**
 * Carrega a configuração da planilha
 */
export const loadConfig = async (
  spreadsheetId: string,
  token: string
): Promise<AppConfig | null> => {
  try {
    const data = await fetchSheetData(spreadsheetId, 'config!A2:B', token);
    
    if (!data.values) return null;

    const config: AppConfig = {
      companyName: '',
      logoUrl: '',
      googleDriveFolder: '',
      googleSheetsLink: '',
    };

    data.values.forEach((row: string[]) => {
      const key = row[0];
      const value = row[1];

      if (key === 'companyName') config.companyName = value;
      if (key === 'logoUrl') config.logoUrl = value;
      if (key === 'googleDriveFolder') config.googleDriveFolder = value;
      if (key === 'googleSheetsLink') config.googleSheetsLink = value;
      if (key === 'spreadsheetId') config.spreadsheetId = value;
      if (key === 'spreadsheetName') config.spreadsheetName = value;
    });

    return config;
  } catch (error) {
    console.error('Erro ao carregar configuração:', error);
    return null;
  }
};

// ===== ADICIONAR DADOS =====

/**
 * Adiciona um novo lançamento à planilha
 */
export const addTransaction = async (
  spreadsheetId: string,
  transaction: Transaction,
  token: string
): Promise<boolean> => {
  try {
    const row = [[
      transaction.id,
      transaction.type,
      transaction.value.toString(),
      transaction.description,
      transaction.date,
      transaction.categoryId,
      transaction.accountId,
      transaction.paymentMethodId,
      transaction.targetAccountId || '',
      transaction.supplierId || '',
      transaction.mainCategoryId || '',
      transaction.checkIn || '',
      transaction.checkOut || '',
      transaction.guests?.toString() || '',
      transaction.originId || '',
      transaction.commissionPercent?.toString() || '',
      transaction.notes || '',
      transaction.attachment || '',
      transaction.repeatType || 'NONE',
      transaction.installments?.toString() || '',
    ]];

    await appendSheetData(spreadsheetId, 'lancamentos!A:T', row, token);
    return true;
  } catch (error) {
    console.error('Erro ao adicionar lançamento:', error);
    return false;
  }
};

/**
 * Adiciona uma nova conta à planilha
 */
export const addAccount = async (
  spreadsheetId: string,
  account: Account,
  token: string
): Promise<boolean> => {
  try {
    const row = [[account.id, account.name, account.balance.toString()]];
    await appendSheetData(spreadsheetId, 'contas!A:C', row, token);
    return true;
  } catch (error) {
    console.error('Erro ao adicionar conta:', error);
    return false;
  }
};

/**
 * Adiciona um novo fornecedor à planilha
 */
export const addSupplier = async (
  spreadsheetId: string,
  supplier: Supplier,
  token: string
): Promise<boolean> => {
  try {
    const row = [[supplier.id, supplier.name]];
    await appendSheetData(spreadsheetId, 'fornecedores!A:B', row, token);
    return true;
  } catch (error) {
    console.error('Erro ao adicionar fornecedor:', error);
    return false;
  }
};

/**
 * Salva a configuração na planilha
 */
export const saveConfig = async (
  spreadsheetId: string,
  config: AppConfig,
  token: string
): Promise<boolean> => {
  try {
    const rows = [
      ['companyName', config.companyName],
      ['logoUrl', config.logoUrl],
      ['googleDriveFolder', config.googleDriveFolder],
      ['googleSheetsLink', config.googleSheetsLink],
      ['spreadsheetId', config.spreadsheetId || ''],
      ['spreadsheetName', config.spreadsheetName || ''],
    ];

    // Limpar config existente
    await clearSheetData(spreadsheetId, 'config!A2:B100', token);

    // Adicionar nova config
    await appendSheetData(spreadsheetId, 'config!A2:B', rows, token);
    return true;
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    return false;
  }
};

// ===== ATUALIZAR DADOS =====

/**
 * Atualiza um lançamento existente na planilha
 */
export const updateTransaction = async (
  spreadsheetId: string,
  transaction: Transaction,
  token: string
): Promise<boolean> => {
  try {
    // Carregar todos os lançamentos para encontrar o índice
    const transactions = await loadTransactions(spreadsheetId, token);
    const rowIndex = transactions.findIndex(t => t.id === transaction.id) + 2; // +2 porque começa em A2

    if (rowIndex < 2) {
      console.error('Lançamento não encontrado');
      return false;
    }

    const row = [[
      transaction.id,
      transaction.type,
      transaction.value.toString(),
      transaction.description,
      transaction.date,
      transaction.categoryId,
      transaction.accountId,
      transaction.paymentMethodId,
      transaction.targetAccountId || '',
      transaction.supplierId || '',
      transaction.mainCategoryId || '',
      transaction.checkIn || '',
      transaction.checkOut || '',
      transaction.guests?.toString() || '',
      transaction.originId || '',
      transaction.commissionPercent?.toString() || '',
      transaction.notes || '',
      transaction.attachment || '',
      transaction.repeatType || 'NONE',
      transaction.installments?.toString() || '',
    ]];

    await updateSheetData(spreadsheetId, `lancamentos!A${rowIndex}:T${rowIndex}`, row, token);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar lançamento:', error);
    return false;
  }
};

// ===== DELETAR DADOS =====

/**
 * Deleta um lançamento da planilha
 */
export const deleteTransaction = async (
  spreadsheetId: string,
  transactionId: string,
  token: string
): Promise<boolean> => {
  try {
    const transactions = await loadTransactions(spreadsheetId, token);
    const rowIndex = transactions.findIndex(t => t.id === transactionId) + 2;

    if (rowIndex < 2) {
      console.error('Lançamento não encontrado');
      return false;
    }

    // Limpar a linha (não deletar para manter índices)
    await clearSheetData(spreadsheetId, `lancamentos!A${rowIndex}:T${rowIndex}`, token);
    return true;
  } catch (error) {
    console.error('Erro ao deletar lançamento:', error);
    return false;
  }
};
import { useCallback, useState } from 'react';
import { AppState, Transaction, Account, Supplier, Category, PaymentMethod, AppConfig, TransactionStatus } from '../types';

interface UseSheetSyncProps {
  spreadsheetId: string | undefined;
  token: string;
  state: AppState;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onAddAccount: (a: Omit<Account, 'id'>) => void;
  onAddSupplier: (s: Omit<Supplier, 'id'>) => void;
  onUpdateConfig: (config: Partial<AppConfig>) => void;
}

export const useSheetSync = ({
  spreadsheetId,
  token,
  state,
  onAddTransaction,
  onAddAccount,
  onAddSupplier,
  onUpdateConfig,
}: UseSheetSyncProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Função auxiliar para fazer requisições à Google Sheets API
  const sheetsRequest = useCallback(
    async (method: string, range: string, values?: any[]) => {
      if (!spreadsheetId || !token) {
        throw new Error('Spreadsheet ID ou token não disponível');
      }

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

      const options: RequestInit = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      if (method === 'GET') {
        const response = await fetch(url, { ...options, method: 'GET' });
        if (!response.ok) throw new Error(`Erro ao ler dados: ${response.statusText}`);
        return response.json();
      } else if (method === 'APPEND') {
        const response = await fetch(`${url}:append?valueInputOption=USER_ENTERED`, {
          ...options,
          method: 'POST',
          body: JSON.stringify({ values: [values] }),
        });
        if (!response.ok) throw new Error(`Erro ao adicionar dados: ${response.statusText}`);
        return response.json();
      } else if (method === 'UPDATE') {
        const response = await fetch(`${url}?valueInputOption=USER_ENTERED`, {
          ...options,
          method: 'PUT',
          body: JSON.stringify({ values: [values] }),
        });
        if (!response.ok) throw new Error(`Erro ao atualizar dados: ${response.statusText}`);
        return response.json();
      }
    },
    [spreadsheetId, token]
  );

  // Carregar Config
  const loadConfig = useCallback(async (): Promise<AppConfig | null> => {
    try {
      const response = await sheetsRequest('GET', 'Config!A2:G2');
      const row = response.values?.[0];
      if (!row) return null;

      return {
        id: row[0],
        nome_empresa: row[1],
        foto_url: row[2],
        email: row[3],
        telefone: row[4],
        data_criacao: row[5],
        spreadsheetId,
      };
    } catch (err) {
      console.error('Erro ao carregar config:', err);
      return null;
    }
  }, [sheetsRequest, spreadsheetId]);

  // Carregar Contas
  const loadAccounts = useCallback(async (): Promise<Account[]> => {
    try {
      const response = await sheetsRequest('GET', 'Contas!A2:G');
      const rows = response.values || [];

      return rows.map((row: any[]) => ({
        id: row[0],
        nome_banco: row[1],
        agencia: row[2],
        numero_conta: row[3],
        saldo_inicial: parseFloat(row[4]) || 0,
        saldo_atual: parseFloat(row[5]) || 0,
        data_criacao: row[6],
      }));
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
      return [];
    }
  }, [sheetsRequest]);

  // Carregar Categorias de Entrada
  const loadIncomeCategories = useCallback(async (): Promise<Category[]> => {
    try {
      const response = await sheetsRequest('GET', 'categorias_entrada!A2:D');
      const rows = response.values || [];

      return rows.map((row: any[]) => ({
        id: row[0],
        nome_categoria: row[1],
        descricao: row[2],
        ativa: row[3] === 'SIM' || row[3] === true,
      }));
    } catch (err) {
      console.error('Erro ao carregar categorias de entrada:', err);
      return [];
    }
  }, [sheetsRequest]);

  // Carregar Categorias de Saída
  const loadExpenseCategories = useCallback(async (): Promise<Category[]> => {
    try {
      const response = await sheetsRequest('GET', 'categorias_saida!A2:D');
      const rows = response.values || [];

      return rows.map((row: any[]) => ({
        id: row[0],
        nome_categoria: row[1],
        descricao: row[2],
        ativa: row[3] === 'SIM' || row[3] === true,
      }));
    } catch (err) {
      console.error('Erro ao carregar categorias de saída:', err);
      return [];
    }
  }, [sheetsRequest]);

  // Carregar Métodos de Pagamento
  const loadPaymentMethods = useCallback(async (): Promise<PaymentMethod[]> => {
    try {
      const response = await sheetsRequest('GET', 'metodos_pagamento!A2:D');
      const rows = response.values || [];

      return rows.map((row: any[]) => ({
        id: row[0],
        nome_metodo: row[1],
        descricao: row[2],
        ativa: row[3] === 'SIM' || row[3] === true,
      }));
    } catch (err) {
      console.error('Erro ao carregar métodos de pagamento:', err);
      return [];
    }
  }, [sheetsRequest]);

  // Carregar Fornecedores
  const loadSuppliers = useCallback(async (): Promise<Supplier[]> => {
    try {
      const response = await sheetsRequest('GET', 'Fornecedores!A2:I');
      const rows = response.values || [];

      return rows.map((row: any[]) => ({
        id: row[0],
        nome: row[1],
        email: row[2],
        telefone: row[3],
        endereco: row[4],
        cidade: row[5],
        estado: row[6],
        data_criacao: row[7],
        ativa: row[8] === 'SIM' || row[8] === true,
      }));
    } catch (err) {
      console.error('Erro ao carregar fornecedores:', err);
      return [];
    }
  }, [sheetsRequest]);

  // Carregar Lançamentos
  const loadTransactions = useCallback(async (): Promise<Transaction[]> => {
    try {
      const response = await sheetsRequest('GET', 'lancamentos!A2:U');
      const rows = response.values || [];

      return rows.map((row: any[]) => ({
        id: row[0],
        data: row[1],
        descricao: row[2],
        valor: parseFloat(row[3]) || 0,
        tipo: row[4],
        categoria: row[5],
        metodo_pagamento: row[6],
        conta: row[7],
        status: row[8] || TransactionStatus.COMPLETED,
        fornecedor: row[9],
        notas: row[10],
        anexo: row[11],
        data_vencimento: row[12],
        data_pagamento: row[13],
        repeticao: row[14],
        parcelas: row[15] ? parseInt(row[15]) : undefined,
        comissao_percent: row[16] ? parseFloat(row[16]) : undefined,
        check_in: row[17],
        check_out: row[18],
        hospedes: row[19] ? parseInt(row[19]) : undefined,
      }));
    } catch (err) {
      console.error('Erro ao carregar lançamentos:', err);
      return [];
    }
  }, [sheetsRequest]);

  // Sincronizar dados da planilha para o app
  const syncFromSheets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Sincronizando dados da planilha...');

      const [config, accounts, incomeCategories, expenseCategories, paymentMethods, suppliers, transactions] =
        await Promise.all([
          loadConfig(),
          loadAccounts(),
          loadIncomeCategories(),
          loadExpenseCategories(),
          loadPaymentMethods(),
          loadSuppliers(),
          loadTransactions(),
        ]);

      // Atualizar config
      if (config) {
        onUpdateConfig(config);
      }

      // Adicionar contas que não existem no estado local
      accounts.forEach(account => {
        if (!state.accounts.find(a => a.id === account.id)) {
          onAddAccount(account);
        }
      });

      // Adicionar fornecedores que não existem no estado local
      suppliers.forEach(supplier => {
        if (!state.suppliers.find(s => s.id === supplier.id)) {
          onAddSupplier(supplier);
        }
      });

      // Adicionar lançamentos que não existem no estado local
      transactions.forEach(transaction => {
        if (!state.transactions.find(t => t.id === transaction.id)) {
          onAddTransaction(transaction);
        }
      });

      setLastSync(new Date());
      console.log('✅ Sincronização concluída com sucesso!');
      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao sincronizar:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, [
    loadConfig,
    loadAccounts,
    loadIncomeCategories,
    loadExpenseCategories,
    loadPaymentMethods,
    loadSuppliers,
    loadTransactions,
    state.accounts,
    state.suppliers,
    state.transactions,
    onUpdateConfig,
    onAddAccount,
    onAddSupplier,
    onAddTransaction,
  ]);

  // Adicionar Lançamento na planilha
  const syncTransactionToSheets = useCallback(
    async (transaction: Transaction) => {
      try {
        const values = [
          transaction.id,
          transaction.data,
          transaction.descricao,
          transaction.valor,
          transaction.tipo,
          transaction.categoria,
          transaction.metodo_pagamento,
          transaction.conta,
          transaction.status || TransactionStatus.COMPLETED,
          transaction.fornecedor || '',
          transaction.notas || '',
          transaction.anexo || '',
          transaction.data_vencimento || '',
          transaction.data_pagamento || '',
          transaction.repeticao || '',
          transaction.parcelas || '',
          transaction.comissao_percent || '',
          transaction.check_in || '',
          transaction.check_out || '',
          transaction.hospedes || '',
        ];

        await sheetsRequest('APPEND', 'lancamentos!A:U', values);
        console.log('✅ Lançamento sincronizado com Sheets!');
        return true;
      } catch (err) {
        console.error('❌ Erro ao sincronizar lançamento:', err);
        return false;
      }
    },
    [sheetsRequest]
  );

  // Adicionar Conta na planilha
  const syncAccountToSheets = useCallback(
    async (account: Account) => {
      try {
        const values = [
          account.id,
          account.nome_banco,
          account.agencia,
          account.numero_conta,
          account.saldo_inicial,
          account.saldo_atual,
          account.data_criacao,
        ];

        await sheetsRequest('APPEND', 'Contas!A:G', values);
        console.log('✅ Conta sincronizada com Sheets!');
        return true;
      } catch (err) {
        console.error('❌ Erro ao sincronizar conta:', err);
        return false;
      }
    },
    [sheetsRequest]
  );

  // Adicionar Fornecedor na planilha
  const syncSupplierToSheets = useCallback(
    async (supplier: Supplier) => {
      try {
        const values = [
          supplier.id,
          supplier.nome,
          supplier.email || '',
          supplier.telefone || '',
          supplier.endereco || '',
          supplier.cidade || '',
          supplier.estado || '',
          supplier.data_criacao,
          supplier.ativa ? 'SIM' : 'NÃO',
        ];

        await sheetsRequest('APPEND', 'Fornecedores!A:I', values);
        console.log('✅ Fornecedor sincronizado com Sheets!');
        return true;
      } catch (err) {
        console.error('❌ Erro ao sincronizar fornecedor:', err);
        return false;
      }
    },
    [sheetsRequest]
  );

  // Salvar Config na planilha
  const syncConfigToSheets = useCallback(
    async (config: AppConfig) => {
      try {
        const values = [
          config.id || '',
          config.nome_empresa,
          config.foto_url,
          config.email,
          config.telefone,
          config.data_criacao,
        ];

        await sheetsRequest('UPDATE', 'Config!A2:F2', values);
        console.log('✅ Configuração sincronizada com Sheets!');
        return true;
      } catch (err) {
        console.error('❌ Erro ao sincronizar configuração:', err);
        return false;
      }
    },
    [sheetsRequest]
  );

  return {
    isLoading,
    error,
    lastSync,
    syncFromSheets,
    syncTransactionToSheets,
    syncAccountToSheets,
    syncSupplierToSheets,
    syncConfigToSheets,
  };
};
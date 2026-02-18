import axios from 'axios';

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

    const response =*

import { google } from 'googleapis';
import { SheetData } from '../types/index';

const sheets = google.sheets('v4');

export const getSheetData = async (
  spreadsheetId: string,
  range: string,
  token: string
): Promise<SheetData> => {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      auth,
    });

    return {
      values: response.data.values || [],
      range: response.data.range || '',
    };
  } catch (error) {
    throw new Error('Erro ao buscar dados da planilha');
  }
};

export const appendSheetData = async (
  spreadsheetId: string,
  range: string,
  values: string[][],
  token: string
): Promise<any> => {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
      auth,
    });

    return response.data;
  } catch (error) {
    throw new Error('Erro ao adicionar dados na planilha');
  }
};

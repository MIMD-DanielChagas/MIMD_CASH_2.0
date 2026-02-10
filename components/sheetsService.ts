import axios from 'axios';

const GOOGLE_SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

interface SheetData {
  values: string[][];
  range: string;
}

export const fetchSheetData = async (
  spreadsheetId: string,
  range: string,
  token: string
): Promise<SheetData> => {
  try {
    const response = await axios.get(
      `${GOOGLE_SHEETS_API_URL}/${spreadsheetId}/values/${range}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          key: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados do Google Sheets:', error);
    throw error;
  }
};

export const appendSheetData = async (
  spreadsheetId: string,
  range: string,
  values: string[][],
  token: string
): Promise<void> => {
  try {
    await axios.post(
      `${GOOGLE_SHEETS_API_URL}/${spreadsheetId}/values/${range}:append`,
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
          key: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        },
      }
    );
  } catch (error) {
    console.error('Erro ao adicionar dados ao Google Sheets:', error);
    throw error;
  }
};

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getSheetData, appendSheetData } from '../services/googleSheets';

const SPREADSHEET_ID = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID || '';

export const getItems = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const sheetData = await getSheetData(SPREADSHEET_ID, 'lancamentos', req.token);

    res.json({
      success: true,
      data: sheetData.values,
      range: sheetData.range,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar itens' });
  }
};

export const createItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const { name, description, value, category } = req.body;

    if (!name || !value) {
      return res.status(400).json({ error: 'Nome e valor são obrigatórios' });
    }

    const newItem = [
      [new Date().toISOString(), name, description || '', value, category || ''],
    ];

    const result = await appendSheetData(
      SPREADSHEET_ID,
      'lancamentos',
      newItem,
      req.token
    );

    res.json({
      success: true,
      message: 'Item criado com sucesso',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar item' });
  }
};

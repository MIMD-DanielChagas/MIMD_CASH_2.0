import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { exchangeCodeForToken, verifyToken } from '../services/googleAuth';

export const handleGoogleCallback = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Código não fornecido' });
    }

    const token = await exchangeCodeForToken(code as string);

    res.json({
      success: true,
      token: token.access_token,
      expiresIn: token.expires_in,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar autenticação' });
  }
};

export const validateToken = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const tokenInfo = await verifyToken(req.token);

    res.json({
      success: true,
      valid: true,
      email: tokenInfo.email,
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

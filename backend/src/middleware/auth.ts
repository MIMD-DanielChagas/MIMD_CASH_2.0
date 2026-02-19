import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    email: string;
    name: string;
    picture: string;
    sub: string;
  };
  token?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  req.token = token;
  next();
};

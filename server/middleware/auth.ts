import { Request, Response, NextFunction, RequestHandler } from 'express';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

type AccountType = 'personal' | 'merchant' | 'moderator' | 'admin';

const JWT_SECRET = process.env.JWT_SECRET || 'mmrpayv3!@#';

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface NextAuthRequest extends NextApiRequest {
  user?: IUser;
}

// Express middleware
export const withAuth: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Требуется авторизация' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({ message: 'Пользователь не найден' });
      return;
    }

    req.user = {
      ...user.toObject(),
      id: user._id.toString()
    };
    next();
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    res.status(401).json({ message: 'Неверный токен авторизации' });
  }
};

// Next.js API middleware
export const withNextAuth = (handler: any) => {
  return async (req: NextAuthRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Требуется авторизация' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'Пользователь не найден' });
      }

      req.user = {
        ...user.toObject(),
        id: user._id.toString()
      };
      return handler(req, res);
    } catch (error) {
      console.error('Ошибка при проверке токена:', error);
      return res.status(401).json({ message: 'Неверный токен авторизации' });
    }
  };
};

// Middleware для проверки роли
export const withRole = (allowedRoles: AccountType[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Требуется авторизация',
        message: 'Пользователь не авторизован'
      });
    }

    if (!allowedRoles.includes(req.user.typeOfAccount)) {
      return res.status(403).json({ 
        error: 'Доступ запрещен',
        message: 'Недостаточно прав для выполнения операции'
      });
    }

    next();
  };
}; 
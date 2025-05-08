import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/db';
import { User } from '../../../models/User';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const JWT_SECRET = process.env.JWT_SECRET || 'mmrpayv3!@#-here';

// Настройка CORS для безопасного взаимодействия с клиентом
const corsMiddleware = cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});

// Обработка CORS middleware через Promise
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: Function) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Применяем CORS middleware
  await runMiddleware(req, res, corsMiddleware);

  // Устанавливаем заголовки CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Проверка метода запроса
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  try {
    // Подключаемся к базе данных
    await connectDB();

    // Получаем токен из заголовка
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Неверный формат токена' });
    }

    // Проверяем токен
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    if (!decoded.userId) {
      return res.status(401).json({ message: 'Недействительный токен' });
    }

    // Получаем данные пользователя
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Отправляем данные пользователя
    res.status(200).json({
      id: user._id,
      email: user.email,
      login: user.login,
      phoneNumber: user.phoneNumber,
      typeOfAccount: user.typeOfAccount,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении данных пользователя',
      error: 'SERVER_ERROR'
    });
  }
} 
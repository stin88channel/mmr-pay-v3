import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/db';
import { User } from '../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getIpInfo } from '../../../lib/ip';
import { loginSchema } from '@/lib/validations/auth';
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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  try {
    // Подключаемся к базе данных
    await connectDB();

    // Валидация данных
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Неверные данные',
        details: validationResult.error.errors 
      });
    }

    const { email, password } = validationResult.data;

    // Поиск пользователя в базе данных
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Пользователь не найден:', email);
      return res.status(401).json({ 
        message: 'Неверный email или пароль',
        error: 'AUTH_ERROR'
      });
    }

    // Проверка пароля
    console.log('Попытка входа для пользователя:', email);
    console.log('Введенный пароль:', password);
    console.log('Хэш пароля в БД:', user.password);
    
    const isValidPassword = await user.comparePassword(password);
    console.log('Результат проверки пароля:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Неверный пароль для пользователя:', email);
      return res.status(401).json({ 
        message: 'Неверный email или пароль',
        error: 'AUTH_ERROR'
      });
    }

    // Получение информации об IP-адресе
    const ipInfo = await getIpInfo(req);

    // Обновляем время последнего входа
    user.lastLogin = new Date();

    // Проверяем, существует ли уже сессия с таким IP и устройством
    const existingSessionIndex = user.ipAddresses.findIndex(
      (ip: { address: string; deviceInfo: string }) => 
        ip.address === ipInfo.address && ip.deviceInfo === ipInfo.deviceInfo
    );

    // Обновляем существующую сессию или добавляем новую
    if (existingSessionIndex !== -1) {
      // Обновляем время последнего использования существующей сессии
      user.ipAddresses[existingSessionIndex].lastUsed = new Date();
      user.ipAddresses[existingSessionIndex].location = ipInfo.location;
    } else {
      // Добавляем новую сессию
      user.ipAddresses.push({
        address: ipInfo.address,
        lastUsed: new Date(),
        deviceInfo: ipInfo.deviceInfo,
        location: ipInfo.location
      });
    }

    // Ограничение количества сохраненных IP-адресов
    if (user.ipAddresses.length > 10) {
      user.ipAddresses = user.ipAddresses.slice(-10);
    }

    await user.save();

    // Генерация JWT токена
    const token = jwt.sign(
      { 
        userId: user._id,
        typeOfAccount: user.typeOfAccount 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Отправка успешного ответа
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        login: user.login,
        phoneNumber: user.phoneNumber,
        typeOfAccount: user.typeOfAccount,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ 
      message: 'Ошибка при входе в систему',
      error: 'SERVER_ERROR'
    });
  }
} 
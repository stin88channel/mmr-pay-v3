import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/db';
import { User } from '../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getIpInfo } from '../../../lib/ip';
import { registerSchema } from '@/lib/validations/auth';
import cors from 'cors';

const JWT_SECRET = process.env.JWT_SECRET || 'mmrpayv3!@#-here';

// Настройка CORS
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
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Неверные данные',
        details: validationResult.error.errors 
      });
    }

    const { email, phoneNumber, login, password, typeOfAccount } = validationResult.data;

    // Проверяем существование пользователя
    const existingUser = await User.findOne({
      $or: [
        { email },
        { phoneNumber },
        { login }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Пользователь уже существует',
        message: 'Пользователь с таким email, телефоном или логином уже зарегистрирован'
      });
    }

    // Получаем информацию об IP
    const ipInfo = await getIpInfo(req);

    // Создаем нового пользователя
    const user = new User({
      email,
      login,
      password,
      phoneNumber,
      typeOfAccount: 'personal',
      verificationStatus: 'not_verified',
      balance: 0,
      ipAddresses: [{
        address: ipInfo.address,
        lastUsed: new Date(),
        deviceInfo: ipInfo.deviceInfo,
        location: ipInfo.location
      }]
    });

    // Сохраняем пользователя
    await user.save();

    // Создаем JWT токен
    const token = jwt.sign(
      { 
        userId: user._id,
        typeOfAccount: user.typeOfAccount
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Отправляем ответ
    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: user._id,
        email: user.email,
        login: user.login,
        phoneNumber: user.phoneNumber,
        typeOfAccount: user.typeOfAccount,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      token
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ 
      message: 'Ошибка при регистрации',
      error: 'SERVER_ERROR'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
}; 
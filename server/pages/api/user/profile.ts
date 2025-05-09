import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { withNextAuth } from '@/middleware/auth';
import Cors from 'cors';

// Инициализация CORS middleware
const cors = Cors({
  methods: ['GET', 'PATCH', 'OPTIONS'],
  credentials: true,
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Helper для запуска middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Запускаем CORS middleware перед всеми остальными операциями
  await runMiddleware(req, res, cors);

  // Добавляем заголовки CORS вручную
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Обработка preflight запроса
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      await connectDB();

      // Получаем ID пользователя из JWT токена
      const userId = (req as any).user.id;

      // Находим пользователя в базе данных
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      // Форматируем данные для отправки клиенту
      const profileData = {
        id: user._id.toString(),
        email: user.email,
        login: user.login,
        phoneNumber: user.phoneNumber,
        typeOfAccount: user.typeOfAccount,
        verificationStatus: user.verificationStatus,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        ipAddresses: user.ipAddresses.map((ip: { 
          address: string;
          lastUsed: Date;
          deviceInfo: string;
          location: {
            country: string | null;
            region: string | null;
            city: string | null;
            loc: string | null;
            org: string | null;
            postal: string | null;
            timezone: string | null;
          };
        }) => ({
          address: ip.address,
          lastUsed: ip.lastUsed,
          deviceInfo: ip.deviceInfo,
          location: {
            country: ip.location.country,
            region: ip.location.region,
            city: ip.location.city,
            loc: ip.location.loc,
            org: ip.location.org,
            postal: ip.location.postal,
            timezone: ip.location.timezone
          }
        }))
      };

      return res.status(200).json({ user: profileData });
    } catch (error) {
      console.error('Ошибка при получении профиля:', error);
      return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  } else if (req.method === 'PATCH') {
    try {
      await connectDB();

      const userId = (req as any).user.id;
      const { login, phoneNumber } = req.body;

      // Валидация входных данных
      if (!login && !phoneNumber) {
        return res.status(400).json({ 
          message: 'Необходимо указать хотя бы одно поле для обновления' 
        });
      }

      // Проверяем, не занят ли логин другим пользователем
      if (login) {
        const existingUser = await User.findOne({ 
          login, 
          _id: { $ne: userId } 
        });
        if (existingUser) {
          return res.status(400).json({ 
            message: 'Пользователь с таким логином уже существует' 
          });
        }
      }

      // Обновляем данные пользователя
      const updateData: any = {};
      if (login) updateData.login = login;
      if (phoneNumber) updateData.phoneNumber = phoneNumber;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      // Форматируем данные для отправки клиенту
      const profileData = {
        id: user._id.toString(),
        email: user.email,
        login: user.login,
        phoneNumber: user.phoneNumber,
        typeOfAccount: user.typeOfAccount,
        verificationStatus: user.verificationStatus,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        ipAddresses: user.ipAddresses.map((ip: { 
          address: string;
          lastUsed: Date;
          deviceInfo: string;
          location: {
            country: string | null;
            region: string | null;
            city: string | null;
            loc: string | null;
            org: string | null;
            postal: string | null;
            timezone: string | null;
          };
        }) => ({
          address: ip.address,
          lastUsed: ip.lastUsed,
          deviceInfo: ip.deviceInfo,
          location: {
            country: ip.location.country,
            region: ip.location.region,
            city: ip.location.city,
            loc: ip.location.loc,
            org: ip.location.org,
            postal: ip.location.postal,
            timezone: ip.location.timezone
          }
        }))
      };

      return res.status(200).json({ user: profileData });
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  } else {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }
}

export default withNextAuth(handler); 
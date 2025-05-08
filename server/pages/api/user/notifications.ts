import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/db';
import { User } from '../../../models/User';
import { verifyToken } from '../../../lib/jwt';
import cors from 'cors';

const corsMiddleware = cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true,
  methods: ['GET', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});

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

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, corsMiddleware);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Проверяем авторизацию
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Недействительный токен' });
    }

    await connectDB();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (req.method === 'PATCH') {
      const { newRequests, financialOperations, systemNotifications } = req.body;

      // Создаем новый объект настроек
      const updatedNotifications = {
        newRequests: typeof newRequests === 'boolean' ? newRequests : user.notifications?.newRequests,
        financialOperations: typeof financialOperations === 'boolean' ? financialOperations : user.notifications?.financialOperations,
        systemNotifications: typeof systemNotifications === 'boolean' ? systemNotifications : user.notifications?.systemNotifications
      };

      // Обновляем пользователя
      user.notifications = updatedNotifications;
      await user.save();

      // Возвращаем обновленные настройки напрямую
      return res.status(200).json({ 
        message: 'Настройки уведомлений обновлены',
        notifications: updatedNotifications
      });
    }

    return res.status(405).json({ message: 'Метод не разрешен' });
  } catch (error) {
    console.error('Ошибка при обновлении настроек уведомлений:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}

export default handler; 
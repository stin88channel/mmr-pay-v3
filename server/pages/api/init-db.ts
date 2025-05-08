import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../lib/db';
import { User } from '../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  try {
    await connectDB();

    // Обновляем существующих пользователей
    const users = await User.find({});
    for (const user of users) {
      // Добавляем настройки уведомлений, если их нет
      if (!user.notifications) {
        user.notifications = {
          newRequests: true,
          financialOperations: true,
          systemNotifications: true
        };
        await user.save();
      }
    }

    return res.status(200).json({ message: 'База данных успешно инициализирована' });
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
} 
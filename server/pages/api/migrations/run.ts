import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/db';
import { User } from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  try {
    await connectDB();

    // Принудительно обновляем всех пользователей
    const result = await User.updateMany(
      {},
      {
        $set: {
          notifications: {
            newRequests: true,
            financialOperations: true,
            systemNotifications: true
          },
          usdtAddress: "1"
        }
      },
      { upsert: false, multi: true }
    );

    // Получаем обновленных пользователей для проверки
    const users = await User.find({});
    const updatedUsers = users.map(user => ({
      id: user._id,
      notifications: user.notifications,
      usdtAddress: user.usdtAddress
    }));

    return res.status(200).json({ 
      message: 'Миграция успешно выполнена',
      modifiedCount: result.modifiedCount,
      totalUsers: users.length,
      updatedUsers
    });
  } catch (error) {
    console.error('Ошибка при выполнении миграции:', error);
    return res.status(500).json({ 
      message: 'Внутренняя ошибка сервера',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
} 
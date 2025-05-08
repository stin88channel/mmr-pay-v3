import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/db';
import { User } from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  try {
    await connectDB();

    // Обновляем всех пользователей
    const result = await User.updateMany(
      {},
      {
        $set: {
          usdtAddress: "1"
        }
      }
    );

    return res.status(200).json({ 
      message: 'Миграция успешно выполнена',
      modified: result.modifiedCount
    });
  } catch (error) {
    console.error('Ошибка при выполнении миграции:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
} 
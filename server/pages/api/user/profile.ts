import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { withNextAuth } from '@/middleware/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

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
      id: user._id,
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
}

export default withNextAuth(handler); 
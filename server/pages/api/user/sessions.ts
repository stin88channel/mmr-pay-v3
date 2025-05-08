import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/db';
import { User } from '../../../models/User';
import { verifyToken } from '../../../lib/jwt';
import cors from 'cors';

interface ISession {
  deviceInfo: string;
  address: string;
}

const corsMiddleware = cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
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

    if (req.method === 'DELETE') {
      const { sessionId } = req.query;

      if (sessionId === 'all') {
        // Получаем информацию о текущем устройстве
        const currentIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const currentUserAgent = req.headers['user-agent'];

        // Находим текущую сессию
        const currentSession = user.ipAddresses.find((session: ISession) => 
          session.deviceInfo === currentUserAgent && 
          (session.address === currentIp || 
           session.address === '127.0.0.1' || 
           session.address === '::1' || 
           session.address === 'localhost')
        );

        // Если текущая сессия найдена, удаляем все остальные
        if (currentSession) {
          user.ipAddresses = [currentSession];
          await user.save();
          return res.status(200).json({ 
            message: 'Все сессии успешно завершены',
            isCurrentSession: false
          });
        }

        // Если текущая сессия не найдена, удаляем все сессии
        user.ipAddresses = [];
        await user.save();
        return res.status(200).json({ 
          message: 'Все сессии успешно завершены',
          isCurrentSession: true
        });
      } else {
        // Удаляем конкретную сессию
        const sessionIndex = parseInt(sessionId as string);
        
        // Проверяем валидность индекса
        if (isNaN(sessionIndex) || sessionIndex < 0 || sessionIndex >= user.ipAddresses.length) {
          return res.status(400).json({ message: 'Неверный индекс сессии' });
        }

        // Проверяем, является ли это текущей сессией
        const currentIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const currentUserAgent = req.headers['user-agent'];
        const sessionToDelete = user.ipAddresses[sessionIndex];

        console.log('Session termination details:', {
          sessionToDelete,
          currentIp,
          currentUserAgent,
          headers: req.headers,
          remoteAddress: req.socket.remoteAddress
        });

        // Точное сравнение User-Agent для определения текущей сессии
        const isCurrentSession = 
          sessionToDelete.deviceInfo === currentUserAgent && 
          (sessionToDelete.address === currentIp || 
           sessionToDelete.address === '127.0.0.1' || 
           sessionToDelete.address === '::1' || 
           sessionToDelete.address === 'localhost');

        console.log('Session check result:', {
          isCurrentSession,
          deviceInfoMatch: sessionToDelete.deviceInfo === currentUserAgent,
          addressMatch: sessionToDelete.address === currentIp,
          isLocalhost: ['127.0.0.1', '::1', 'localhost'].includes(sessionToDelete.address)
        });

        if (isCurrentSession) {
          // Если это текущая сессия, возвращаем специальный статус
          user.ipAddresses = user.ipAddresses.filter((_: any, index: number) => index !== sessionIndex);
          await user.save();
          return res.status(200).json({ 
            message: 'Сессия успешно завершена',
            isCurrentSession: true 
          });
        }

        // Если это не текущая сессия, просто удаляем её
        user.ipAddresses = user.ipAddresses.filter((_: any, index: number) => index !== sessionIndex);
      }

      await user.save();
      return res.status(200).json({ 
        message: 'Сессия успешно завершена',
        isCurrentSession: false
      });
    }

    return res.status(405).json({ message: 'Метод не разрешен' });
  } catch (error) {
    console.error('Ошибка при управлении сессиями:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}

export default handler; 
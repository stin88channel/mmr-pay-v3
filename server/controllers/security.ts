import { Response } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getSecuritySettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Не авторизован' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    res.json({
      settings: user.securitySettings
    });
  } catch (error) {
    console.error('Ошибка при получении настроек безопасности:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

export const updateSecuritySettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Не авторизован' });
      return;
    }

    const { loginNotifications, activityLogging, failedLoginLimit } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    user.securitySettings = {
      ...user.securitySettings,
      loginNotifications,
      activityLogging,
      failedLoginLimit
    };

    await user.save();

    res.json({
      settings: user.securitySettings
    });
  } catch (error) {
    console.error('Ошибка при обновлении настроек безопасности:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}; 
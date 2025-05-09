import { Router } from 'express';
import { withAuth, AuthRequest } from '../middleware/auth';
import { Response } from 'express';
import { User, ActivityLog } from '../models/User';

const router = Router();

router.get('/profile', withAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const userData = {
      ...user.toObject(),
      id: user._id.toString()
    };

    res.json({ user: userData });
  } catch (error) {
    console.error('Ошибка при получении профиля:', error);
    res.status(500).json({ message: 'Ошибка при получении профиля' });
  }
});

router.patch('/profile', withAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { login, email } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    // Проверяем, не занят ли логин другим пользователем
    if (login) {
      const existingUser = await User.findOne({ login, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Этот логин уже занят' });
      }
    }

    // Проверяем, не занят ли email другим пользователем
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Этот email уже занят' });
      }
    }

    // Обновляем данные пользователя
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...(login && { login }),
        ...(email && { email })
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({ 
      user: {
        ...updatedUser.toObject(),
        id: updatedUser._id.toString()
      }
    });
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});

router.get('/check-login/:login', withAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const { login } = req.params;
    
    // Проверяем, не занят ли логин другим пользователем
    const existingUser = await User.findOne({ 
      login, 
      _id: { $ne: req.user.id } 
    });

    res.json({ 
      available: !existingUser
    });
  } catch (error) {
    console.error('Ошибка при проверке логина:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

router.post('/reset-api-key', withAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Генерируем новый API ключ
    const apiKey = await user.generateApiKey();
    await user.save();

    res.json({ 
      user: {
        ...user.toObject(),
        id: user._id.toString()
      }
    });
  } catch (error) {
    console.error('Ошибка при сбросе API ключа:', error);
    res.status(500).json({ message: 'Ошибка при сбросе API ключа' });
  }
});

// Обновление IP-ограничений
router.post('/security/ip-restrictions', withAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    console.log('Обновление IP-ограничений:', req.body);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const { enabled, allowedIps } = req.body;
    user.securitySettings.ipRestrictions = {
      enabled: enabled || false,
      allowedIps: allowedIps || []
    };

    await user.save();
    console.log('IP-ограничения обновлены:', user.securitySettings.ipRestrictions);
    res.json({ message: 'IP-ограничения обновлены' });
  } catch (error) {
    console.error('Ошибка при обновлении IP-ограничений:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление временных ограничений
router.post('/security/time-restrictions', withAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    console.log('Обновление временных ограничений:', req.body);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const { enabled, workDaysOnly, startTime, endTime } = req.body;
    user.securitySettings.timeRestrictions = {
      enabled: enabled || false,
      workDaysOnly: workDaysOnly || false,
      startTime: startTime || '09:00',
      endTime: endTime || '18:00'
    };

    await user.save();
    console.log('Временные ограничения обновлены:', user.securitySettings.timeRestrictions);
    res.json({ message: 'Временные ограничения обновлены' });
  } catch (error) {
    console.error('Ошибка при обновлении временных ограничений:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление геоограничений
router.post('/security/geo-restrictions', withAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    console.log('Обновление геоограничений:', req.body);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const { enabled, allowedCountries } = req.body;
    user.securitySettings.geoRestrictions = {
      enabled: enabled || false,
      allowedCountries: allowedCountries || []
    };

    await user.save();
    console.log('Геоограничения обновлены:', user.securitySettings.geoRestrictions);
    res.json({ message: 'Геоограничения обновлены' });
  } catch (error) {
    console.error('Ошибка при обновлении геоограничений:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление общих настроек безопасности
router.put('/security/settings', withAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    console.log('Обновление настроек безопасности:', req.body);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Обновляем настройки безопасности
    user.securitySettings = {
      ...user.securitySettings,
      ...req.body
    };

    await user.save();
    console.log('Настройки безопасности обновлены:', user.securitySettings);
    
    res.json({ 
      user: {
        ...user.toObject(),
        id: user._id.toString()
      }
    });
  } catch (error) {
    console.error('Ошибка при обновлении настроек безопасности:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение журнала активности
router.get('/activity-logs', withAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Сортируем логи по времени (новые сверху)
    const logs = user.activityLogs.sort((a: ActivityLog, b: ActivityLog) => b.timestamp.getTime() - a.timestamp.getTime());

    res.json({ logs });
  } catch (error) {
    console.error('Ошибка при получении журнала активности:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление настроек журналирования
router.put('/activity-logs/settings', withAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const { enabled, retentionPeriod, detailLevel } = req.body;

    user.securitySettings.activityLogging = {
      enabled: enabled ?? user.securitySettings.activityLogging.enabled,
      retentionPeriod: retentionPeriod ?? user.securitySettings.activityLogging.retentionPeriod,
      detailLevel: detailLevel ?? user.securitySettings.activityLogging.detailLevel
    };

    await user.save();

    res.json({ 
      user: {
        ...user.toObject(),
        id: user._id.toString()
      }
    });
  } catch (error) {
    console.error('Ошибка при обновлении настроек журналирования:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router; 
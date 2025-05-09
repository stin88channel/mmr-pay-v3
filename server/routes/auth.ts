import { Router } from 'express';
import { register, login, logout, changePassword, getMe } from '../controllers/auth';
import { withAuth } from '../middleware/auth';
import { generateSecret, verifyToken, generateBackupCodes } from '../services/twoFactorAuth';
import { User, ActivityLog } from '../models/User';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

interface LoginHistoryItem {
  id: string;
  date: Date;
  ip: string;
  location: string;
  device: string;
  browser: string;
  os: string;
  isCurrent: boolean;
  userAgent: string;
}

const router = Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.post('/logout', withAuth as any, logout as any);
router.post('/change-password', withAuth as any, changePassword as any);
router.get('/me', withAuth as any, getMe as any);

// Генерация секретного ключа для 2FA
router.post('/2fa/generate', withAuth, async (req: AuthRequest, res) => {
  try {

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Сначала отключаем 2FA если она была включена
    user.twoFactorAuth = {
      enabled: false,
      secret: null,
      backupCodes: []
    };
    await user.save();

    // Генерируем новый секрет
    const secret = generateSecret();

    // Сохраняем новый секрет
    user.twoFactorAuth = {
      enabled: false,
      secret,
      backupCodes: []
    };

    await user.save();

    const response = {
      secret,
      login: user.login,
      qrCode: `otpauth://totp/MMR-PAY:${user.login}?secret=${secret}&issuer=MMR-PAY&algorithm=SHA1&digits=6&period=30`
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при генерации 2FA' });
  }
});

// Получение статуса 2FA
router.get('/2fa/status', withAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Получаем только неиспользованные резервные коды
    const activeBackupCodes = user.twoFactorAuth.backupCodes
      .filter((code: { code: string; used: boolean }) => !code.used)
      .map((code: { code: string }) => code.code);

    res.json({
      enabled: user.twoFactorAuth.enabled,
      hasSecret: !!user.twoFactorAuth.secret,
      backupCodes: activeBackupCodes
    });
  } catch (error) {
    console.error('Ошибка при получении статуса 2FA:', error);
    res.status(500).json({ message: 'Ошибка при получении статуса 2FA' });
  }
});

// Включение 2FA
router.post('/2fa/enable', withAuth, async (req: AuthRequest, res) => {

  try {
    const { token, secret } = req.body;
    
    // Проверяем формат данных
    if (!token || typeof token !== 'string' || !secret || typeof secret !== 'string') {
      return res.status(400).json({ message: 'Неверный формат данных' });
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (!user.twoFactorAuth.secret) {
      return res.status(400).json({ message: 'Сначала сгенерируйте секретный ключ' });
    }

    // Проверяем, что переданный секретный ключ совпадает с сохраненным
    if (user.twoFactorAuth.secret !== secret) {
      return res.status(400).json({ message: 'Неверный секретный ключ' });
    }

    const isValid = verifyToken(user.twoFactorAuth.secret, token);

    if (!isValid) {
      return res.status(400).json({ message: 'Неверный код подтверждения' });
    }

    // Генерируем резервные коды
    const backupCodes = generateBackupCodes();
    user.twoFactorAuth.backupCodes = backupCodes.map((code: string) => ({
      code,
      used: false
    }));

    user.twoFactorAuth.enabled = true;
    await user.save();

    res.json({ 
      message: '2FA успешно включена',
      backupCodes 
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при включении 2FA' });
  }
});

// Отключение 2FA
router.post('/2fa/disable', withAuth, async (req: AuthRequest, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user?.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (!user.twoFactorAuth.enabled) {
      return res.status(400).json({ message: '2FA не включена' });
    }

    const isValid = verifyToken(user.twoFactorAuth.secret, token);
    if (!isValid) {
      return res.status(400).json({ message: 'Неверный код подтверждения' });
    }

    user.twoFactorAuth = {
      enabled: false,
      secret: null,
      backupCodes: []
    };
    await user.save();

    res.json({ message: '2FA успешно отключена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при отключении 2FA' });
  }
});

// Проверка кода 2FA при входе
router.post('/2fa/verify', async (req, res) => {
  try {
    const { email, token } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (!user.twoFactorAuth.enabled) {
      return res.status(400).json({ message: '2FA не включена' });
    }

    const isValid = verifyToken(user.twoFactorAuth.secret, token);
    if (!isValid) {
      return res.status(400).json({ message: 'Неверный код подтверждения' });
    }

    // Генерация JWT токена и отправка ответа
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'mmrpayv3!@#',
      { expiresIn: '24h' }
    );
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при проверке 2FA' });
  }
});

// Проверка резервного кода
router.post('/2fa/verify-backup', async (req, res) => {
  try {
    const { email, backupCode } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const backupCodeEntry = user.twoFactorAuth.backupCodes.find(
      (code: { code: string; used: boolean }) => code.code === backupCode && !code.used
    );

    if (!backupCodeEntry) {
      return res.status(400).json({ message: 'Неверный резервный код' });
    }

    // Отмечаем код как использованный
    backupCodeEntry.used = true;
    backupCodeEntry.usedAt = new Date();
    await user.save();

    // Генерация JWT токена и отправка ответа
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'mmrpayv3!@#',
      { expiresIn: '24h' }
    );
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при проверке резервного кода' });
  }
});

// Генерация резервных кодов
router.post('/2fa/generate-backup', withAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (!user.twoFactorAuth.enabled) {
      return res.status(400).json({ message: '2FA не включена' });
    }

    const backupCodes = generateBackupCodes();
    
    // Сохраняем коды в базу данных
    user.twoFactorAuth.backupCodes = backupCodes.map((code: string) => ({
      code,
      used: false
    }));

    await user.save();

    res.json({ backupCodes });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при генерации резервных кодов' });
  }
});

// Получение истории входов
router.get('/login-history', withAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Преобразуем ipAddresses в формат истории входов
    const loginHistory = user.ipAddresses.map((ip: { 
      address: string; 
      deviceInfo: string; 
      lastUsed: Date; 
      location: { 
        city: string | null; 
        country: string | null; 
      } 
    }) => {
      // Парсим user-agent для получения более подробной информации
      const userAgent = ip.deviceInfo;
      let browser = 'Неизвестно';
      let os = 'Неизвестно';
      let device = 'Неизвестно';

      // Определяем браузер
      if (userAgent.includes('YaBrowser')) browser = 'Yandex Browser';
      else if (userAgent.includes('Firefox')) browser = 'Mozilla Firefox';
      else if (userAgent.includes('Safari')) browser = 'Safari';
      else if (userAgent.includes('Edge')) browser = 'Microsoft Edge';
      else if (userAgent.includes('Opera')) browser = 'Opera';
      else if (userAgent.includes('Chrome')) browser = 'Google Chrome';
      else browser = userAgent.split('(')[0].trim();

      // Определяем ОС
      if (userAgent.includes('Windows NT')) {
        const version = userAgent.match(/Windows NT (\d+\.\d+)/)?.[1];
        os = `Windows ${version === '10.0' ? '10' : version === '6.3' ? '8.1' : version === '6.2' ? '8' : version === '6.1' ? '7' : version}`;
      } else if (userAgent.includes('Mac OS X')) {
        const version = userAgent.match(/Mac OS X (\d+[._]\d+)/)?.[1].replace('_', '.');
        os = `macOS ${version}`;
      } else if (userAgent.includes('Linux')) os = 'Linux';
      else if (userAgent.includes('Android')) os = 'Android';
      else if (userAgent.includes('iOS')) os = 'iOS';

      // Определяем устройство
      if (userAgent.includes('Mobile')) device = 'Мобильное устройство';
      else if (userAgent.includes('Tablet')) device = 'Планшет';
      else device = 'Компьютер';

      return {
        id: ip.address + ip.deviceInfo,
        date: ip.lastUsed,
        ip: ip.address,
        location: ip.location ? `${ip.location.city || ''}, ${ip.location.country || ''}`.trim() : 'Неизвестно',
        device,
        browser,
        os,
        isCurrent: ip.address === (req.ip || req.socket.remoteAddress || ''),
        userAgent: ip.deviceInfo // Добавляем полный user-agent для отладки
      };
    }).sort((a: LoginHistoryItem, b: LoginHistoryItem) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.json(loginHistory);
  } catch (error) {
    console.error('Ошибка при получении истории входов:', error);
    res.status(500).json({ message: 'Ошибка при получении истории входов' });
  }
});

export default router; 
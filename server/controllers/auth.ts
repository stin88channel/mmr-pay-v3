import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'mmrpayv3!@#';

export const register = async (req: Request, res: Response) => {
  try {
    const { login, email, password, phoneNumber, typeOfAccount } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ $or: [{ email }, { login }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email или логином уже существует' });
    }

    // Создаем нового пользователя
    const user = new User({
      login,
      email,
      password,
      phoneNumber,
      typeOfAccount,
      balance: 0,
      verificationStatus: 'not_verified',
      notifications: {
        newRequests: true,
        financialOperations: true,
        systemNotifications: true
      }
    });

    await user.save();

    // Создаем JWT токен
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Отправляем ответ без пароля
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        login: user.login,
        typeOfAccount: user.typeOfAccount,
        verificationStatus: user.verificationStatus
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    console.log('🔑 Попытка входа:', { email: req.body.email });
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ Пользователь не найден:', { email });
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    console.log('✅ Пользователь найден:', { 
      email: user.email,
      isLocked: user.isAccountLocked(),
      failedAttempts: user.securitySettings.failedLoginAttempts
    });

    // Проверяем, не заблокирован ли аккаунт
    if (user.isAccountLocked()) {
      console.log('🔒 Аккаунт заблокирован:', { 
        email,
        lockedUntil: user.securitySettings.accountLockedUntil
      });
      return res.status(403).json({ 
        message: 'Аккаунт заблокирован из-за слишком большого количества неудачных попыток входа' 
      });
    }

    const isMatch = await user.comparePassword(password);
    console.log('🔐 Проверка пароля:', { isMatch });

    if (!isMatch) {
      console.log('❌ Неверный пароль:', { email });
      await user.handleFailedLogin();
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Сбрасываем счетчик неудачных попыток при успешном входе
    await user.resetFailedLoginAttempts();

    // Обновляем информацию о последнем входе
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Успешный вход:', { email });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        login: user.login,
        typeOfAccount: user.typeOfAccount,
        verificationStatus: user.verificationStatus
      },
      token
    });
  } catch (error) {
    console.error('❌ Ошибка при входе:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // В будущем здесь можно добавить логику для инвалидации токена
    res.json({ message: 'Успешный выход из системы' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Ошибка при выходе из системы' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    // Проверяем текущий пароль
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Неверный текущий пароль' });
    }

    // Проверяем, что новый пароль не совпадает с текущим
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({ error: 'Новый пароль не должен совпадать с текущим' });
    }

    // Проверяем, что новый пароль не был использован в последних 5 паролях
    const isInHistory = await user.isPasswordInHistory(newPassword);
    if (isInHistory) {
      return res.status(400).json({ error: 'Этот пароль был использован недавно. Выберите другой пароль.' });
    }

    // Добавляем текущий пароль в историю
    await user.addPasswordToHistory(user.password);

    // Хешируем и сохраняем новый пароль
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.lastPasswordChange = new Date();
    await user.save();

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Ошибка при смене пароля' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Не авторизован' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

export const resetAccountLock = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email не указан' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Сбрасываем настройки блокировки
    user.securitySettings.accountLocked = false;
    user.securitySettings.accountLockedUntil = undefined;
    user.securitySettings.failedLoginAttempts = 0;
    user.securitySettings.lastFailedLoginAttempt = undefined;

    await user.save();

    console.log(`Блокировка сброшена для пользователя: ${email}`);
    res.json({ message: 'Блокировка аккаунта успешно сброшена' });
  } catch (error) {
    console.error('Ошибка при сбросе блокировки:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}; 
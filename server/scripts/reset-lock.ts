import mongoose from 'mongoose';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

async function resetLock() {
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://dmin_S3cur1ty:81JukwiA18EA44AW!@africapay.6fkhr.mongodb.net/?retryWrites=true&w=majority&appName=africapay');
    console.log('Connected to MongoDB');

    // Находим пользователя по email
    const user = await User.findOne({ email: 'stino4ek@gmail.com' });
    if (!user) {
      console.log('Пользователь не найден');
      process.exit(1);
    }

    // Сбрасываем настройки блокировки
    user.securitySettings.accountLocked = false;
    user.securitySettings.accountLockedUntil = undefined;
    user.securitySettings.failedLoginAttempts = 0;
    user.securitySettings.lastFailedLoginAttempt = undefined;

    await user.save();
    console.log('Блокировка успешно сброшена');

    process.exit(0);
  } catch (error) {
    console.error('Ошибка:', error);
    process.exit(1);
  }
}

resetLock(); 
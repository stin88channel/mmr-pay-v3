import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { withNextAuth } from '@/middleware/auth';
import bcrypt from 'bcryptjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  try {
    await connectDB();
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный текущий пароль' });
    }

    // Проверяем, не совпадает ли новый пароль с текущим
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({ message: 'Новый пароль должен отличаться от текущего' });
    }

    // Проверяем историю паролей
    const isInHistory = await user.isPasswordInHistory(newPassword);
    if (isInHistory) {
      return res.status(400).json({ 
        message: 'Этот пароль уже использовался ранее. Пожалуйста, выберите другой пароль.' 
      });
    }

    // Обновляем пароль
    user.password = newPassword;
    await user.addPasswordToHistory(newPassword);
    user.lastPasswordChange = new Date();

    await user.save();

    return res.status(200).json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Ошибка при смене пароля:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}

export default withNextAuth(handler); 
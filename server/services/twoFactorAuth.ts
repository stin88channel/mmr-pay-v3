import { authenticator } from 'otplib';
import crypto from 'crypto';

// Настройка параметров otplib
authenticator.options = {
  window: 1, // Разрешаем проверку кодов в пределах 30 секунд до и после
  step: 30,  // Интервал обновления кода (30 секунд)
  digits: 6  // 6-значный код
};

// Генерация секретного ключа
export const generateSecret = () => {
  const secret = authenticator.generateSecret();
  return secret;
};

// Генерация резервных кодов
export const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code.match(/.{1,4}/g)?.join('-') || code);
  }
  return codes;
};

// Проверка токена
export const verifyToken = (secret: string, token: string) => {
  try {
    // Проверяем наличие необходимых параметров
    if (!secret || !token) {
      return false;
    }

    // Проверяем формат токена
    if (!/^\d{6}$/.test(token)) {
      return false;
    }

    // Проверяем токен
    const isValid = authenticator.verify({
      token,
      secret
    });

    return isValid;
  } catch (error) {
    return false;
  }
};

// Генерация QR-кода
export const generateQRCode = (email: string, secret: string): string => {
  return authenticator.keyuri(email, 'MMR-PAY', secret);
}; 
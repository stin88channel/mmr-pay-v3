import { sign, verify } from 'jsonwebtoken';
import { User } from '@/models/User';

type AccountType = 'personal' | 'merchant' | 'moderator' | 'admin';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET не найден в переменных окружения');
}

const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  typeOfAccount: AccountType;
}

export const generateToken = (payload: JWTPayload): string => {
  return sign(payload, process.env.JWT_SECRET!, {
    expiresIn: JWT_EXPIRES_IN
  });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    throw new Error('Недействительный токен');
  }
};

export const extractTokenFromHeader = (authHeader: string | undefined): string => {
  if (!authHeader) {
    throw new Error('Отсутствует заголовок авторизации');
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    throw new Error('Неверный формат токена');
  }

  return token;
}; 
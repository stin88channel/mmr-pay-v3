import { z } from 'zod';

// Схема для регистрации
export const registerSchema = z.object({
  email: z.string().email('Неверный формат email'),
  phoneNumber: z.string().min(10, 'Номер телефона должен содержать минимум 10 цифр'),
  login: z.string().min(3, 'Логин должен содержать минимум 3 символа'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  typeOfAccount: z.enum(['personal', 'merchant', 'moderator', 'admin'])
});

// Схема для входа
export const loginSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(1, 'Пароль обязателен')
});

// Типы на основе схем
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>; 
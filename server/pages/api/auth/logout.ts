import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  try {
    // Очищаем куки с токеном
    res.setHeader('Set-Cookie', [
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure'
    ]);

    return res.status(200).json({ message: 'Успешный выход из системы' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Ошибка при выходе из системы' });
  }
}
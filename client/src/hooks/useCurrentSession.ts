import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Session {
  address: string;
  deviceInfo: string;
  lastUsed: string;
  location: {
    country: string | null;
    region: string | null;
    city: string | null;
  };
}

export const useCurrentSession = () => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentSession = async () => {
      try {
        setLoading(true);
        const response = await api.get('/user/profile');
        const sessions = response.data.user.ipAddresses;
        
        // Получаем информацию о текущем устройстве
        const currentUserAgent = navigator.userAgent;
        const currentIp = await fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(data => data.ip)
          .catch(() => 'unknown');

        // Ищем текущую сессию
        const session = sessions.find((s: Session) => 
          s.deviceInfo === currentUserAgent && 
          (s.address === currentIp || 
           s.address === '127.0.0.1' || 
           s.address === '::1' || 
           s.address === 'localhost')
        );

        setCurrentSession(session || null);
        setError(null);
      } catch (err) {
        setError('Не удалось определить текущую сессию');
        setCurrentSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentSession();
  }, []);

  return { currentSession, loading, error };
}; 
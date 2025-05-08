import { NextApiRequest } from 'next';
import fetch from 'node-fetch';

export interface IpInfo {
  address: string;
  deviceInfo: string;
  location: {
    country: string | null;
    city: string | null;
    region: string | null;
    timezone: string | null;
    isp: string | null;
    org: string | null;
    asn: string | null;
    latitude: number | null;
    longitude: number | null;
    postal: string | null;
    currency: string | null;
  };
  connection: {
    asn: string | null;
    isp: string | null;
    domain: string | null;
  };
}

export async function getIpInfo(req: NextApiRequest): Promise<IpInfo> {
  // Получаем IP из заголовков
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const ip = Array.isArray(forwardedFor) 
    ? forwardedFor[0] 
    : (forwardedFor as string) || (realIP as string) || req.socket.remoteAddress || '::1';

  // Получаем информацию об устройстве
  const userAgent = req.headers['user-agent'] || 'Unknown';

  try {
    // Для localhost используем специальный IP для тестирования
    const ipToCheck = ip === '::1' || ip === '127.0.0.1' ? '8.8.8.8' : ip;
    
    // Используем ipinfo.io API для получения информации о местоположении
    const response = await fetch(`https://ipinfo.io/${ipToCheck}/json?token=${process.env.IPINFO_TOKEN}`);
    const data = await response.json();

    // Если это был localhost, возвращаем специальную информацию
    if (ip === '::1' || ip === '127.0.0.1') {
      return {
        address: ip,
        deviceInfo: userAgent,
        location: {
          country: 'Local',
          city: 'Local',
          region: 'Local',
          timezone: 'Local',
          isp: 'Local',
          org: 'Local',
          asn: 'Local',
          latitude: null,
          longitude: null,
          postal: null,
          currency: null
        },
        connection: {
          asn: 'Local',
          isp: 'Local',
          domain: 'localhost'
        }
      };
    }

    return {
      address: ip,
      deviceInfo: userAgent,
      location: {
        country: data.country || null,
        city: data.city || null,
        region: data.region || null,
        timezone: data.timezone || null,
        isp: data.org || null,
        org: data.org || null,
        asn: data.asn || null,
        latitude: data.loc ? parseFloat(data.loc.split(',')[0]) : null,
        longitude: data.loc ? parseFloat(data.loc.split(',')[1]) : null,
        postal: data.postal || null,
        currency: null
      },
      connection: {
        asn: data.asn || null,
        isp: data.org || null,
        domain: data.hostname || null
      }
    };
  } catch (error) {
    console.error('Error fetching IP info:', error);
    // Возвращаем базовую информацию, если не удалось получить данные
    return {
      address: ip,
      deviceInfo: userAgent,
      location: {
        country: null,
        city: null,
        region: null,
        timezone: null,
        isp: null,
        org: null,
        asn: null,
        latitude: null,
        longitude: null,
        postal: null,
        currency: null
      },
      connection: {
        asn: null,
        isp: null,
        domain: null
      }
    };
  }
}

export const isSuspiciousIp = async (ipInfo: IpInfo, knownIps: string[]): Promise<boolean> => {
  // Если это первый IP-адрес пользователя, считаем его безопасным
  if (knownIps.length === 0) {
    return false;
  }

  // Если IP-адрес уже известен, считаем его безопасным
  if (knownIps.includes(ipInfo.address)) {
    return false;
  }

  // Для localhost всегда считаем безопасным
  if (ipInfo.address === '::1' || ipInfo.address === '127.0.0.1') {
    return false;
  }

  return false;
}; 
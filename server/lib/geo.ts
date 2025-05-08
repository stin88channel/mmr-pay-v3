import axios from 'axios';

interface GeoLocation {
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  isp?: string;
  org?: string;
  asn?: string;
  latitude?: number;
  longitude?: number;
  postal?: string;
  currency?: string;
  connection?: {
    asn?: number;
    isp?: string;
    domain?: string;
  };
}

// Список стран с высоким риском
const HIGH_RISK_COUNTRIES = [
  'North Korea',
  'Iran',
  'Syria',
  'Cuba',
  'Sudan'
];

// Список подозрительных организаций
const SUSPICIOUS_ORGS = [
  // Облачные провайдеры
  'amazon', 'aws', 'google', 'microsoft', 'azure', 'digitalocean', 'linode', 'vultr', 'ovh', 'hetzner', 'alibaba', 'tencent',
  // VPN провайдеры
  'nordvpn', 'expressvpn', 'cyberghost', 'protonvpn', 'surfshark', 'private internet access', 'ipvanish',
  // Прокси сервисы
  'proxy', 'proxies', 'vpn', 'tor', 'tunnel', 'gateway',
  // Хостинги
  'hosting', 'server', 'datacenter', 'colo', 'rack', 'cloud'
];

// Список подозрительных ASN (Autonomous System Numbers)
const SUSPICIOUS_ASN = [
  'AS16509', // Amazon
  'AS15169', // Google
  'AS8075',  // Microsoft
  'AS14061', // DigitalOcean
  'AS63949', // Linode
  'AS20473', // Choopa (Vultr)
  'AS16276', // OVH
  'AS24940', // Hetzner
  'AS37963', // Alibaba
  'AS45090'  // Tencent
];

export const getGeoLocation = async (ip: string): Promise<GeoLocation> => {
  try {
    // Используем ipapi.co для получения информации
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    const data = response.data;

    return {
      country: data.country_name,
      city: data.city,
      region: data.region,
      timezone: data.timezone,
      isp: data.org,
      org: data.org,
      asn: data.asn,
      latitude: data.latitude,
      longitude: data.longitude,
      postal: data.postal,
      currency: data.currency,
      connection: {
        asn: data.asn,
        isp: data.org,
        domain: data.org_domain
      }
    };
  } catch (error) {
    console.error('Ошибка при получении геолокации:', error);
    return {};
  }
};

export interface SecurityCheck {
  isSuspicious: boolean;
  reasons: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export const checkIpSecurity = (location: GeoLocation): SecurityCheck => {
  const reasons: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  if (!location) {
    return {
      isSuspicious: true,
      reasons: ['Не удалось получить информацию о местоположении'],
      riskLevel: 'high'
    };
  }

  // Проверка страны
  if (location.country && HIGH_RISK_COUNTRIES.includes(location.country)) {
    reasons.push(`IP из страны с высоким риском: ${location.country}`);
    riskLevel = 'high';
  }

  // Проверка организации
  if (location.org) {
    const orgLower = location.org.toLowerCase();
    const suspiciousOrg = SUSPICIOUS_ORGS.find(org => orgLower.includes(org));
    if (suspiciousOrg) {
      reasons.push(`Подозрительная организация: ${location.org}`);
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    }
  }

  // Проверка ASN
  if (location.asn && SUSPICIOUS_ASN.includes(location.asn)) {
    reasons.push(`Подозрительный ASN: ${location.asn}`);
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
  }

  // Проверка координат
  if (location.latitude && location.longitude) {
    // Проверка на океан (обычно это дата-центры)
    if (isInOcean(location.latitude, location.longitude)) {
      reasons.push('IP расположен в океане (возможно дата-центр)');
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    }
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
    riskLevel
  };
};

// Вспомогательная функция для проверки координат в океане
const isInOcean = (lat: number, lon: number): boolean => {
  // Простая проверка на основные океаны
  // Это очень приблизительная проверка, в реальном проекте нужно использовать более точные данные
  const oceanRegions = [
    { minLat: -60, maxLat: 60, minLon: -180, maxLon: -120 }, // Тихий океан (запад)
    { minLat: -60, maxLat: 60, minLon: 120, maxLon: 180 },   // Тихий океан (восток)
    { minLat: -60, maxLat: 60, minLon: -60, maxLon: 20 },    // Атлантический океан
    { minLat: -60, maxLat: 0, minLon: 20, maxLon: 120 }      // Индийский океан
  ];

  return oceanRegions.some(region => 
    lat >= region.minLat && 
    lat <= region.maxLat && 
    lon >= region.minLon && 
    lon <= region.maxLon
  );
}; 
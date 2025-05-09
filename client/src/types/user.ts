export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  login: string;
  typeOfAccount: 'personal' | 'merchant' | 'moderator' | 'admin';
  balance: number;
  limits: {
    daily: number;
    monthly: number;
  };
  verification: {
    status: 'verified' | 'pending' | 'not_verified';
    documents?: {
      type: string;
      url: string;
      verifiedAt?: string;
    }[];
  };
  notifications: {
    newRequests: boolean;
    transactions: boolean;
    system: boolean;
    email: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    apiKey?: string;
    ipAddresses: {
      address: string;
      lastUsed: string;
      deviceInfo: string;
      location?: {
        country?: string;
        city?: string;
      };
    }[];
    lastIpAddress?: string;
    suspiciousActivity: {
      timestamp: string;
      type: 'failed_login' | 'password_change' | 'suspicious_ip' | 'other';
      details: string;
    }[];
  };
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  twoFactorAuth?: {
    enabled: boolean;
    secret: string;
    backupCodes?: Array<{
      code: string;
      used: boolean;
    }>;
  };
} 
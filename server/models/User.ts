import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface INotifications {
  newRequests: boolean;
  financialOperations: boolean;
  systemNotifications: boolean;
}

export interface ActivityLog {
  timestamp: Date;
  event: string;
  ip: string;
  deviceInfo: string;
  location?: {
    country: string | null;
    region: string | null;
    city: string | null;
  };
  details?: Record<string, any>;
}

export interface IUser extends Document {
  email: string;
  login: string;
  password: string;
  typeOfAccount: 'personal' | 'merchant' | 'admin' | 'moderator';
  phoneNumber: string;
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'not_verified';
  balance: number;
  usdtAddress: string;
  avatar?: string;
  createdAt: Date;
  lastLogin: Date;
  lastPasswordChange: Date;
  passwordHistory: Array<{
    password: string;
    changedAt: Date;
  }>;
  apiKey?: string;
  securitySettings: {
    loginNotifications: boolean;
    activityLogging: {
      enabled: boolean;
      retentionPeriod: number;
      detailLevel: 'basic' | 'standard' | 'detailed' | 'debug';
    };
    failedLoginLimit: boolean;
    failedLoginAttempts: number;
    lastFailedLoginAttempt?: Date;
    accountLocked: boolean;
    accountLockedUntil?: Date;
    ipRestrictions: {
      enabled: boolean;
      allowedIps: Array<string>;
    };
    timeRestrictions: {
      enabled: boolean;
      workDaysOnly: boolean;
      startTime: string;
      endTime: string;
    };
    geoRestrictions: {
      enabled: boolean;
      allowedCountries: Array<string>;
    };
  };
  notifications: {
    newRequests: boolean;
    financialOperations: boolean;
    systemNotifications: boolean;
  };
  ipAddresses: Array<{
    address: string;
    lastUsed: Date;
    deviceInfo: string;
    location: {
      country: string | null;
      region: string | null;
      city: string | null;
    };
  }>;
  activityLogs: Array<ActivityLog>;
  twoFactorAuth: {
    enabled: boolean;
    secret: string;
    backupCodes: Array<{
      code: string;
      used: boolean;
      usedAt?: Date;
    }>;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
  isPasswordInHistory(candidatePassword: string): Promise<boolean>;
  addPasswordToHistory(password: string): Promise<void>;
  generateApiKey(): Promise<string>;
  handleFailedLogin(): Promise<void>;
  resetFailedLoginAttempts(): Promise<void>;
  isAccountLocked(): boolean;
  checkIpRestriction(ip: string): boolean;
  checkTimeRestriction(): boolean;
  checkGeoRestriction(country: string): boolean;
  logActivity(
    event: string,
    ip: string,
    deviceInfo: string,
    location?: { country: string | null; region: string | null; city: string | null },
    details?: Record<string, any>
  ): Promise<void>;
}

const activityLogSchema = new Schema<ActivityLog>({
  timestamp: {
    type: Date,
    default: Date.now
  },
  event: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  deviceInfo: {
    type: String,
    required: true
  },
  location: {
    country: String,
    region: String,
    city: String
  },
  details: {
    type: Schema.Types.Mixed
  }
});

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  login: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  passwordHistory: [{
    password: String,
    changedAt: Date
  }],
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  typeOfAccount: {
    type: String,
    enum: ['personal', 'merchant', 'moderator', 'admin'],
    default: 'personal'
  },
  verificationStatus: {
    type: String,
    enum: ['not_verified', 'verified', 'rejected', 'pending'],
    default: 'not_verified'
  },
  balance: {
    type: Number,
    default: 0
  },
  usdtAddress: {
    type: String,
    default: "1",
    required: true
  },
  avatar: {
    type: String
  },
  apiKey: {
    type: String,
    unique: true,
    sparse: true
  },
  notifications: {
    type: {
      newRequests: { type: Boolean, default: true },
      financialOperations: { type: Boolean, default: true },
      systemNotifications: { type: Boolean, default: true }
    },
    default: {
      newRequests: true,
      financialOperations: true,
      systemNotifications: true
    },
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  lastPasswordChange: {
    type: Date,
    default: Date.now
  },
  activityLogs: [activityLogSchema],
  securitySettings: {
    loginNotifications: {
      type: Boolean,
      default: true
    },
    activityLogging: {
      enabled: {
        type: Boolean,
        default: false
      },
      retentionPeriod: {
        type: Number,
        default: 30
      },
      detailLevel: {
        type: String,
        enum: ['basic', 'standard', 'detailed', 'debug'],
        default: 'standard'
      }
    },
    failedLoginLimit: {
      type: Boolean,
      default: true
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lastFailedLoginAttempt: {
      type: Date
    },
    accountLocked: {
      type: Boolean,
      default: false
    },
    accountLockedUntil: {
      type: Date
    },
    ipRestrictions: {
      enabled: {
        type: Boolean,
        default: false
      },
      allowedIps: [{
        type: String,
        trim: true
      }]
    },
    timeRestrictions: {
      enabled: {
        type: Boolean,
        default: false
      },
      workDaysOnly: {
        type: Boolean,
        default: false
      },
      startTime: {
        type: String,
        default: "09:00"
      },
      endTime: {
        type: String,
        default: "18:00"
      }
    },
    geoRestrictions: {
      enabled: {
        type: Boolean,
        default: false
      },
      allowedCountries: [{
        type: String,
        trim: true
      }]
    }
  },
  ipAddresses: [{
    address: String,
    lastUsed: Date,
    deviceInfo: String,
    location: {
      country: String,
      region: String,
      city: String,
      loc: String,
      org: String,
      postal: String,
      timezone: String
    }
  }],
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false
    },
    secret: {
      type: String,
      default: null
    },
    backupCodes: [{
      code: {
        type: String,
        required: true
      },
      used: {
        type: Boolean,
        default: false
      },
      usedAt: {
        type: Date
      }
    }]
  }
});

// Хэширование пароля перед сохранением
userSchema.pre('save', async function(this: IUser, next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Метод для сравнения паролей
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Метод для проверки пароля в истории
userSchema.methods.isPasswordInHistory = async function(candidatePassword: string): Promise<boolean> {
  for (const hashedPassword of this.passwordHistory) {
    if (await bcrypt.compare(candidatePassword, hashedPassword)) {
      return true;
    }
  }
  return false;
};

// Метод для добавления пароля в историю
userSchema.methods.addPasswordToHistory = async function(password: string): Promise<void> {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // Добавляем новый пароль в начало массива
  this.passwordHistory.unshift({
    password: hashedPassword,
    changedAt: new Date()
  });
  
  // Оставляем только последние 5 паролей
  if (this.passwordHistory.length > 5) {
    this.passwordHistory = this.passwordHistory.slice(0, 5);
  }
};

// Метод для генерации API ключа
userSchema.methods.generateApiKey = async function(): Promise<string> {
  const crypto = require('crypto');
  const apiKey = `mmr_${crypto.randomBytes(32).toString('hex')}`;
  this.apiKey = apiKey;
  return apiKey;
};

// Метод для проверки и обновления неудачных попыток входа
userSchema.methods.handleFailedLogin = async function() {
  if (this.securitySettings.failedLoginLimit) {
    this.securitySettings.failedLoginAttempts += 1;
    this.securitySettings.lastFailedLoginAttempt = new Date();

    if (this.securitySettings.failedLoginAttempts >= 5) {
      this.securitySettings.accountLocked = true;
      this.securitySettings.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Блокировка на 30 минут
    }

    await this.save();
  }
};

// Метод для сброса неудачных попыток входа
userSchema.methods.resetFailedLoginAttempts = async function() {
  this.securitySettings.failedLoginAttempts = 0;
  this.securitySettings.accountLocked = false;
  this.securitySettings.accountLockedUntil = undefined;
  await this.save();
};

// Метод для проверки блокировки аккаунта
userSchema.methods.isAccountLocked = function(): boolean {
  if (!this.securitySettings.accountLocked) {
    return false;
  }

  if (!this.securitySettings.accountLockedUntil) {
    return false;
  }

  // Если время блокировки истекло, сбрасываем блокировку
  if (new Date() > this.securitySettings.accountLockedUntil) {
    this.securitySettings.accountLocked = false;
    this.securitySettings.accountLockedUntil = undefined;
    this.securitySettings.failedLoginAttempts = 0;
    this.save();
    return false;
  }

  return true;
};

// Метод для проверки IP-ограничений
userSchema.methods.checkIpRestriction = function(ip: string): boolean {
  if (!this.securitySettings.ipRestrictions.enabled) {
    return true;
  }

  return this.securitySettings.ipRestrictions.allowedIps.some((allowedIp: string) => {
    // Проверка на точное совпадение
    if (allowedIp === ip) return true;
    
    // Проверка на CIDR нотацию (например, 192.168.1.0/24)
    if (allowedIp.includes('/')) {
      const [subnet, bits] = allowedIp.split('/');
      const ipNum = ip.split('.').reduce((acc: number, octet: string) => (acc << 8) + parseInt(octet), 0);
      const subnetNum = subnet.split('.').reduce((acc: number, octet: string) => (acc << 8) + parseInt(octet), 0);
      const mask = ~((1 << (32 - parseInt(bits))) - 1);
      return (ipNum & mask) === (subnetNum & mask);
    }
    
    return false;
  });
};

// Метод для проверки временных ограничений
userSchema.methods.checkTimeRestriction = function(): boolean {
  if (!this.securitySettings.timeRestrictions.enabled) {
    return true;
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 - воскресенье, 1-5 - пн-пт, 6 - суббота
  const currentTime = now.toLocaleTimeString('en-US', { hour12: false });

  // Проверка рабочих дней
  if (this.securitySettings.timeRestrictions.workDaysOnly && (currentDay === 0 || currentDay === 6)) {
    return false;
  }

  // Проверка времени
  return currentTime >= this.securitySettings.timeRestrictions.startTime && 
         currentTime <= this.securitySettings.timeRestrictions.endTime;
};

// Метод для проверки геоограничений
userSchema.methods.checkGeoRestriction = function(country: string): boolean {
  if (!this.securitySettings.geoRestrictions.enabled) {
    return true;
  }

  return this.securitySettings.geoRestrictions.allowedCountries.includes(country);
};

// Метод для логирования активности
userSchema.methods.logActivity = async function(
  event: string,
  ip: string,
  deviceInfo: string,
  location?: { country: string | null; region: string | null; city: string | null },
  details?: Record<string, any>
): Promise<void> {
  if (!this.securitySettings.activityLogging.enabled) {
    return;
  }

  const log: ActivityLog = {
    timestamp: new Date(),
    event,
    ip,
    deviceInfo,
    location,
    details
  };

  this.activityLogs.push(log);

  // Удаляем старые логи в соответствии с периодом хранения
  const retentionDate = new Date();
  retentionDate.setDate(retentionDate.getDate() - this.securitySettings.activityLogging.retentionPeriod);
  
  this.activityLogs = this.activityLogs.filter((log: ActivityLog) => log.timestamp > retentionDate);

  await this.save();
};

// Проверяем, существует ли уже модель
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema); 
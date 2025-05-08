import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface INotifications {
  newRequests: boolean;
  financialOperations: boolean;
  systemNotifications: boolean;
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
    activityLogging: boolean;
    failedLoginLimit: boolean;
    failedLoginAttempts: number;
    lastFailedLoginAttempt?: Date;
    accountLocked: boolean;
    accountLockedUntil?: Date;
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
  comparePassword(candidatePassword: string): Promise<boolean>;
  isPasswordInHistory(candidatePassword: string): Promise<boolean>;
  addPasswordToHistory(password: string): Promise<void>;
  generateApiKey(): Promise<string>;
  handleFailedLogin(): Promise<void>;
  resetFailedLoginAttempts(): Promise<void>;
  isAccountLocked(): boolean;
}

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
  securitySettings: {
    loginNotifications: {
      type: Boolean,
      default: true
    },
    activityLogging: {
      type: Boolean,
      default: false
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
  }]
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
userSchema.methods.generateApiKey = async function() {
  const crypto = require('crypto');
  const apiKey = crypto.randomBytes(32).toString('hex');
  this.apiKey = apiKey;
  await this.save();
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

// Проверяем, существует ли уже модель
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema); 
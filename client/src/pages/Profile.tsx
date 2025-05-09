import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User, Shield, Copy, RefreshCw, Globe, Settings, Key, Lock, History, FileText, FileCheck, Eye, EyeOff, LogIn, LogOut, MapPin, Info, Apple, Monitor, Terminal } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { api, authApi, securityApi, type SecuritySettings } from '@/lib/api';
import { getBrowserInfo } from '@/lib/browser-utils';
import { ChromeIcon, FirefoxIcon, SafariIcon, EdgeIcon, YandexIcon } from '@/components/icons/browsers';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { Loader } from "@/components/ui/loader";
import TwoFactorAuth from '@/pages/TwoFactorAuth';
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter } from "lucide-react";
import * as XLSX from 'xlsx';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const card = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

const getVerificationBadge = (status: 'verified' | 'pending' | 'not_verified') => {
  switch (status) {
    case 'verified':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
          Подтвержден
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100">
          В процессе
        </Badge>
      );
    case 'not_verified':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">
          Не пройдена
        </Badge>
      );
  }
};

const getAccountStatusBadge = (verificationStatus: 'verified' | 'pending' | 'not_verified') => {
  if (verificationStatus === 'not_verified') {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">
        Неактивен
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
      Активен
    </Badge>
  );
};

const getBrowserIcon = (icon: string) => {
  switch (icon) {
    case 'chrome':
      return <ChromeIcon />;
    case 'firefox':
      return <FirefoxIcon />;
    case 'safari':
      return <SafariIcon />;
    case 'edge':
      return <EdgeIcon />;
    case 'yandex':
      return <YandexIcon />;
    default:
      return <Globe className="h-4 w-4" />;
  }
};

const getAccountTypeLabel = (type: string): string => {
  switch (type) {
    case 'personal':
      return 'Трейдер';
    case 'merchant':
      return 'Мерчант';
    case 'admin':
      return 'Администратор';
    case 'moderator':
      return 'Модератор';
    default:
      return type;
  }
};

interface ProfileData {
  id: string;
  email: string;
  login: string;
  phoneNumber: string;
  typeOfAccount: string;
  createdAt: string;
  lastLogin: string;
  verificationStatus: 'verified' | 'pending' | 'not_verified';
  avatar?: string;
  apiKey?: string;
  notifications?: {
    newRequests: boolean;
    financialOperations: boolean;
    systemNotifications: boolean;
  };
  ipAddresses: Array<{
    address: string;
    lastUsed: string;
    deviceInfo: string;
    location: {
      country: string | null;
      region: string | null;
      city: string | null;
    };
  }>;
  securitySettings?: SecuritySettings;
}

interface ActivityLog {
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
  status?: 'success' | 'error' | 'info';
}

const Profile: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("personal");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { currentSession } = useCurrentSession();
  const [securityTab, setSecurityTab] = useState('general');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordExpiration, setPasswordExpiration] = useState(false);
  const [passwordExpirationDays, setPasswordExpirationDays] = useState('30');
  const [ipRestrictions, setIpRestrictions] = useState(false);
  const [ipAddresses, setIpAddresses] = useState('');
  const [loginNotifications, setLoginNotifications] = useState(false);
  const [activityLogging, setActivityLogging] = useState<{
    enabled: boolean;
    retentionPeriod: number;
    detailLevel: 'basic' | 'standard' | 'detailed' | 'debug';
  }>({
    enabled: false,
    retentionPeriod: 30,
    detailLevel: 'standard'
  });
  const [failedLoginLimit, setFailedLoginLimit] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    login: '',
    email: ''
  });
  const [editErrors, setEditErrors] = useState({
    login: '',
    email: ''
  });
  const [isLoginAvailable, setIsLoginAvailable] = useState(true);
  const [isCheckingLogin, setIsCheckingLogin] = useState(false);
  const [workDaysOnly, setWorkDaysOnly] = useState(false);
  const [geoRestrictions, setGeoRestrictions] = useState(false);
  const [notifications, setNotifications] = useState({
    newRequests: false,
    financialOperations: false,
    systemNotifications: false
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityLogSettings, setActivityLogSettings] = useState({
    enabled: false,
    retentionPeriod: 30,
    detailLevel: 'standard' as 'basic' | 'standard' | 'detailed' | 'debug'
  });
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    const path = location.pathname;
    if (path.includes('/security')) {
      setActiveTab('security');
      if (path.includes('/security/general')) {
        setSecurityTab('general');
      } else if (path.includes('/security/password')) {
        setSecurityTab('password');
      } else if (path.includes('/security/restrictions')) {
        setSecurityTab('restrictions');
      } else if (path.includes('/security/activity')) {
        setSecurityTab('activity');
      } else if (path.includes('/security/2fa')) {
        setSecurityTab('2fa');
      }
    } else {
      setActiveTab('personal');
    }
  }, [location]);

  useEffect(() => {
    if (profileData?.securitySettings) {
      // console.log('Обновление состояний из профиля:', profileData.securitySettings);
      setLoginNotifications(profileData.securitySettings.loginNotifications || false);
      setFailedLoginLimit(profileData.securitySettings.failedLoginLimit || false);
      setIpRestrictions(profileData.securitySettings.ipRestrictions?.enabled || false);
      setIpAddresses(profileData.securitySettings.ipRestrictions?.allowedIps?.join('\n') || '');
      setWorkDaysOnly(profileData.securitySettings.timeRestrictions?.workDaysOnly || false);
      setGeoRestrictions(profileData.securitySettings.geoRestrictions?.enabled || false);
    }
  }, [profileData]);

  useEffect(() => {
    if (profileData?.notifications) {
      // console.log('Обновление состояний уведомлений:', profileData.notifications);
      setNotifications({
        newRequests: profileData.notifications.newRequests || false,
        financialOperations: profileData.notifications.financialOperations || false,
        systemNotifications: profileData.notifications.systemNotifications || false
      });
    }
  }, [profileData]);

  useEffect(() => {
    if (profileData?.securitySettings?.activityLogging) {
      setActivityLogSettings({
        enabled: profileData.securitySettings.activityLogging.enabled,
        retentionPeriod: profileData.securitySettings.activityLogging.retentionPeriod,
        detailLevel: profileData.securitySettings.activityLogging.detailLevel
      });
    }
  }, [profileData]);

  useEffect(() => {
    if (securityTab === 'activity') {
      fetchActivityLogs();
    }
  }, [securityTab]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/profile');
      setProfileData(response.data.user);
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные профиля",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'security') {
      navigate('/profile/security');
    } else {
      navigate('/profile');
    }
  };

  const handleSecurityTabChange = (value: string) => {
    setSecurityTab(value);
    navigate(`/profile/security/${value}`);
  };

  const handleCopyApiKey = () => {
    if (!profileData?.apiKey) {
      toast({
        title: "Ошибка",
        description: "API ключ не найден",
        variant: "destructive",
      });
      return;
    }
    navigator.clipboard.writeText(profileData.apiKey);
    toast({
      title: "Успешно",
      description: "API ключ скопирован в буфер обмена",
    });
  };

  const handleResetApiKey = async () => {
    try {
      const response = await api.post('/user/reset-api-key');
      setProfileData(response.data.user);
      toast({
        title: "Успешно",
        description: "API ключ успешно сброшен",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.message || "Не удалось сбросить API ключ",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из аккаунта",
        variant: "destructive",
      });
    }
  };

  const handleTerminateSession = async (sessionId: number) => {
    try {
      const response = await api.delete(`/user/sessions?sessionId=${sessionId}`);
      
      // Если была завершена текущая сессия, выходим из аккаунта
      if (response.data.isCurrentSession) {
        await logout();
        window.location.href = '/login';
        return;
      }

      await fetchProfile();
      toast({
        title: "Успешно",
        description: "Сессия успешно завершена",
      });
    } catch (error: any) {
      const message = error.response?.data?.message || "Не удалось завершить сессию";
      toast({
        title: "Ошибка",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleTerminateAllSessions = async () => {
    try {
      const response = await api.delete('/user/sessions?sessionId=all');
      
      // Если была завершена текущая сессия, выходим из аккаунта
      if (response.data.isCurrentSession) {
        await logout();
        window.location.href = '/login';
        return;
      }

      await fetchProfile();
      toast({
        title: "Успешно",
        description: "Все сессии успешно завершены",
      });
    } catch (error: any) {
      const message = error.response?.status === 404 
        ? "Нет других активных сессий для завершения" 
        : error.response?.data?.message || "Не удалось завершить все сессии";
      toast({
        title: "Информация",
        description: message,
        variant: "default",
      });
    }
  };

  const handleToggleNotification = async (type: keyof typeof notifications) => {
    try {
      const newValue = !notifications[type];
      const updatedNotifications = {
        ...notifications,
        [type]: newValue
      };

      const response = await api.patch('/user/notifications', updatedNotifications);
      
      if (response.data.user?.notifications) {
        setNotifications(response.data.user.notifications);
        toast({
          title: "Успешно",
          description: "Настройки уведомлений обновлены",
        });
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.message || 'Не удалось обновить настройки уведомлений',
        variant: "destructive",
      });
    }
  };

  const handleSavePasswordChange = async () => {
    // Сбрасываем ошибки
    setFieldErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    let hasErrors = false;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (!currentPassword) {
      newErrors.currentPassword = 'Введите текущий пароль';
      hasErrors = true;
    }

    if (!newPassword) {
      newErrors.newPassword = 'Введите новый пароль';
      hasErrors = true;
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Новый пароль должен быть не менее 8 символов';
      hasErrors = true;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите новый пароль';
      hasErrors = true;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(newErrors);
      return;
    }

    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast({
        title: "Успешно",
        description: "Пароль успешно изменен",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFieldErrors({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.message || 'Ошибка при смене пароля',
        variant: "destructive",
      });
    }
  };

  const handleSaveIpRestrictions = async () => {
    try {
      await api.post('/user/security/ip-restrictions', {
        enabled: ipRestrictions,
        allowedIps: ipAddresses.split('\n').filter(ip => ip.trim())
      });
      
      toast({
        title: "Успешно",
        description: "IP-ограничения обновлены",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.message || 'Не удалось обновить IP-ограничения',
        variant: "destructive",
      });
    }
  };

  const handleSaveTimeRestrictions = async () => {
    try {
      await api.post('/user/security/time-restrictions', {
        enabled: true,
        workDaysOnly,
        startTime: '09:00',
        endTime: '18:00'
      });
      
      toast({
        title: "Успешно",
        description: "Временные ограничения обновлены",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.message || 'Не удалось обновить временные ограничения',
        variant: "destructive",
      });
    }
  };

  const handleSaveGeoRestrictions = async () => {
    try {
      const response = await api.post('/user/security/geo-restrictions', {
        enabled: geoRestrictions,
        allowedCountries: ['RU']
      });
      
      if (response.data.user?.securitySettings?.geoRestrictions) {
        setGeoRestrictions(response.data.user.securitySettings.geoRestrictions.enabled);
      }
      
      toast({
        title: "Успешно",
        description: "Геоограничения обновлены",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.message || 'Не удалось обновить геоограничения',
        variant: "destructive",
      });
    }
  };

  const handleExportLogs = () => {
    // Implementation of handleExportLogs
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    
    // Длина пароля
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Наличие цифр
    if (/\d/.test(password)) strength += 1;
    
    // Наличие строчных букв
    if (/[a-z]/.test(password)) strength += 1;
    
    // Наличие заглавных букв
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Наличие специальных символов
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    
    return Math.min(strength, 5);
  };

  const getPasswordStrengthColor = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-blue-500';
      case 5:
        return 'bg-green-500';
      default:
        return 'bg-gray-200';
    }
  };

  const getPasswordStrengthText = (strength: number): string => {
    switch (strength) {
      case 0:
        return 'Очень слабый';
      case 1:
        return 'Слабый';
      case 2:
        return 'Средний';
      case 3:
        return 'Хороший';
      case 4:
        return 'Сильный';
      case 5:
        return 'Очень сильный';
      default:
        return '';
    }
  };

  const handleSecuritySettingsChange = async (settings: Partial<SecuritySettings>) => {
    try {
      const updatedSettings: SecuritySettings = {
        loginNotifications,
        activityLogging: {
          enabled: activityLogging.enabled,
          retentionPeriod: activityLogging.retentionPeriod,
          detailLevel: activityLogging.detailLevel
        },
        failedLoginLimit,
        ipRestrictions: {
          enabled: ipRestrictions,
          allowedIps: ipAddresses.split('\n').filter(ip => ip.trim())
        },
        timeRestrictions: {
          enabled: workDaysOnly,
          workDaysOnly,
          startTime: '09:00',
          endTime: '18:00'
        },
        geoRestrictions: {
          enabled: geoRestrictions,
          allowedCountries: ['RU']
        },
        ...settings
      };
      
      const response = await api.put('/user/security/settings', updatedSettings);
      
      // Обновляем состояния после успешного сохранения
      if (settings.loginNotifications !== undefined) {
        setLoginNotifications(settings.loginNotifications);
      }
      if (settings.activityLogging?.enabled !== undefined) {
        setActivityLogging({
          enabled: settings.activityLogging.enabled,
          retentionPeriod: settings.activityLogging.retentionPeriod || 30,
          detailLevel: settings.activityLogging.detailLevel || 'standard'
        });
      }
      if (settings.failedLoginLimit !== undefined) {
        setFailedLoginLimit(settings.failedLoginLimit);
      }

      toast({
        title: "Успешно",
        description: "Настройки безопасности обновлены",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.message || 'Не удалось обновить настройки безопасности',
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async () => {
    // Сбрасываем ошибки
    setEditErrors({
      login: '',
      email: ''
    });

    // Валидация
    let hasErrors = false;
    const newErrors = {
      login: '',
      email: ''
    };

    if (!editForm.login) {
      newErrors.login = 'Введите логин';
      hasErrors = true;
    } else if (editForm.login.length < 3) {
      newErrors.login = 'Логин должен быть не менее 3 символов';
      hasErrors = true;
    }

    if (!editForm.email) {
      newErrors.email = 'Введите email';
      hasErrors = true;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(editForm.email)) {
      newErrors.email = 'Введите корректный email';
      hasErrors = true;
    }

    if (hasErrors) {
      setEditErrors(newErrors);
      return;
    }

    try {
      const response = await api.patch('/user/profile', editForm);
      setProfileData(response.data.user);
      setIsEditing(false);
      toast({
        title: "Успешно",
        description: "Профиль успешно обновлен",
      });
    } catch (error: any) {
      const message = error.response?.data?.message || "Не удалось обновить профиль";
      toast({
        title: "Ошибка",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleEditCancel = async () => {
    setIsEditing(false);
    // Ждем завершения анимации перед сбросом формы
    await new Promise(resolve => setTimeout(resolve, 200));
    setEditForm({
      login: profileData?.login || '',
      email: profileData?.email || ''
    });
    setEditErrors({
      login: '',
      email: ''
    });
  };

  useEffect(() => {
    if (profileData) {
      setEditForm({
        login: profileData.login,
        email: profileData.email
      });
    }
  }, [profileData]);

  // Функция для проверки доступности логина
  const checkLoginAvailability = async (login: string) => {
    if (!login || login === profileData.login) {
      setIsLoginAvailable(true);
      return;
    }

    setIsCheckingLogin(true);
    try {
      const response = await api.get(`/user/check-login/${login}`);
      setIsLoginAvailable(response.data.available);
    } catch (error) {
      console.error('Ошибка при проверке логина:', error);
      setIsLoginAvailable(false);
    } finally {
      setIsCheckingLogin(false);
    }
  };

  // Обработчик изменения логина
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLogin = e.target.value;
    setEditForm(prev => ({ ...prev, login: newLogin }));
    checkLoginAvailability(newLogin);
  };

  // Функция для проверки наличия изменений
  const hasChanges = () => {
    return editForm.login !== profileData.login || 
           editForm.email !== profileData.email;
  };

  const fetchActivityLogs = async () => {
    try {
      setIsLogsLoading(true);
      const response = await api.get('/user/activity-logs');
      setActivityLogs(response.data.logs);
    } catch (error) {
      console.error('Ошибка при загрузке журнала активности:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить журнал активности",
        variant: "destructive",
      });
    } finally {
      setIsLogsLoading(false);
    }
  };

  const handleActivityLogSettingsChange = async (settings: Partial<typeof activityLogSettings>) => {
    try {
      const updatedSettings = {
        ...activityLogSettings,
        ...settings
      };

      const securitySettings: SecuritySettings = {
        loginNotifications,
        activityLogging: {
          enabled: updatedSettings.enabled,
          retentionPeriod: updatedSettings.retentionPeriod,
          detailLevel: updatedSettings.detailLevel
        },
        failedLoginLimit,
        ipRestrictions: {
          enabled: ipRestrictions,
          allowedIps: ipAddresses.split('\n').filter(ip => ip.trim())
        },
        timeRestrictions: {
          enabled: workDaysOnly,
          workDaysOnly,
          startTime: '09:00',
          endTime: '18:00'
        },
        geoRestrictions: {
          enabled: geoRestrictions,
          allowedCountries: ['RU']
        }
      };

      await api.put('/user/security/settings', securitySettings);
      
      setActivityLogSettings(updatedSettings);
      setActivityLogging({
        enabled: updatedSettings.enabled,
        retentionPeriod: updatedSettings.retentionPeriod,
        detailLevel: updatedSettings.detailLevel
      });
      
      toast({
        title: "Успешно",
        description: "Настройки журналирования обновлены",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.message || 'Не удалось обновить настройки журналирования',
        variant: "destructive",
      });
    }
  };

  const getDeviceInfo = (deviceInfo: string) => {
    const parts = deviceInfo.split(' ');
    
    // Определение браузера
    let browser = 'Неизвестный браузер';
    if (deviceInfo.includes('YaBrowser')) {
      browser = 'Yandex Browser';
    } else if (deviceInfo.includes('Chrome')) {
      browser = 'Chrome';
    } else if (deviceInfo.includes('Firefox')) {
      browser = 'Firefox';
    } else if (deviceInfo.includes('Safari')) {
      browser = 'Safari';
    } else if (deviceInfo.includes('Edge')) {
      browser = 'Edge';
    }

    // Определение ОС
    let os = 'Неизвестная ОС';
    if (deviceInfo.includes('Windows NT')) {
      os = 'Windows';
    } else if (deviceInfo.includes('Mac OS')) {
      os = 'macOS';
    } else if (deviceInfo.includes('Linux')) {
      os = 'Linux';
    }

    return { browser, os };
  };

  const exportToCSV = () => {
    const headers = ['Время', 'Событие', 'IP-адрес', 'Устройство', 'Местоположение', 'Статус'];
    const csvContent = [
      headers.join(','),
      ...activityLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.event,
        log.ip,
        log.deviceInfo,
        [log.location?.city, log.location?.region, log.location?.country].filter(Boolean).join(', '),
        log.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity_log_${new Date().toISOString()}.csv`;
    link.click();
  };

  const exportToExcel = () => {
    // Подготовка данных
    const headers = ['Время', 'Событие', 'IP-адрес', 'Устройство', 'Местоположение', 'Статус'];
    const data = activityLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.event,
      log.ip,
      log.deviceInfo,
      [log.location?.city, log.location?.region, log.location?.country].filter(Boolean).join(', '),
      log.status === 'success' ? 'Успешно' : log.status === 'error' ? 'Ошибка' : 'Информация'
    ]);

    // Создание рабочей книги
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Настройка ширины столбцов
    const colWidths = [
      { wch: 20 }, // Время
      { wch: 25 }, // Событие
      { wch: 15 }, // IP-адрес
      { wch: 40 }, // Устройство
      { wch: 30 }, // Местоположение
      { wch: 15 }  // Статус
    ];
    ws['!cols'] = colWidths;

    // Добавление листа в книгу
    XLSX.utils.book_append_sheet(wb, ws, 'Журнал активности');

    // Генерация файла
    const fileName = `activity_log_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const filteredLogs = activityLogs.filter(log => 
    eventFilter === 'all' || log.event === eventFilter
  );

  const handleManualRefresh = async () => {
    await fetchActivityLogs();
    toast({
      title: "Успешно",
      description: "Журнал активности обновлен",
    });
  };

  if (loading || !profileData) {
    return <Loader size="lg" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h1 className="text-2xl font-bold mb-2">Профиль</h1>
        <p className="text-muted-foreground">Персональная информация и настройки аккаунта</p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Личная информация
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Безопасность
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div variants={card} className="md:row-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profileData.avatar} />
                      <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                        {profileData.login.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <CardTitle>{profileData.login}</CardTitle>
                    <CardDescription>{getAccountTypeLabel(profileData.typeOfAccount)}</CardDescription>
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-4"
                  >
                    <motion.div variants={item}>
                      <Button variant="outline" className="w-full">Изменить фото</Button>
                    </motion.div>
                    
                    <Separator />
                    
                    <motion.div variants={item} className="space-y-1.5">
                      <h3 className="text-sm font-medium">Статус аккаунта</h3>
                      {getAccountStatusBadge(profileData.verificationStatus)}
                    </motion.div>
                    
                    <motion.div variants={item} className="space-y-1.5">
                      <h3 className="text-sm font-medium">Дата регистрации</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(profileData.createdAt).toLocaleDateString()}
                      </p>
                    </motion.div>
                    
                    <motion.div variants={item} className="space-y-1.5">
                      <h3 className="text-sm font-medium">Последний вход</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(profileData.lastLogin).toLocaleString()}
                      </p>
                    </motion.div>
                    
                    <Separator />
                    
                    <motion.div variants={item} className="flex flex-col gap-2">
                      <Button variant="outline" onClick={handleLogout}>Выйти из аккаунта</Button>
                      <Button variant="outline" className="text-destructive hover:text-destructive">
                        Удалить аккаунт
                      </Button>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={card} className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Персональная информация</CardTitle>
                  <CardDescription>Основная информация о вашей учетной записи</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.dl 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-4"
                  >
                    <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                      <dt className="text-sm font-medium sm:col-span-1">ID аккаунта</dt>
                      <dd className="sm:col-span-2 text-muted-foreground">#{profileData.id}</dd>
                    </motion.div>
                    <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                      <dt className="text-sm font-medium sm:col-span-1">Email</dt>
                      <dd className="sm:col-span-2 text-muted-foreground">{profileData.email}</dd>
                    </motion.div>
                    <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                      <dt className="text-sm font-medium sm:col-span-1">Телефон</dt>
                      <dd className="sm:col-span-2 text-muted-foreground">{profileData.phoneNumber}</dd>
                    </motion.div>
                    <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                      <dt className="text-sm font-medium sm:col-span-1">Тип аккаунта</dt>
                      <dd className="sm:col-span-2 text-muted-foreground">{getAccountTypeLabel(profileData.typeOfAccount)}</dd>
                    </motion.div>
                    <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                      <dt className="text-sm font-medium sm:col-span-1">Верификация</dt>
                      <dd className="sm:col-span-2">
                        {getVerificationBadge(profileData.verificationStatus)}
                      </dd>
                    </motion.div>
                    <motion.div variants={item} className="pt-2">
                      <AnimatePresence mode="wait" initial={false}>
                        {isEditing ? (
                          <motion.div
                            key="edit-form"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ 
                              duration: 0.3,
                              ease: "easeInOut"
                            }}
                            className="space-y-4 overflow-hidden"
                          >
                            <motion.div 
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: 20, opacity: 0 }}
                              transition={{ delay: 0.1, duration: 0.2 }}
                              className="space-y-2"
                            >
                              <Label htmlFor="login">Логин</Label>
                              <div className="relative">
                                <Input
                                  id="login"
                                  value={editForm.login}
                                  onChange={handleLoginChange}
                                  className={`${editErrors.login ? "border-red-500" : ""} ${
                                    !isLoginAvailable ? "border-red-500" : isLoginAvailable ? "border-green-500" : ""
                                  }`}
                                />
                                {isCheckingLogin && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                  </div>
                                )}
                                {!isCheckingLogin && editForm.login && editForm.login !== profileData.login && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className={`h-4 w-4 rounded-full ${isLoginAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                  </div>
                                )}
                              </div>
                              <AnimatePresence>
                                {editErrors.login && (
                                  <motion.p 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-sm text-red-500"
                                  >
                                    {editErrors.login}
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            </motion.div>
                            <motion.div 
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: 20, opacity: 0 }}
                              transition={{ delay: 0.2, duration: 0.2 }}
                              className="space-y-2"
                            >
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                className={editErrors.email ? "border-red-500" : ""}
                              />
                              <AnimatePresence>
                                {editErrors.email && (
                                  <motion.p 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-sm text-red-500"
                                  >
                                    {editErrors.email}
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            </motion.div>
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: 0.3, duration: 0.2 }}
                              className="flex gap-2"
                            >
                              <Button 
                                onClick={handleEditSubmit}
                                disabled={!hasChanges() || !isLoginAvailable || isCheckingLogin}
                                className={`${
                                  !hasChanges() || !isLoginAvailable || isCheckingLogin
                                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed pointer-events-none select-none'
                                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                }`}
                              >
                                Сохранить
                              </Button>
                              <Button variant="outline" onClick={handleEditCancel}>Отмена</Button>
                            </motion.div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="edit-button"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Button onClick={() => setIsEditing(true)}>Редактировать информацию</Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.dl>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={card} className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Настройки уведомлений</CardTitle>
                  <CardDescription>Управление настройками оповещений</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-4"
                  >
                    <motion.div variants={item} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Новые заявки</h3>
                        <p className="text-sm text-muted-foreground">Уведомления о новых заявках</p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => handleToggleNotification('newRequests')}
                      >
                        {notifications.newRequests ? 'Включено' : 'Выключено'}
                      </Button>
                    </motion.div>
                    
                    <Separator />
                    
                    <motion.div variants={item} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Финансовые операции</h3>
                        <p className="text-sm text-muted-foreground">Уведомления о пополнениях и списаниях</p>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => handleToggleNotification('financialOperations')}
                      >
                        {notifications.financialOperations ? 'Включено' : 'Выключено'}
                      </Button>
                    </motion.div>
                    
                    <Separator />
                    
                    <motion.div variants={item} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Системные уведомления</h3>
                        <p className="text-sm text-muted-foreground">Уведомления о работе системы</p>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => handleToggleNotification('systemNotifications')}
                      >
                        {notifications.systemNotifications ? 'Включено' : 'Выключено'}
                      </Button>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="security">
          <Tabs value={securityTab} onValueChange={handleSecurityTabChange} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Общие
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Пароль
              </TabsTrigger>
              <TabsTrigger value="restrictions" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Ограничения
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Журнал
              </TabsTrigger>
              <TabsTrigger value="2fa" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                2FA
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >

                {/* Общие настройки безопасности */}
                <motion.div variants={card}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield size={20} />
                        Общие настройки безопасности
                      </CardTitle>
                      <CardDescription>
                        Основные настройки безопасности для вашего аккаунта
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="login-notifications">Уведомления о входе в систему</Label>
                          <p className="text-sm text-muted-foreground">
                            Получать уведомления при входе в аккаунт с нового устройства
                          </p>
                        </div>
                        <Switch
                          id="login-notifications"
                          checked={loginNotifications}
                          onCheckedChange={(checked) => handleSecuritySettingsChange({ loginNotifications: checked })}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="activity-logging">Расширенное журналирование</Label>
                          <p className="text-sm text-muted-foreground">
                            Записывать подробную информацию о всех действиях в аккаунте
                          </p>
                        </div>
                        <Switch
                          id="activity-logging"
                          checked={activityLogging.enabled}
                          onCheckedChange={(checked) => handleSecuritySettingsChange({ activityLogging: { enabled: checked, retentionPeriod: activityLogging.retentionPeriod, detailLevel: activityLogging.detailLevel } })}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="failed-login-limit">Ограничение неудачных попыток входа</Label>
                          <p className="text-sm text-muted-foreground">
                            Блокировать аккаунт после 5 неудачных попыток входа
                          </p>
                        </div>
                        <Switch
                          id="failed-login-limit"
                          checked={failedLoginLimit}
                          onCheckedChange={(checked) => handleSecuritySettingsChange({ failedLoginLimit: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Активные сессии */}
                <motion.div variants={card}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Активные сессии</CardTitle>
                      <CardDescription>
                        Управление активными сессиями вашего аккаунта
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={container} className="space-y-4">
                        {profileData.ipAddresses && profileData.ipAddresses.length > 0 ? (
                          profileData.ipAddresses.map((ip, index) => {
                            const browserInfo = getBrowserInfo(ip.deviceInfo);
                            const isCurrentSession = currentSession && 
                              ip.deviceInfo === currentSession.deviceInfo && 
                              ip.address === currentSession.address;
                            
                            return (
                              <motion.div key={index} variants={item} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    {getBrowserIcon(browserInfo.icon)}
                                    <p className="font-medium">{browserInfo.name}</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {ip.deviceInfo}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    IP: {ip.address} • {[
                                      ip.location.city,
                                      ip.location.region,
                                      ip.location.country
                                    ].filter(Boolean).join(', ') || 'Не определено'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(ip.lastUsed).toLocaleString()}
                                  </p>
                                </div>
                                {isCurrentSession ? (
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 text-xs bg-green-500/10 text-green-500 rounded-full">
                                      Текущая
                                    </span>
                                  </div>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleTerminateSession(index)}
                                  >
                                    Завершить
                                  </Button>
                                )}
                              </motion.div>
                            );
                          })
                        ) : (
                          <motion.div 
                            variants={item} 
                            className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/50"
                          >
                            <History className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">Нет активных сессий</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Здесь будут отображаться все устройства, с которых вы входили в аккаунт
                            </p>
                          </motion.div>
                        )}
                      </motion.div>

                      {profileData.ipAddresses && profileData.ipAddresses.length > 0 && (
                        <motion.div variants={item}>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={handleTerminateAllSessions}
                          >
                            Завершить все другие сессии
                          </Button>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* API ключи */}
                <motion.div variants={card}>
                  <Card>
                    <CardHeader>
                      <CardTitle>API ключи</CardTitle>
                      <CardDescription>
                        Управление API ключами для разработки и интеграций
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={item} className="space-y-2">
                        <Label>Персональный API ключ</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={profileData.apiKey || ""}
                            readOnly
                            className="font-mono"
                          />
                          <Button variant="outline" size="icon" onClick={handleCopyApiKey}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Для разработчиков и интеграций
                        </p>
                      </motion.div>
                      <motion.div variants={item}>
                        <Button variant="outline" className="w-full" onClick={handleResetApiKey}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Сбросить API ключ
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key size={20} />
                    Управление паролем
                  </CardTitle>
                  <CardDescription>
                    Изменение пароля и настройки срока его действия
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Текущий пароль</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className={fieldErrors.currentPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {fieldErrors.currentPassword && (
                        <p className="text-sm text-red-500">{fieldErrors.currentPassword}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Новый пароль</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setPasswordStrength(calculatePasswordStrength(e.target.value));
                          }}
                          className={fieldErrors.newPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {newPassword && (
                        <div className="space-y-2">
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                              style={{ width: `${(passwordStrength / 5) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className={passwordStrength > 0 ? "text-gray-600" : "text-gray-400"}>
                              {getPasswordStrengthText(passwordStrength)}
                            </span>
                            <span className="text-gray-400">
                              {passwordStrength}/5
                            </span>
                          </div>
                        </div>
                      )}
                      {fieldErrors.newPassword && (
                        <p className="text-sm text-red-500">{fieldErrors.newPassword}</p>
                      )}
                      </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Подтвердите новый пароль</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={fieldErrors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && (
                        <p className="text-sm text-red-500">{fieldErrors.confirmPassword}</p>
                      )}
                    </div>
                    
                    <Button onClick={handleSavePasswordChange}>Сохранить</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="password-expiration">Срок действия пароля</Label>
                        <p className="text-sm text-muted-foreground">
                          Требовать периодическое обновление пароля
                        </p>
                      </div>
                      <Switch
                        id="password-expiration"
                        checked={passwordExpiration}
                        onCheckedChange={setPasswordExpiration}
                      />
                    </div>
                    
                    {passwordExpiration && (
                      <div className="flex items-end gap-4">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="expiration-days">Срок действия (в днях)</Label>
                          <Input 
                            id="expiration-days" 
                            type="number" 
                            value={passwordExpirationDays}
                            onChange={(e) => setPasswordExpirationDays(e.target.value)}
                          />
                        </div>
                        <Button variant="outline" className="mb-0.5">Сохранить</Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm font-medium mb-2">Требования к паролю:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                      <li>Минимум 8 символов</li>
                      <li>Хотя бы одна заглавная буква</li>
                      <li>Хотя бы одна цифра</li>
                      <li>Хотя бы один специальный символ</li>
                      <li>Не должен совпадать с предыдущими 3 паролями</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="restrictions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock size={20} />
                    Ограничения доступа
                  </CardTitle>
                  <CardDescription>
                    Настройте дополнительные ограничения для защиты вашего аккаунта
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="ip-restrictions">IP-ограничения</Label>
                        <p className="text-sm text-muted-foreground">
                          Разрешить доступ только с определенных IP-адресов
                        </p>
                      </div>
                      <Switch
                        id="ip-restrictions"
                        checked={ipRestrictions}
                        onCheckedChange={async (checked) => {
                          try {
                            const response = await api.post('/user/security/ip-restrictions', {
                              enabled: checked,
                              allowedIps: ipAddresses.split('\n').filter(ip => ip.trim())
                            });
                            
                            // Обновляем состояние в любом случае
                            setIpRestrictions(checked);
                            
                            toast({
                              title: "Успешно",
                              description: "IP-ограничения обновлены",
                            });
                          } catch (error: any) {
                            // В случае ошибки возвращаем предыдущее состояние
                            setIpRestrictions(!checked);
                            toast({
                              title: "Ошибка",
                              description: error.response?.data?.message || 'Не удалось обновить IP-ограничения',
                              variant: "destructive",
                            });
                          }
                        }}
                      />
                    </div>
                    
                    {ipRestrictions && (
                      <div className="space-y-2">
                        <Label htmlFor="ip-addresses">Разрешенные IP-адреса (по одному на строку)</Label>
                        <p className="text-sm text-muted-foreground">
                          Введите IP-адреса или диапазоны (например, 192.168.1.1 или 192.168.1.0/24)
                        </p>
                        <div className="flex gap-4">
                          <textarea
                            id="ip-addresses"
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
                            placeholder="192.168.1.1&#10;10.0.0.0/24"
                            value={ipAddresses}
                            onChange={(e) => setIpAddresses(e.target.value)}
                          />
                          <div className="flex flex-col justify-end">
                            <Button onClick={handleSaveIpRestrictions}>Сохранить</Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Внимание: Неправильная настройка может заблокировать ваш доступ к аккаунту
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Ограничения по времени доступа</h3>
                    <p className="text-sm text-muted-foreground">
                      Установите временные ограничения для доступа к аккаунту
                    </p>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <Label>Разрешить доступ только в рабочее время</Label>
                        <p className="text-sm text-muted-foreground">
                          Пн-Пт, с 9:00 до 18:00
                        </p>
                      </div>
                      <Switch
                        checked={workDaysOnly}
                        onCheckedChange={async (checked) => {
                          try {
                            const response = await api.post('/user/security/time-restrictions', {
                              enabled: checked,
                              workDaysOnly: checked,
                              startTime: '09:00',
                              endTime: '18:00'
                            });
                            
                            // Обновляем состояние в любом случае
                            setWorkDaysOnly(checked);
                            
                            toast({
                              title: "Успешно",
                              description: "Временные ограничения обновлены",
                            });
                          } catch (error: any) {
                            // В случае ошибки возвращаем предыдущее состояние
                            setWorkDaysOnly(!checked);
                            toast({
                              title: "Ошибка",
                              description: error.response?.data?.message || 'Не удалось обновить временные ограничения',
                              variant: "destructive",
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Геоограничения</h3>
                    <p className="text-sm text-muted-foreground">
                      Ограничение доступа по географическому расположению
                    </p>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <Label>Разрешить доступ только из России</Label>
                        <p className="text-sm text-muted-foreground">
                          Блокировать доступ из других стран
                        </p>
                      </div>
                      <Switch
                        checked={geoRestrictions}
                        onCheckedChange={async (checked) => {
                          try {
                            const response = await api.post('/user/security/geo-restrictions', {
                              enabled: checked,
                              allowedCountries: ['RU']
                            });
                            
                            // Обновляем состояние в любом случае
                            setGeoRestrictions(checked);
                            
                            toast({
                              title: "Успешно",
                              description: "Геоограничения обновлены",
                            });
                          } catch (error: any) {
                            // В случае ошибки возвращаем предыдущее состояние
                            setGeoRestrictions(!checked);
                            toast({
                              title: "Ошибка",
                              description: error.response?.data?.message || 'Не удалось обновить геоограничения',
                              variant: "destructive",
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History size={20} />
                    Журналы безопасности
                  </CardTitle>
                  <CardDescription>
                    Просмотр журналов действий и событий безопасности
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-medium">Журнал активности</h3>
                      <Select value={eventFilter} onValueChange={setEventFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Фильтр событий" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все события</SelectItem>
                          <SelectItem value="Изменение пароля">Изменение пароля</SelectItem>
                          <SelectItem value="Вход в систему">Вход в систему</SelectItem>
                          <SelectItem value="Выход из системы">Выход из системы</SelectItem>
                          <SelectItem value="Изменение настроек">Изменение настроек</SelectItem>
                          <SelectItem value="API запрос">API запрос</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={exportToExcel}>
                        <FileText className="h-4 w-4 mr-2" />
                        Экспорт Excel
                      </Button>
                      <Button variant="outline" onClick={exportToCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Экспорт CSV
                      </Button>
                      <Button variant="outline" onClick={handleManualRefresh} disabled={isLogsLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLogsLoading ? 'animate-spin' : ''}`} />
                        Обновить
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Настройки журнала</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="space-y-0.5">
                            <Label htmlFor="activity-logging">Включить журнал</Label>
                            <p className="text-sm text-muted-foreground">
                              Запись событий в журнал
                            </p>
                          </div>
                          <Switch
                            id="activity-logging"
                            checked={activityLogSettings.enabled}
                            onCheckedChange={(checked) => handleActivityLogSettingsChange({ enabled: checked })}
                          />
                        </div>

                        <Separator orientation="vertical" className="h-12 mx-4" />

                        <div className="flex items-center gap-4 flex-1">
                          <div className="space-y-0.5">
                            <Label htmlFor="retention-period">Срок хранения</Label>
                            <p className="text-sm text-muted-foreground">
                              Период хранения записей
                            </p>
                          </div>
                          <Select
                            value={activityLogSettings.retentionPeriod.toString()}
                            onValueChange={(value) => handleActivityLogSettingsChange({ retentionPeriod: parseInt(value) })}
                            disabled={!activityLogSettings.enabled}
                          >
                            <SelectTrigger id="retention-period" className="w-[120px]">
                              <SelectValue placeholder="Выберите срок" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 дней</SelectItem>
                              <SelectItem value="60">60 дней</SelectItem>
                              <SelectItem value="90">90 дней</SelectItem>
                              <SelectItem value="180">180 дней</SelectItem>
                              <SelectItem value="365">365 дней</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Separator orientation="vertical" className="h-12 mx-4" />

                        <div className="flex items-center gap-4 flex-1">
                          <div className="space-y-0.5">
                            <Label htmlFor="detail-level">Уровень детализации</Label>
                            <p className="text-sm text-muted-foreground">
                              Детализация записей
                            </p>
                          </div>
                          <Select
                            value={activityLogSettings.detailLevel}
                            onValueChange={(value: 'basic' | 'standard' | 'detailed' | 'debug') => 
                              handleActivityLogSettingsChange({ detailLevel: value })}
                            disabled={!activityLogSettings.enabled}
                          >
                            <SelectTrigger id="detail-level" className="w-[120px]">
                              <SelectValue placeholder="Выберите уровень" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Базовый</SelectItem>
                              <SelectItem value="standard">Стандартный</SelectItem>
                              <SelectItem value="detailed">Подробный</SelectItem>
                              <SelectItem value="debug">Отладочный</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="rounded-md border overflow-hidden relative">
                    {isLogsLoading && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-6 w-6 animate-spin" />
                          <span>Загрузка...</span>
                        </div>
                      </div>
                    )}
                    {filteredLogs.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted border-b">
                            <th className="p-3 text-left">Время</th>
                            <th className="p-3 text-left">Событие</th>
                            <th className="p-3 text-left">IP-адрес</th>
                            <th className="p-3 text-left">Устройство</th>
                            <th className="p-3 text-left">Местоположение</th>
                            <th className="p-3 text-left">Статус</th>
                            <th className="p-3 text-left">Детали</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLogs.map((log, i) => (
                            <tr key={i} className="border-b last:border-b-0 hover:bg-muted/50">
                              <td className="p-3">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      {new Date(log.timestamp).toLocaleString()}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Полная дата: {new Date(log.timestamp).toLocaleString('ru-RU', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                      })}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  {log.event === 'Изменение пароля' && <Key className="h-4 w-4 text-blue-500" />}
                                  {log.event === 'Вход в систему' && <LogIn className="h-4 w-4 text-green-500" />}
                                  {log.event === 'Выход из системы' && <LogOut className="h-4 w-4 text-red-500" />}
                                  {log.event === 'Изменение настроек' && <Settings className="h-4 w-4 text-purple-500" />}
                                  {log.event === 'API запрос' && <Globe className="h-4 w-4 text-orange-500" />}
                                  {log.event}
                                </div>
                              </td>
                              <td className="p-3">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        {log.ip}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>IP-адрес: {log.ip}</p>
                                      <p>Тип: {log.ip.includes(':') ? 'IPv6' : 'IPv4'}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                              <td className="p-3">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      {(() => {
                                        const { browser, os } = getDeviceInfo(log.deviceInfo);
                                        const getBrowserIcon = (browserName: string) => {
                                          switch (browserName) {
                                            case 'Yandex Browser':
                                              return <div className="h-4 w-4"><YandexIcon /></div>;
                                            case 'Chrome':
                                              return <div className="h-4 w-4"><ChromeIcon /></div>;
                                            case 'Firefox':
                                              return <div className="h-4 w-4"><FirefoxIcon /></div>;
                                            case 'Safari':
                                              return <div className="h-4 w-4"><SafariIcon /></div>;
                                            case 'Edge':
                                              return <div className="h-4 w-4"><EdgeIcon /></div>;
                                            default:
                                              return <div className="h-4 w-4"><Globe /></div>;
                                          }
                                        };
                                        return (
                                          <div className="space-y-1">
                                            <div className="text-sm flex items-center gap-2">
                                              {getBrowserIcon(browser)}
                                              {browser}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                              {os === 'Windows' && <Monitor className="h-3 w-3" />}
                                              {os === 'macOS' && <Apple className="h-3 w-3" />}
                                              {os === 'Linux' && <Terminal className="h-3 w-3" />}
                                              {os}
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Полная информация об устройстве:</p>
                                      <p className="text-xs mt-1">{log.deviceInfo}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  {[
                                    log.location?.city,
                                    log.location?.region,
                                    log.location?.country
                                  ].filter(Boolean).join(', ') || 'Не определено'}
                                </div>
                              </td>
                              <td className="p-3">
                                <Badge variant={log.status === 'success' ? 'success' : log.status === 'error' ? 'destructive' : 'default'}>
                                  {log.status === 'success' ? 'Успешно' : log.status === 'error' ? 'Ошибка' : 'Информация'}
                                </Badge>
                              </td>
                              <td className="p-3">
                                {log.details && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      setSelectedLog(log);
                                      setIsDetailsOpen(true);
                                    }}
                                  >
                                    <Info className="h-4 w-4" />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <History className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Журнал активности пуст</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Здесь будут отображаться все действия, связанные с вашим аккаунтом. 
                          Включите журналирование, чтобы начать отслеживать активность.
                        </p>
                      </div>
                    )}
                  </div>

                  <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Детали события</DialogTitle>
                        <DialogDescription>
                          Подробная информация о выбранном событии из журнала активности
                        </DialogDescription>
                      </DialogHeader>
                      {selectedLog && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Основная информация</h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="text-muted-foreground">Время:</span> {new Date(selectedLog.timestamp).toLocaleString()}</p>
                              <p><span className="text-muted-foreground">Событие:</span> {selectedLog.event}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Статус:</span>
                                <Badge variant={selectedLog.status === 'success' ? 'success' : selectedLog.status === 'error' ? 'destructive' : 'default'}>
                                  {selectedLog.status === 'success' ? 'Успешно' : selectedLog.status === 'error' ? 'Ошибка' : 'Информация'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Технические детали</h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="text-muted-foreground">IP-адрес:</span> {selectedLog.ip}</p>
                              <p><span className="text-muted-foreground">Устройство:</span> {selectedLog.deviceInfo}</p>
                              <p><span className="text-muted-foreground">Местоположение:</span> {[
                                selectedLog.location?.city,
                                selectedLog.location?.region,
                                selectedLog.location?.country
                              ].filter(Boolean).join(', ') || 'Не определено'}</p>
                            </div>
                          </div>

                          {selectedLog.details && (
                            <div>
                              <h4 className="font-medium mb-2">Дополнительная информация</h4>
                              <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                                {JSON.stringify(selectedLog.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="2fa">
              <TwoFactorAuth />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Profile;                      

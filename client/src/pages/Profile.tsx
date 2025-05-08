import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User, Shield, Copy, RefreshCw, Globe, Settings, Key, Lock, History, FileText, FileCheck, Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { api, authApi, securityApi, type SecuritySettings } from '@/lib/api';
import { getBrowserInfo } from '@/lib/browser-utils';
import { ChromeIcon, FirefoxIcon, SafariIcon, EdgeIcon, YandexIcon } from '@/components/icons/browsers';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { Loader } from "@/components/ui/loader";
import TwoFactorAuth from '@/pages/TwoFactorAuth';
import { Switch } from "@/components/ui/switch";

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
  const [activityLogging, setActivityLogging] = useState(false);
  const [failedLoginLimit, setFailedLoginLimit] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

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
    navigator.clipboard.writeText(profileData?.apiKey || "");
    toast({
      title: "Успешно",
      description: "API ключ скопирован в буфер обмена",
    });
  };

  const handleResetApiKey = async () => {
    try {
      await api.post('/user/reset-api-key');
      await fetchProfile();
      toast({
        title: "Успешно",
        description: "API ключ успешно сброшен",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сбросить API ключ",
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
      const message = error.response?.data?.message || "Не удалось завершить все сессии";
      toast({
        title: "Ошибка",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleToggleNotification = async (type: keyof NonNullable<ProfileData['notifications']>) => {
    try {
      const currentValue = profileData?.notifications?.[type] ?? true;
      const newValue = !currentValue;
      
      const response = await api.patch('/user/notifications', {
        [type]: newValue
      });
      
      if (response.data.notifications) {
        setProfileData(prev => {
          if (!prev) return prev;
          const updatedData = {
            ...prev,
            notifications: response.data.notifications
          };
          return updatedData;
        });

        toast({
          title: "Успешно",
          description: "Настройки уведомлений обновлены",
        });
      } else {
        throw new Error('Не удалось получить обновленные настройки');
      }
    } catch (error) {
      console.error('Ошибка при обновлении настроек:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить настройки уведомлений",
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

  const handleSaveIpRestrictions = () => {
    // Implementation of handleSaveIpRestrictions
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
      const updatedSettings = {
        loginNotifications,
        activityLogging,
        failedLoginLimit,
        ...settings
      };
      
      await securityApi.updateSettings(updatedSettings);
      
      if (settings.loginNotifications !== undefined) {
        setLoginNotifications(settings.loginNotifications);
      }
      if (settings.activityLogging !== undefined) {
        setActivityLogging(settings.activityLogging);
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
                      <Button>Редактировать информацию</Button>
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
                        {profileData?.notifications?.newRequests === true ? 'Включено' : 'Выключено'}
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
                        {profileData?.notifications?.financialOperations === true ? 'Включено' : 'Выключено'}
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
                        {profileData?.notifications?.systemNotifications === true ? 'Включено' : 'Выключено'}
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
                          checked={activityLogging}
                          onCheckedChange={(checked) => handleSecuritySettingsChange({ activityLogging: checked })}
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
                        {profileData.ipAddresses.map((ip, index) => {
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
                        })}
                      </motion.div>

                      <motion.div variants={item}>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={handleTerminateAllSessions}
                        >
                          Завершить все другие сессии
                        </Button>
                      </motion.div>
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
                        onCheckedChange={setIpRestrictions}
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
                      <Switch />
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
                      <Switch />
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
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="flex items-center gap-2" onClick={handleExportLogs}>
                      <FileCheck size={16} />
                      Экспорт в Excel
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2" onClick={handleExportLogs}>
                      <FileText size={16} />
                      Экспорт в CSV
                    </Button>
                  </div>
                  
                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted border-b">
                          <th className="p-3 text-left">Время</th>
                          <th className="p-3 text-left">Событие</th>
                          <th className="p-3 text-left">IP-адрес</th>
                          <th className="p-3 text-left">Устройство</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            time: '02.05.2025 14:32:15',
                            event: 'Вход в систему',
                            ip: '192.168.1.1',
                            device: 'Chrome на Windows'
                          },
                          {
                            time: '02.05.2025 14:30:45',
                            event: 'Изменение пароля',
                            ip: '192.168.1.1',
                            device: 'Chrome на Windows'
                          },
                          {
                            time: '01.05.2025 09:15:22',
                            event: 'Вход в систему',
                            ip: '192.168.1.1',
                            device: 'Safari на iPhone'
                          },
                          {
                            time: '30.04.2025 18:45:11',
                            event: 'Неудачная попытка входа',
                            ip: '203.0.113.42',
                            device: 'Unknown'
                          },
                          {
                            time: '29.04.2025 12:33:09',
                            event: 'Изменение настроек безопасности',
                            ip: '192.168.1.2',
                            device: 'Firefox на MacOS'
                          }
                        ].map((log, i) => (
                          <tr key={i} className="border-b last:border-b-0 hover:bg-muted/50">
                            <td className="p-3">{log.time}</td>
                            <td className="p-3">{log.event}</td>
                            <td className="p-3">{log.ip}</td>
                            <td className="p-3">{log.device}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button variant="outline">Показать больше</Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-base font-medium mb-2">Настройки журналирования</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Настройте параметры хранения журналов безопасности
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Срок хранения журналов</Label>
                        <select 
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        >
                          <option value="30">30 дней</option>
                          <option value="90">90 дней</option>
                          <option value="180">180 дней</option>
                          <option value="365">1 год</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Уровень детализации</Label>
                        <select 
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        >
                          <option value="basic">Базовый</option>
                          <option value="standard">Стандартный</option>
                          <option value="detailed">Детальный</option>
                          <option value="debug">Отладочный</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <Button>Сохранить настройки</Button>
                    </div>
                  </div>
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

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Smartphone, Mail, Key, Copy, Check, AlertCircle, Download, Clock, RefreshCw, Globe, Network } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useNavigate, Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';

// Функция для генерации секретного ключа
const generateSecretKey = () => {
  const randomBytes = CryptoJS.lib.WordArray.random(20);
  return randomBytes.toString(CryptoJS.enc.Base64);
};

// Функция для генерации резервных кодов
const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    // Генерируем 16 случайных байт и конвертируем в hex
    const randomBytes = CryptoJS.lib.WordArray.random(16);
    const hex = randomBytes.toString(CryptoJS.enc.Hex);
    // Форматируем код в группы по 4 символа
    const formattedCode = hex.match(/.{1,4}/g)?.join('-').toUpperCase() || '';
    codes.push(formattedCode);
  }
  return codes;
};

interface LoginHistory {
  id: string;
  date: string;
  ip: string;
  location: string;
  device: string;
  browser: string;
  os: string;
  isCurrent: boolean;
  deviceInfo?: string;
}

// Функция для определения браузера из User-Agent
const getBrowserInfo = (userAgent: string): { name: string; version: string } => {
  // Проверяем Яндекс Браузер первым
  if (userAgent.includes('YaBrowser')) {
    const versionMatch = userAgent.match(/YaBrowser\/(\d+\.\d+\.\d+\.\d+)/);
    const version = versionMatch ? versionMatch[1] : 'неизвестная версия';
    return { name: 'Яндекс Браузер', version };
  }

  // Проверяем остальные браузеры
  const browsers = {
    'Firefox': 'Mozilla Firefox',
    'Safari': 'Safari',
    'Edge': 'Microsoft Edge',
    'Opera': 'Opera',
    'MSIE': 'Internet Explorer',
    'Trident': 'Internet Explorer',
    'Chrome': 'Google Chrome'
  };

  for (const [key, name] of Object.entries(browsers)) {
    if (userAgent.includes(key)) {
      const versionMatch = userAgent.match(new RegExp(`${key}/(\\d+(\\.\\d+)*)`));
      const version = versionMatch ? versionMatch[1] : 'неизвестная версия';
      return { name, version };
    }
  }

  return { name: 'Неизвестный браузер', version: 'неизвестная версия' };
};

// Функция для определения операционной системы
const getOSInfo = (userAgent: string): string => {
  const osMap: { [key: string]: string } = {
    'Windows NT 10.0': 'Windows 10',
    'Windows NT 6.3': 'Windows 8.1',
    'Windows NT 6.2': 'Windows 8',
    'Windows NT 6.1': 'Windows 7',
    'Mac OS X': 'macOS',
    'Linux': 'Linux',
    'Android': 'Android',
    'iOS': 'iOS'
  };

  for (const [key, value] of Object.entries(osMap)) {
    if (userAgent.includes(key)) {
      return value;
    }
  }

  return 'Неизвестная ОС';
};

const TwoFactorAuth: React.FC = () => {
  const { user } = useAuth();
  const [isAppAuthEnabled, setIsAppAuthEnabled] = useState(false);
  const [isSmsAuthEnabled, setIsSmsAuthEnabled] = useState(true);
  const [isEmailAuthEnabled, setIsEmailAuthEnabled] = useState(false);
  const [isBackupCodesGenerated, setIsBackupCodesGenerated] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [disableVerificationCode, setDisableVerificationCode] = useState(['', '', '', '', '', '']);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);
  const [isQrCodeLoading, setIsQrCodeLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const check2FAStatus = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/auth/2fa/status');
        
        const { enabled, hasSecret, backupCodes } = response.data;
        setIsAppAuthEnabled(enabled);
        if (hasSecret) {
          setSecretKey(hasSecret);
        }
        
        // Проверяем наличие резервных кодов
        if (backupCodes && Array.isArray(backupCodes) && backupCodes.length > 0) {
          setBackupCodes(backupCodes);
          setIsBackupCodesGenerated(true);
        } else {
          setBackupCodes([]);
          setIsBackupCodesGenerated(false);
        }
      } catch (error) {
        console.error('Ошибка при проверке статуса 2FA:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить статус 2FA",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    check2FAStatus();
  }, []);

  useEffect(() => {
    const fetchLoginHistory = async () => {
      try {
        setIsHistoryLoading(true);
        const response = await api.get('/auth/login-history');
        setLoginHistory(response.data);
      } catch (error) {
        console.error('Ошибка при получении истории входов:', error);
        // Не показываем ошибку пользователю, так как это может быть просто отсутствие истории
        setLoginHistory([]);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchLoginHistory();
  }, []);

  const handleToggleAppAuth = async () => {
    try {
      if (!isAppAuthEnabled) {
        setIsSettingUp2FA(true);
        setIsQrCodeLoading(true);
        setQrCodeDataUrl(''); // Очищаем предыдущий QR-код
        
        // Запрашиваем секретный ключ с сервера
        const response = await api.post('/auth/2fa/generate');
        const { secret, login } = response.data;
        
        setSecretKey(secret);
        
        // Создаем URI для QR-кода в формате Google Authenticator
        const otpauth = `otpauth://totp/MMR-PAY:${login}?secret=${secret}&issuer=MMR-PAY&algorithm=SHA1&digits=6&period=30`;
        
        // Генерируем QR-код
        try {
          const url = await new Promise<string>((resolve, reject) => {
            QRCode.toDataURL(otpauth, {
              errorCorrectionLevel: 'H',
              margin: 2,
              width: 300,
              color: {
                dark: '#000000',
                light: '#ffffff'
              }
            }, (err, url) => {
              if (err) reject(err);
              else resolve(url);
            });
          });
          
          setQrCodeDataUrl(url);
          setIsQrCodeLoading(false);
          
          toast({
            title: "Аутентификатор приложения",
            description: "Отсканируйте QR-код в приложении и введите код для подтверждения",
          });
        } catch (err) {
          toast({
            title: "Ошибка",
            description: "Не удалось сгенерировать QR-код",
            variant: "destructive",
          });
          setIsQrCodeLoading(false);
          setIsSettingUp2FA(false);
        }
      } else {
        setIsDisableDialogOpen(true);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.message || "Не удалось настроить 2FA",
        variant: "destructive",
      });
      setIsQrCodeLoading(false);
      setIsSettingUp2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      await api.post('/auth/2fa/disable', { token: disableVerificationCode.join('') });
      
      toast({
        title: "Аутентификатор приложения отключен",
        description: "Для входа больше не требуется код из приложения",
      });
      
      setIsAppAuthEnabled(false);
      setSecretKey('');
      setQrCodeDataUrl('');
      setIsDisableDialogOpen(false);
      setDisableVerificationCode(['', '', '', '', '', '']);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.message || "Не удалось отключить 2FA",
        variant: "destructive",
      });
    }
  };

  const handleToggleSmsAuth = () => {
    if (!isSmsAuthEnabled) {
      toast({
        title: "SMS-аутентификация включена",
        description: "Для входа теперь требуется код из SMS",
      });
    } else {
      toast({
        title: "SMS-аутентификация отключена",
        description: "Для входа больше не требуется код из SMS",
      });
    }
    setIsSmsAuthEnabled(!isSmsAuthEnabled);
  };

  const handleToggleEmailAuth = () => {
    if (!isEmailAuthEnabled) {
      toast({
        title: "Email-аутентификация включена",
        description: "Для входа теперь требуется код из электронной почты",
      });
    } else {
      toast({
        title: "Email-аутентификация отключена",
        description: "Для входа больше не требуется код из электронной почты",
      });
    }
    setIsEmailAuthEnabled(!isEmailAuthEnabled);
  };

  const handleCodeChange = (index: number, value: string) => {
    // Очищаем значение от всего, кроме цифр
    value = value.replace(/[^0-9]/g, '');
    
    if (value.length > 1) {
      value = value.slice(0, 1);
    }
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    
    // Проверяем, заполнены ли все поля
    const isComplete = newCode.every(digit => digit !== '');
    if (isComplete) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6 && /^\d{6}$/.test(fullCode)) {
        // Используем newCode вместо verificationCode
        handleVerifyCode(newCode);
      }
    }

    setVerificationCode(newCode);

    // Автоматический переход к следующему полю
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (codeArray: string[] = verificationCode) => {
    const code = codeArray.join('');

    // Проверяем наличие секретного ключа
    if (!secretKey || typeof secretKey !== 'string') {
      toast({
        title: "Ошибка",
        description: "Сначала отсканируйте QR-код",
        variant: "destructive",
      });
      return;
    }

    // Проверяем длину кода
    if (code.length !== 6) {
      toast({
        title: "Неверный код",
        description: "Код должен содержать 6 цифр",
        variant: "destructive",
      });
      return;
    }

    // Проверяем, что код состоит только из цифр
    if (!/^\d{6}$/.test(code)) {
      toast({
        title: "Неверный код",
        description: "Код должен содержать только цифры",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await api.post('/auth/2fa/enable', { 
        token: code,
        secret: secretKey 
      });
      
      const { backupCodes } = response.data;
      setNewBackupCodes(backupCodes);
      setBackupCodes(backupCodes);
      setIsBackupCodesGenerated(true);
      setShowBackupCodesModal(true);
      
      toast({
        title: "Код подтвержден",
        description: "Аутентификация приложения успешно настроена",
      });
      setIsAppAuthEnabled(true);
      setIsSettingUp2FA(false);
      setVerificationCode(['', '', '', '', '', '']);
    } catch (error) {
      toast({
        title: "Неверный код",
        description: error.response?.data?.message || "Введенный код недействителен",
        variant: "destructive",
      });
    }
  };

  const handleDownloadBackupCodes = () => {
    const codesText = newBackupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mmr-pay-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleCopyBackupCodes = () => {
    const codesText = newBackupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    toast({
      title: "Коды скопированы",
      description: "Резервные коды скопированы в буфер обмена",
    });
  };

  const handleGenerateBackupCodes = async () => {
    try {
      console.log('Начинаем генерацию резервных кодов...');
      const response = await api.post('/auth/2fa/generate-backup');
      console.log('Ответ сервера:', response.data);
      
      const newCodes = response.data.backupCodes;
      if (!newCodes || !Array.isArray(newCodes)) {
        throw new Error('Неверный формат ответа от сервера');
      }
      
      console.log('Получены новые коды:', newCodes);
      setBackupCodes(newCodes);
      setNewBackupCodes(newCodes);
      setIsBackupCodesGenerated(true);
      setShowBackupCodesModal(true);
      
      toast({
        title: "Резервные коды сгенерированы",
        description: "Сохраните их в надежном месте. Каждый код можно использовать только один раз.",
      });
    } catch (error) {
      console.error('Ошибка при генерации резервных кодов:', error);
      toast({
        title: "Ошибка",
        description: error.response?.data?.message || "Не удалось сгенерировать резервные коды",
        variant: "destructive",
      });
    }
  };

  const handleLogoutAll = async () => {
    try {
      await api.post('/auth/logout-all');
      toast({
        title: "Выход выполнен",
        description: "Вы вышли из всех устройств",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из всех устройств",
        variant: "destructive",
      });
    }
  };

  const handleRefreshHistory = async () => {
    if (isRefreshing) return; // Предотвращаем повторные нажатия
    
    try {
      setIsRefreshing(true);
      const response = await api.get('/auth/login-history');
      setLoginHistory(response.data);
    } catch (error) {
      console.error('Ошибка при обновлении истории входов:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить историю входов",
        variant: "destructive",
      });
    } finally {
      // Добавляем небольшую задержку для плавности
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Двухфакторная аутентификация</h1>
        <p className="text-muted-foreground">
          Настройте дополнительный уровень безопасности для вашего аккаунта
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Повысьте безопасность своего аккаунта</AlertTitle>
        <AlertDescription>
          Двухфакторная аутентификация добавляет дополнительный слой защиты к вашему аккаунту.
          Рекомендуем настроить как минимум один метод 2FA.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="methods" className="space-y-4">
        <TabsList>
          <TabsTrigger value="methods">Методы аутентификации</TabsTrigger>
          <TabsTrigger value="backup">Резервные коды</TabsTrigger>
          <TabsTrigger value="history">История входов</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="sync">
          <TabsContent value="methods" key="methods">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone size={20} />
                      Приложение-аутентификатор
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Используйте Google Authenticator, Microsoft Authenticator или другое приложение
                    </CardDescription>
                  </div>
                  {!isLoading && (
                    <Switch checked={isAppAuthEnabled} onCheckedChange={handleToggleAppAuth} />
                  )}
                </CardHeader>
                {isLoading ? (
                  <CardContent>
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </CardContent>
                ) : isAppAuthEnabled && !isSettingUp2FA ? (
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <Check size={20} />
                        <span className="font-medium">Двухфакторная аутентификация активна</span>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-md">
                        <p className="text-sm font-medium mb-2">Информация о вашей 2FA:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Последнее обновление: {new Date().toLocaleDateString()}</li>
                          <li>• Метод: Google Authenticator</li>
                          <li>• Статус: Активен</li>
                        </ul>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => setIsDisableDialogOpen(true)}>
                          Отключить 2FA
                        </Button>
                        <Button variant="outline" onClick={handleGenerateBackupCodes}>
                          Сгенерировать резервные коды
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                ) : isSettingUp2FA && (
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-6 items-center justify-center sm:items-start">
                      <div className="flex flex-col items-center">
                        <div className="border rounded-md p-2 bg-white w-40 h-40 flex items-center justify-center">
                          {isQrCodeLoading ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <div className="absolute w-32 h-32 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                              <div className="absolute w-24 h-24 border-4 border-primary/30 border-t-primary rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                              <div className="absolute w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                            </div>
                          ) : qrCodeDataUrl ? (
                            <img 
                              src={qrCodeDataUrl} 
                              alt="QR код для настройки аутентификатора" 
                              className="w-full h-full" 
                            />
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm text-center text-muted-foreground">
                          {isQrCodeLoading ? "Подготовка QR-кода..." : "Отсканируйте этот QR-код в приложении"}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-3 w-full">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Код подтверждения</label>
                          <div className="flex gap-2 justify-center">
                            {verificationCode.map((digit, index) => (
                              <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-12 text-center text-lg font-mono border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Введите код из приложения, чтобы завершить настройку
                          </p>
                        </div>
                        
                        <div className="space-y-2 mt-2">
                          <label className="text-sm font-medium">Ключ для ручной настройки</label>
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            <code className="font-mono text-sm">{secretKey}</code>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => {
                                navigator.clipboard.writeText(secretKey);
                                toast({ title: "Ключ скопирован" });
                              }}
                            >
                              <Copy size={14} />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Используйте этот ключ, если не можете отсканировать QR-код
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone size={20} />
                      SMS-аутентификация
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Получайте коды подтверждения через SMS
                    </CardDescription>
                  </div>
                  <Switch checked={isSmsAuthEnabled} onCheckedChange={handleToggleSmsAuth} />
                </CardHeader>
                {isSmsAuthEnabled && (
                  <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge variant="outline">+7 (9**) ***-45-67</Badge>
                      <Button variant="outline" size="sm">Изменить</Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Коды будут отправляться на указанный номер телефона при каждой попытке входа
                    </p>
                  </CardContent>
                )}
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mail size={20} />
                      Email-аутентификация
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Получайте коды подтверждения на электронную почту
                    </CardDescription>
                  </div>
                  <Switch checked={isEmailAuthEnabled} onCheckedChange={handleToggleEmailAuth} />
                </CardHeader>
                {isEmailAuthEnabled && (
                  <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge variant="outline">{user?.email}</Badge>
                      <Button variant="outline" size="sm">Изменить</Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Коды будут отправляться на указанный email при каждой попытке входа
                    </p>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="backup" key="backup">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key size={20} />
                    Резервные коды доступа
                  </CardTitle>
                  <CardDescription>
                    Используйте эти коды для входа, если основные методы аутентификации недоступны
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isBackupCodesGenerated && backupCodes.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="p-2 bg-muted rounded-md text-center font-mono">
                            {code}
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button variant="outline" onClick={handleCopyBackupCodes}>
                          <Copy size={16} className="mr-2" />
                          Скопировать коды
                        </Button>
                        <Button variant="outline" onClick={handleGenerateBackupCodes}>
                          Сгенерировать новые
                        </Button>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-md mt-4">
                        <p className="text-sm font-medium mb-1">Важно:</p>
                        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                          <li>Сохраните эти коды в надежном месте</li>
                          <li>Каждый код можно использовать только один раз</li>
                          <li>При генерации новых кодов старые становятся недействительными</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">
                        У вас еще нет сгенерированных резервных кодов
                      </p>
                      <Button onClick={handleGenerateBackupCodes}>
                        Сгенерировать коды
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="history" key="history">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>История входов</CardTitle>
                      <CardDescription className="mt-2">
                        Недавние успешные входы в вашу учетную запись
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRefreshHistory}
                      disabled={isRefreshing}
                      className="flex items-center gap-2 min-w-[100px]"
                    >
                      {isRefreshing ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          <span>Обновление...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                          <span>Обновить</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isHistoryLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : loginHistory.length > 0 ? (
                      <div className="border rounded-md divide-y">
                        {isRefreshing ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                              <span className="text-sm text-muted-foreground">Обновление истории...</span>
                            </div>
                          </div>
                        ) : (
                          loginHistory.map((session) => {
                            const browserInfo = session.deviceInfo ? getBrowserInfo(session.deviceInfo) : { name: session.browser, version: '' };
                            const osInfo = session.deviceInfo ? getOSInfo(session.deviceInfo) : session.os;
                            
                            return (
                              <div key={session.id} className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                <div className="flex flex-col gap-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="flex flex-col">
                                        <span className="font-medium">{browserInfo.name}</span>
                                        {browserInfo.version && (
                                          <span className="text-sm text-muted-foreground">Версия {browserInfo.version}</span>
                                        )}
                                      </div>
                                      <div className="h-4 w-px bg-border" />
                                      <div className="flex flex-col">
                                        <span className="font-medium">{osInfo}</span>
                                      </div>
                                    </div>
                                    {session.isCurrent && (
                                      <Badge variant="success" className="text-xs">
                                        <Check size={12} className="mr-1" /> Текущая сессия
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <Globe className="h-4 w-4" />
                                      <span>{session.location || 'Неизвестное местоположение'}</span>
                                    </div>
                                    <div className="h-4 w-px bg-border" />
                                    <div className="flex items-center gap-2">
                                      <Network className="h-4 w-4" />
                                      <span>IP: {session.ip}</span>
                                    </div>
                                    <div className="h-4 w-px bg-border" />
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      <span>
                                        {new Date(session.date).toLocaleString('ru-RU', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Clock className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-medium">История входов пуста</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                              Здесь будет отображаться история ваших входов в аккаунт. 
                              После первого входа вы увидите информацию о времени, устройстве и местоположении.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      Если вы не узнаете какой-либо из этих сеансов, измените пароль и проверьте{' '}
                      <Link 
                        to="/profile/security/general" 
                        className="text-primary hover:underline"
                      >
                        активные сессии
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      <Dialog open={isDisableDialogOpen} onOpenChange={setIsDisableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отключение двухфакторной аутентификации</DialogTitle>
            <DialogDescription>
              Для отключения 2FA введите код из приложения-аутентификатора
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Код подтверждения</label>
              <div className="flex gap-2 justify-center">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={disableVerificationCode[index] || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      const newCode = [...disableVerificationCode];
                      newCode[index] = value;
                      setDisableVerificationCode(newCode);
                    }}
                    className="w-12 h-12 text-center text-lg font-mono border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisableDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleDisable2FA}>
              Отключить 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBackupCodesModal} onOpenChange={setShowBackupCodesModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Резервные коды доступа</DialogTitle>
            <DialogDescription>
              Сохраните эти коды в надежном месте. Они понадобятся для входа, если вы потеряете доступ к приложению-аутентификатору.
              Каждый код можно использовать только один раз.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
              {newBackupCodes.map((code, index) => (
                <div key={index} className="font-mono text-sm text-center p-2 bg-background rounded">
                  {code}
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleDownloadBackupCodes} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Скачать коды
              </Button>
              <Button variant="outline" onClick={handleCopyBackupCodes} className="flex-1">
                <Copy className="mr-2 h-4 w-4" />
                Скопировать коды
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowBackupCodesModal(false)}>
              Я сохранил коды
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TwoFactorAuth;

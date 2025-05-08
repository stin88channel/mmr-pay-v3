
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Shield, Smartphone, Mail, Key, Copy, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const TwoFactorAuth: React.FC = () => {
  const [isAppAuthEnabled, setIsAppAuthEnabled] = useState(false);
  const [isSmsAuthEnabled, setIsSmsAuthEnabled] = useState(true);
  const [isEmailAuthEnabled, setIsEmailAuthEnabled] = useState(false);
  const [isBackupCodesGenerated, setIsBackupCodesGenerated] = useState(true);
  const [verificationCode, setVerificationCode] = useState('');
  const { toast } = useToast();

  // Generate a mock QR code data URL
  const qrCodeDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkAQMAAAAjexcCAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAAlwSFlzAAAOxAAADsQBlSsOGwAAADZJREFUSIntzrEJACAMBdE/3X8FO1EQbCKksA8uOXj9RJGkzVGXvyr569qzuTRzaebSzKWZy70L+5A8YZkZ8+0AAAAASUVORK5CYII=';

  // Mock backup codes
  const backupCodes = [
    '1234-5678-9012',
    '2345-6789-0123',
    '3456-7890-1234',
    '4567-8901-2345',
    '5678-9012-3456',
    '6789-0123-4567',
    '7890-1234-5678',
    '8901-2345-6789',
  ];

  const handleToggleAppAuth = () => {
    if (!isAppAuthEnabled) {
      // When enabling app auth, we would normally show QR code setup
      toast({
        title: "Аутентификатор приложения",
        description: "Отсканируйте QR-код в приложении и введите код для подтверждения",
      });
    } else {
      // When disabling, we would normally ask for confirmation
      toast({
        title: "Аутентификатор приложения отключен",
        description: "Для входа больше не требуется код из приложения",
      });
    }
    setIsAppAuthEnabled(!isAppAuthEnabled);
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

  const handleVerifyCode = () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Неверный код",
        description: "Пожалуйста, введите 6-значный код из приложения",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Код подтвержден",
      description: "Аутентификация приложения успешно настроена",
    });
    setVerificationCode('');
  };

  const handleGenerateBackupCodes = () => {
    toast({
      title: "Резервные коды сгенерированы",
      description: "Сохраните их в надежном месте",
    });
    setIsBackupCodesGenerated(true);
  };

  const handleCopyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    toast({
      title: "Коды скопированы",
      description: "Резервные коды скопированы в буфер обмена",
    });
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

        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone size={20} />
                  Приложение-аутентификатор
                </CardTitle>
                <CardDescription>
                  Используйте Google Authenticator, Microsoft Authenticator или другое приложение
                </CardDescription>
              </div>
              <Switch checked={isAppAuthEnabled} onCheckedChange={handleToggleAppAuth} />
            </CardHeader>
            {isAppAuthEnabled && (
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-6 items-center justify-center sm:items-start">
                  <div className="flex flex-col items-center">
                    <div className="border rounded-md p-2 bg-white">
                      <img 
                        src={qrCodeDataUrl} 
                        alt="QR код для настройки аутентификатора" 
                        className="w-40 h-40" 
                      />
                    </div>
                    <p className="mt-2 text-sm text-center text-muted-foreground">
                      Отсканируйте этот QR-код в приложении
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3 w-full">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Код подтверждения</label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="6-значный код" 
                          maxLength={6} 
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                        />
                        <Button onClick={handleVerifyCode}>Проверить</Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Введите код из приложения, чтобы завершить настройку
                      </p>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      <label className="text-sm font-medium">Ключ для ручной настройки</label>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <code className="font-mono text-sm">JBSWY3DPEHPK3PXP</code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => {
                            navigator.clipboard.writeText('JBSWY3DPEHPK3PXP');
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
                <CardDescription>
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
                <CardDescription>
                  Получайте коды подтверждения на электронную почту
                </CardDescription>
              </div>
              <Switch checked={isEmailAuthEnabled} onCheckedChange={handleToggleEmailAuth} />
            </CardHeader>
            {isEmailAuthEnabled && (
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge variant="outline">i***@example.com</Badge>
                  <Button variant="outline" size="sm">Изменить</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Коды будут отправляться на указанный email при каждой попытке входа
                </p>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="backup">
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
              {isBackupCodesGenerated ? (
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
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>История входов</CardTitle>
              <CardDescription>
                Недавние успешные входы в вашу учетную запись
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md">
                  {[
                    {
                      date: '02.05.2025, 14:32',
                      ip: '192.168.1.1',
                      location: 'Москва, Россия',
                      device: 'Chrome на Windows',
                      current: true
                    },
                    {
                      date: '01.05.2025, 09:15',
                      ip: '192.168.1.1',
                      location: 'Москва, Россия',
                      device: 'Safari на iPhone',
                      current: false
                    },
                    {
                      date: '29.04.2025, 18:47',
                      ip: '192.168.1.2',
                      location: 'Санкт-Петербург, Россия',
                      device: 'Firefox на MacOS',
                      current: false
                    }
                  ].map((session, i) => (
                    <div key={i} className="border-b last:border-b-0 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{session.device}</p>
                            {session.current && (
                              <Badge variant="success" className="text-xs">
                                <Check size={12} className="mr-1" /> Текущая сессия
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {session.location} • IP: {session.ip}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {session.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Если вы не узнаете какой-либо из этих сеансов, измените пароль и выйдите из всех устройств.
                </p>
                
                <div className="flex justify-end">
                  <Button variant="destructive">
                    Выйти на всех устройствах
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TwoFactorAuth;

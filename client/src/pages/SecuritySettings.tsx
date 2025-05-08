
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Shield, Key, Lock, UserRound, AlertTriangle, History, FileText, FileCheck } from 'lucide-react';

const SecuritySettings: React.FC = () => {
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [ipRestrictions, setIpRestrictions] = useState(false);
  const [activityLogging, setActivityLogging] = useState(true);
  const [passwordExpiration, setPasswordExpiration] = useState(false);
  const [passwordExpirationDays, setPasswordExpirationDays] = useState("90");
  const [failedLoginLimit, setFailedLoginLimit] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ipAddresses, setIpAddresses] = useState("");
  
  const { toast } = useToast();

  const handleSavePasswordChange = () => {
    if (!currentPassword) {
      toast({
        title: "Ошибка изменения пароля",
        description: "Введите текущий пароль",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: "Ошибка изменения пароля",
        description: "Новый пароль должен содержать не менее 8 символов",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Ошибка изменения пароля",
        description: "Пароли не совпадают",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Пароль успешно изменен",
      description: "Ваш пароль был обновлен",
    });
    
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSaveIpRestrictions = () => {
    toast({
      title: "IP-ограничения сохранены",
      description: "Настройки IP-ограничений были обновлены",
    });
  };

  const handleLogout = () => {
    toast({
      title: "Выход выполнен",
      description: "Вы вышли из всех устройств",
    });
  };

  const handleExportLogs = () => {
    toast({
      title: "Журнал безопасности экспортирован",
      description: "Файл журнала успешно скачан",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Настройки безопасности</h1>
        <p className="text-muted-foreground">
          Управляйте параметрами безопасности вашей учетной записи
        </p>
      </div>
      
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Эти настройки влияют на безопасность вашего аккаунта. Меняйте их с осторожностью.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Общие</TabsTrigger>
          <TabsTrigger value="password">Пароль</TabsTrigger>
          <TabsTrigger value="restrictions">Ограничения</TabsTrigger>
          <TabsTrigger value="logs">Журналы активности</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
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
                  onCheckedChange={setLoginNotifications}
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
                  onCheckedChange={setActivityLogging}
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
                  onCheckedChange={setFailedLoginLimit}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="linked-devices">Подключенные устройства</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  В настоящее время у вас есть активные сессии на 3 устройствах
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Выйти на всех устройствах</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Выйти на всех устройствах?</DialogTitle>
                      <DialogDescription>
                        Это действие завершит все активные сессии на всех устройствах, кроме текущего.
                        Вам потребуется заново войти на этих устройствах.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Отмена</Button>
                      <Button variant="destructive" onClick={handleLogout}>Выйти</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
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
                  <Label htmlFor="current-password">Текущий пароль</Label>
                  <Input 
                    id="current-password" 
                    type="password"
                    placeholder="••••••••" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">Новый пароль</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Подтвердите новый пароль</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                
                <Button onClick={handleSavePasswordChange}>Изменить пароль</Button>
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

        <TabsContent value="restrictions" className="space-y-4">
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

        <TabsContent value="logs" className="space-y-4">
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
                  <FileText size={16} />
                  Экспорт в CSV
                </Button>
                <Button variant="outline" className="flex items-center gap-2" onClick={handleExportLogs}>
                  <FileCheck size={16} />
                  Экспорт в PDF
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
      </Tabs>
    </div>
  );
};

export default SecuritySettings;

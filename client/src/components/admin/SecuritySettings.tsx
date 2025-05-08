import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const SecuritySettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Аудит и логирование
    loginLogging: true,
    dataChangeLogging: true,
    apiAccessLogging: true,
    
    // Настройки паролей
    minPasswordLength: 8,
    passwordExpiryDays: 90,
    maxLoginAttempts: 5,
    lockoutTimeMinutes: 30,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    
    // 2FA
    requireAdmin2FA: true,
    user2FA: 'optional', // 'required', 'optional', 'disabled'
  });

  const handleSave = () => {
    // TODO: Отправка настроек на сервер
    toast({
      title: "Успешно",
      description: "Настройки безопасности сохранены",
    });
  };

  const handleSwitchChange = (key: string, value: boolean) => {
    setSettings({ ...settings, [key]: value });
    toast({
      title: value ? "Включено" : "Отключено",
      description: getSwitchDescription(key, value),
    });
  };

  const getSwitchDescription = (key: string, value: boolean): string => {
    const descriptions: Record<string, { on: string; off: string }> = {
      loginLogging: {
        on: "Логирование входов в систему включено",
        off: "Логирование входов в систему отключено"
      },
      dataChangeLogging: {
        on: "Логирование изменений данных включено",
        off: "Логирование изменений данных отключено"
      },
      apiAccessLogging: {
        on: "Логирование доступа к API включено",
        off: "Логирование доступа к API отключено"
      },
      requireUppercase: {
        on: "Требование заглавных букв в пароле включено",
        off: "Требование заглавных букв в пароле отключено"
      },
      requireNumbers: {
        on: "Требование цифр в пароле включено",
        off: "Требование цифр в пароле отключено"
      },
      requireSpecialChars: {
        on: "Требование специальных символов в пароле включено",
        off: "Требование специальных символов в пароле отключено"
      },
      requireAdmin2FA: {
        on: "Обязательная 2FA для администраторов включена",
        off: "Обязательная 2FA для администраторов отключена"
      }
    };

    return value ? descriptions[key]?.on : descriptions[key]?.off;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Настройки безопасности</h2>
        </div>
        <Button onClick={handleSave}>Сохранить изменения</Button>
      </div>

      {/* Аудит и логирование */}
      <Card>
        <CardHeader>
          <CardTitle>Аудит и логирование</CardTitle>
          <CardDescription>Настройка журнала действий пользователей</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Логирование входов в систему</Label>
              <p className="text-sm text-muted-foreground">
                Запись всех попыток входа в систему
              </p>
            </div>
            <Switch
              checked={settings.loginLogging}
              onCheckedChange={(checked) => handleSwitchChange('loginLogging', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Логирование изменений данных</Label>
              <p className="text-sm text-muted-foreground">
                Запись всех изменений данных пользователями
              </p>
            </div>
            <Switch
              checked={settings.dataChangeLogging}
              onCheckedChange={(checked) => handleSwitchChange('dataChangeLogging', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Логирование доступа к API</Label>
              <p className="text-sm text-muted-foreground">
                Запись всех запросов к API системы
              </p>
            </div>
            <Switch
              checked={settings.apiAccessLogging}
              onCheckedChange={(checked) => handleSwitchChange('apiAccessLogging', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Настройки паролей */}
      <Card>
        <CardHeader>
          <CardTitle>Настройки паролей</CardTitle>
          <CardDescription>Требования к паролям пользователей</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPasswordLength">Минимальная длина пароля</Label>
              <Input
                id="minPasswordLength"
                type="number"
                value={settings.minPasswordLength}
                onChange={(e) => 
                  setSettings({ ...settings, minPasswordLength: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordExpiryDays">Срок действия пароля (дней)</Label>
              <Input
                id="passwordExpiryDays"
                type="number"
                value={settings.passwordExpiryDays}
                onChange={(e) => 
                  setSettings({ ...settings, passwordExpiryDays: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Количество неудачных попыток входа</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => 
                  setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lockoutTimeMinutes">Время блокировки (минуты)</Label>
              <Input
                id="lockoutTimeMinutes"
                type="number"
                value={settings.lockoutTimeMinutes}
                onChange={(e) => 
                  setSettings({ ...settings, lockoutTimeMinutes: parseInt(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Требовать заглавные буквы</Label>
              <Switch
                checked={settings.requireUppercase}
                onCheckedChange={(checked) => handleSwitchChange('requireUppercase', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Требовать цифры</Label>
              <Switch
                checked={settings.requireNumbers}
                onCheckedChange={(checked) => handleSwitchChange('requireNumbers', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Требовать специальные символы</Label>
              <Switch
                checked={settings.requireSpecialChars}
                onCheckedChange={(checked) => handleSwitchChange('requireSpecialChars', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Двухфакторная аутентификация */}
      <Card>
        <CardHeader>
          <CardTitle>Двухфакторная аутентификация</CardTitle>
          <CardDescription>Настройки дополнительной защиты аккаунтов</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Обязательная 2FA для администраторов</Label>
              <p className="text-sm text-muted-foreground">
                Требовать 2FA для всех пользователей с ролью администратора
              </p>
            </div>
            <Switch
              checked={settings.requireAdmin2FA}
              onCheckedChange={(checked) => handleSwitchChange('requireAdmin2FA', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>2FA для обычных пользователей</Label>
              <p className="text-sm text-muted-foreground">
                Разрешить обычным пользователям включать 2FA
              </p>
            </div>
            <Switch
              checked={settings.user2FA === 'optional'}
              onCheckedChange={(checked) => {
                setSettings({ ...settings, user2FA: checked ? 'optional' : 'disabled' });
                toast({
                  title: checked ? "Включено" : "Отключено",
                  description: checked 
                    ? "2FA для обычных пользователей включена (опционально)"
                    : "2FA для обычных пользователей отключена"
                });
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings; 
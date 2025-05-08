import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const themePreview = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  const handleThemeSelect = (value: string) => {
    setTheme(value as 'light' | 'dark' | 'purple' | 'green' | 'midnight' | 'charcoal');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h1 className="text-2xl font-bold mb-2">Настройки</h1>
        <p className="text-muted-foreground">Управление настройками платформы</p>
      </motion.div>
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6"
      >
        {/* Notification Settings */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Уведомления</CardTitle>
              <CardDescription>
                Настройте параметры уведомлений
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div 
                variants={item}
                className="flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium">Email уведомления</h3>
                  <p className="text-sm text-muted-foreground">
                    Получайте уведомления о новых заявках на email
                  </p>
                </div>
                <Button variant="outline">Настроить</Button>
              </motion.div>
              
              <motion.div 
                variants={item}
                className="flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium">Push-уведомления</h3>
                  <p className="text-sm text-muted-foreground">
                    Получайте мгновенные уведомления в браузере
                  </p>
                </div>
                <Button variant="outline">Настроить</Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Security Settings */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Безопасность</CardTitle>
              <CardDescription>
                Настройки безопасности аккаунта
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div 
                variants={item}
                className="flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium">Двухфакторная аутентификация</h3>
                  <p className="text-sm text-muted-foreground">
                    Защитите свой аккаунт дополнительным уровнем безопасности
                  </p>
                </div>
                <Button variant="outline">Настроить</Button>
              </motion.div>
              
              <motion.div 
                variants={item}
                className="flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium">Сменить пароль</h3>
                  <p className="text-sm text-muted-foreground">
                    Изменить пароль для входа в систему
                  </p>
                </div>
                <Button variant="outline">Изменить</Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Theme Settings */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Тема оформления</CardTitle>
              <CardDescription>
                Выберите предпочитаемую тему оформления интерфейса
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                defaultValue={theme} 
                value={theme} 
                onValueChange={handleThemeSelect}
                className="grid grid-cols-2 gap-4"
              >
                <motion.div
                  variants={themePreview}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleThemeSelect('light')}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light">Светлая</Label>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden h-24 w-full flex items-center justify-center">
                    <div className="w-full flex flex-col items-center space-y-2">
                      <div className="h-3 w-16 bg-[#4f46e5] rounded-full"></div>
                      <div className="h-3 w-20 bg-[#f3f4f6] rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  variants={themePreview}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleThemeSelect('dark')}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark">Темная</Label>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden h-24 w-full flex items-center justify-center">
                    <div className="w-full flex flex-col items-center space-y-2">
                      <div className="h-3 w-16 bg-blue-500 rounded-full"></div>
                      <div className="h-3 w-20 bg-slate-600 rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  variants={themePreview}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleThemeSelect('purple')}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value="purple" id="theme-purple" />
                    <Label htmlFor="theme-purple">Фиолетовая</Label>
                  </div>
                  <div className="bg-[#f9f8ff] border border-purple-100 rounded-lg overflow-hidden h-24 w-full flex items-center justify-center">
                    <div className="w-full flex flex-col items-center space-y-2">
                      <div className="h-3 w-16 bg-purple-500 rounded-full"></div>
                      <div className="h-3 w-20 bg-purple-100 rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  variants={themePreview}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleThemeSelect('midnight')}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value="midnight" id="theme-midnight" />
                    <Label htmlFor="theme-midnight">Полуночная</Label>
                  </div>
                  <div className="bg-[#0c1524] border border-[#162033] rounded-lg overflow-hidden h-24 w-full flex items-center justify-center">
                    <div className="w-full flex flex-col items-center space-y-2">
                      <div className="h-3 w-16 bg-blue-400 rounded-full"></div>
                      <div className="h-3 w-20 bg-[#1d2a3f] rounded-full"></div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={themePreview}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleThemeSelect('green')}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value="green" id="theme-green" />
                    <Label htmlFor="theme-green">Зеленая</Label>
                  </div>
                  <div className="bg-[#f0fcf7] border border-green-100 rounded-lg overflow-hidden h-24 w-full flex items-center justify-center">
                    <div className="w-full flex flex-col items-center space-y-2">
                      <div className="h-3 w-16 bg-green-500 rounded-full"></div>
                      <div className="h-3 w-20 bg-green-100 rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  variants={themePreview}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleThemeSelect('charcoal')}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value="charcoal" id="theme-charcoal" />
                    <Label htmlFor="theme-charcoal">Угольная</Label>
                  </div>
                  <div className="bg-[#212121] border border-[#2a2a2a] rounded-lg overflow-hidden h-24 w-full flex items-center justify-center">
                    <div className="w-full flex flex-col items-center space-y-2">
                      <div className="h-3 w-16 bg-gray-300 rounded-full"></div>
                      <div className="h-3 w-20 bg-[#333333] rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Settings;

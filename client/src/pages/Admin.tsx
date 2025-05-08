import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Users, Newspaper, Settings, Database, Shield } from 'lucide-react';
import UsersTable from '@/components/admin/UsersTable';
import NewsManager from '@/components/admin/NewsManager';
import DatabaseStats from '@/components/admin/DatabaseStats';
import SecuritySettings from '@/components/admin/SecuritySettings';
import { useNavigate, useLocation } from 'react-router-dom';

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

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.pathname.split('/').pop() || 'users';

  const handleTabChange = (value: string) => {
    navigate(`/admin/${value}`);
  };

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
        <h1 className="text-2xl font-bold mb-2">Панель администратора</h1>
        <p className="text-muted-foreground">Управление пользователями и контентом</p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              База данных
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              Новости
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Безопасность
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <motion.div
              variants={item}
              initial="hidden"
              animate="show"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Управление пользователями</CardTitle>
                  <CardDescription>
                    Просмотр, редактирование и управление пользователями системы
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UsersTable />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="news">
            <motion.div
              variants={item}
              initial="hidden"
              animate="show"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Управление новостями</CardTitle>
                  <CardDescription>
                    Создание, редактирование и удаление новостей
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NewsManager />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="database">
            <motion.div
              variants={item}
              initial="hidden"
              animate="show"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Статистика базы данных</CardTitle>
                  <CardDescription>
                    Мониторинг состояния и производительности базы данных
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DatabaseStats />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="security">
            <motion.div
              variants={item}
              initial="hidden"
              animate="show"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Безопасность</CardTitle>
                  <CardDescription>
                    Управление параметрами безопасности системы
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SecuritySettings />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="settings">
            <motion.div
              variants={item}
              initial="hidden"
              animate="show"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Настройки системы</CardTitle>
                  <CardDescription>
                    Общие настройки и конфигурация системы
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Настройки системы будут здесь</p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default Admin; 
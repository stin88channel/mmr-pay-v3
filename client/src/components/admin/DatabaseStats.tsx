import React from 'react';
import { Database, Users, FileText, Activity, FileSpreadsheet, FileText as FileTextIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const DatabaseStats: React.FC = () => {
  // В реальном приложении эти данные будут приходить с сервера
  const stats = {
    database: {
      cpu: 35,
      memory: 65,
      disk: 25,
      status: 'Нормальная'
    },
    users: {
      total: 1250,
      active: 980,
      new: 45
    },
    requests: {
      total: 5678,
      pending: 123,
      completed: 5432
    }
  };

  const handleExportExcel = () => {
    // Здесь будет логика экспорта в Excel
    console.log('Экспорт в Excel');
  };

  const handleExportCSV = () => {
    // Здесь будет логика экспорта в CSV
    console.log('Экспорт в CSV');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleExportExcel}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Экспорт в Excel
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleExportCSV}
        >
          <FileTextIcon className="h-4 w-4" />
          Экспорт в CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Статус базы данных */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Статус базы данных</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.database.status}</div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Нагрузка на CPU</span>
                <span>{stats.database.cpu}%</span>
              </div>
              <Progress value={stats.database.cpu} className="h-2" />
              
              <div className="flex items-center justify-between text-sm">
                <span>Использование памяти</span>
                <span>{stats.database.memory}%</span>
              </div>
              <Progress value={stats.database.memory} className="h-2" />
              
              <div className="flex items-center justify-between text-sm">
                <span>Использование диска</span>
                <span>{stats.database.disk}%</span>
              </div>
              <Progress value={stats.database.disk} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Пользователи */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Активные</span>
                <span>{stats.users.active}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Новые сегодня</span>
                <span>{stats.users.new}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Заявки */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заявки</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.requests.total}</div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>В обработке</span>
                <span>{stats.requests.pending}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Выполнено</span>
                <span>{stats.requests.completed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Активность системы */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активность системы</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Время работы</span>
                <span>99.9%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Скорость ответа</span>
                <span>45мс</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseStats; 
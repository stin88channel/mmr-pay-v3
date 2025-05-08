import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, CreditCard, FileText } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import TransactionsHistory from '@/components/requisites/TransactionsHistory';

/* Тестовые данные для графиков
const generateMockTransactionsData = () => {
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  return months.map((month) => ({
    name: month,
    income: Math.floor(Math.random() * 500000) + 100000,
    expense: Math.floor(Math.random() * 300000) + 50000,
  }));
};

const generateMockCategoryData = () => {
  return [
    { name: 'Продажи', value: 68 },
    { name: 'Возвраты', value: 12 },
    { name: 'Переводы', value: 15 },
    { name: 'Прочее', value: 5 },
  ];
};
*/

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const RequisiteStatistics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [transactionData] = useState([]); // Пустой массив вместо тестовых данных
  const [categoryData] = useState([]); // Пустой массив вместо тестовых данных

  const handleExportData = (format: string) => {
    toast({
      title: `Статистика экспортирована`,
      description: `Данные экспортированы в формате ${format}`,
    });
  };

  /* Тестовые данные реквизита
  const requisiteData = {
    id: id || 'REQ-2000',
    bank: 'Сбербанк',
    requisites: '4081 7810 1000 5000 9000',
    fullName: 'Иванов Иван Иванович',
    turnover: 4250000,
    transactionsCount: 158,
    lastUsed: '10.04.2025',
    verification: 'verified',
  };
  */

  // Format turnover amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/requisites">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold mb-1">Статистика реквизитов</h1>
            <p className="text-muted-foreground">
              {/* {requisiteData.bank} • {requisiteData.id} */}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleExportData('PDF')}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Экспорт PDF
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleExportData('Excel')}
            className="flex items-center gap-2"
          >
            <FileText size={16} />
            Экспорт Excel
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Общий оборот</CardDescription>
            <CardTitle className="text-2xl">{/* {formatAmount(requisiteData.turnover)} */}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Количество транзакций</CardDescription>
            <CardTitle className="text-2xl">{/* {requisiteData.transactionsCount} */}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Последнее использование</CardDescription>
            <CardTitle className="text-2xl">{/* {requisiteData.lastUsed} */}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Статус верификации</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              {/* {requisiteData.verification === 'verified' ? (
                <>Верифицирован <span className="text-green-500">✓</span></>
              ) : (
                'Не верифицирован'
              )} */}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Транзакции</TabsTrigger>
          <TabsTrigger value="charts">Графики</TabsTrigger>
          <TabsTrigger value="details">Детали реквизита</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>История транзакций</CardTitle>
              <CardDescription>
                Последние транзакции по данным реквизитам
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsHistory requisiteId={id || ''} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Динамика оборота</CardTitle>
                <CardDescription>
                  Ежемесячные приходы и расходы за последний год
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={transactionData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => formatAmount(value as number)}
                        labelFormatter={(label) => `Месяц: ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="income" 
                        name="Приход" 
                        stackId="1"
                        stroke="#8884d8" 
                        fill="#8884d8" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expense" 
                        name="Расход" 
                        stackId="2" 
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                      />
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Структура транзакций</CardTitle>
                <CardDescription>
                  Распределение типов транзакций
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Ежемесячные транзакции</CardTitle>
                <CardDescription>
                  Сравнение приходов и расходов по месяцам
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={transactionData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatAmount(value as number)} />
                      <Legend />
                      <Bar dataKey="income" name="Приход" fill="#8884d8" />
                      <Bar dataKey="expense" name="Расход" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Детальная информация</CardTitle>
              <CardDescription>
                Полная информация о реквизитах
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID</p>
                  <p className="text-lg">{/* {requisiteData.id} */}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Банк</p>
                  <p className="text-lg">{/* {requisiteData.bank} */}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Реквизиты</p>
                  <p className="text-lg font-mono">{/* {requisiteData.requisites} */}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ФИО владельца</p>
                  <p className="text-lg">{/* {requisiteData.fullName} */}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Общий оборот</p>
                  <p className="text-lg">{/* {formatAmount(requisiteData.turnover)} */}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Количество транзакций</p>
                  <p className="text-lg">{/* {requisiteData.transactionsCount} */}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Последнее использование</p>
                  <p className="text-lg">{/* {requisiteData.lastUsed} */}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Статус верификации</p>
                  <p className="text-lg flex items-center gap-2">
                    {/* {requisiteData.verification === 'verified' ? (
                      <>Верифицирован <span className="text-green-500">✓</span></>
                    ) : (
                      'Не верифицирован'
                    )} */}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RequisiteStatistics;

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBalance } from '@/contexts/BalanceContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

/* Тестовые данные для графиков
const mockData = [
  { date: '01-05', income: 120000, spending: 65000 },
  { date: '02-05', income: 98000, spending: 45000 },
  { date: '03-05', income: 86000, spending: 38000 },
  { date: '04-05', income: 99000, spending: 43000 },
  { date: '05-05', income: 85000, spending: 35000 },
  { date: '06-05', income: 65000, spending: 22000 },
  { date: '07-05', income: 75000, spending: 32000 },
  { date: '08-05', income: 110000, spending: 55000 },
  { date: '09-05', income: 145000, spending: 70000 },
  { date: '10-05', income: 130000, spending: 62000 },
];

const mockTransactionData = [
  { name: 'Карта', value: 65 },
  { name: 'Криптовалюта', value: 20 },
  { name: 'СБП', value: 15 },
];
*/

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

const chart = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const Analytics: React.FC = () => {
  const { balance } = useBalance();
  const navigate = useNavigate();
  const location = useLocation();
  const formatNumber = (num: number) => new Intl.NumberFormat('ru-RU').format(num);
  
  // Определяем активный таб на основе текущего пути
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/income')) return 'income';
    if (path.includes('/spending')) return 'spending';
    return 'summary';
  };

  // Обработчик изменения таба
  const handleTabChange = (value: string) => {
    if (value === 'summary') {
      navigate('/analytics/summary');
    } else if (value === 'income') {
      navigate('/analytics/income');
    } else if (value === 'spending') {
      navigate('/analytics/spending');
    }
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
        <h1 className="text-2xl font-bold mb-2">Финансовая аналитика</h1>
        <p className="text-muted-foreground">Детальный анализ финансовых операций</p>
      </motion.div>
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Общий оборот</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₽ {/* {formatNumber(5732500)} */}</div>
              <p className="text-xs text-muted-foreground">
                +12% по сравнению с прошлым месяцем
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Средний чек</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₽ {/* {formatNumber(12500)} */}</div>
              <p className="text-xs text-muted-foreground">
                -3% по сравнению с прошлым месяцем
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Заработано комиссий</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₽ {/* {formatNumber(87450)} */}</div>
              <p className="text-xs text-muted-foreground">
                +8% по сравнению с прошлым месяцем
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      
      <Tabs value={getActiveTab()} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="summary">Сводка</TabsTrigger>
          <TabsTrigger value="income">Доходы</TabsTrigger>
          <TabsTrigger value="spending">Расходы</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4">
          <motion.div
            variants={chart}
            initial="hidden"
            animate="show"
          >
            <Card className="pt-6">
              <CardHeader>
                <CardTitle>Динамика финансовых операций</CardTitle>
                <CardDescription>Данные за последние 10 дней</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[]} // Пустой массив вместо mockData
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`₽ ${formatNumber(value)}`, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#4f46e5" name="Доход" />
                    <Line type="monotone" dataKey="spending" stroke="#f43f5e" name="Расход" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <motion.div variants={item}>
              <Card>
                <CardHeader>
                  <CardTitle>Источники поступлений</CardTitle>
                  <CardDescription>Распределение поступлений по типам</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]}> {/* Пустой массив вместо mockTransactionData */}
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`${value}%`, 'Доля']} />
                      <Bar dataKey="value" fill="#8884d8" name="Процент" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={item}>
              <Card>
                <CardHeader>
                  <CardTitle>Статистика заявок</CardTitle>
                  <CardDescription>Показатели по обработке заявок</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Завершённые заявки</p>
                        <div className="font-medium">0%</div>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "0%" }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm">В обработке</p>
                        <div className="font-medium">0%</div>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "0%" }}
                          transition={{ duration: 1, delay: 0.4 }}
                          className="h-full rounded-full bg-yellow-500"
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Отклонённые</p>
                        <div className="font-medium">0%</div>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "0%" }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full rounded-full bg-destructive"
                        />
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="income">
          <motion.div
            variants={item}
            initial="hidden"
            animate="show"
          >
            <Card>
              <CardHeader>
                <CardTitle>Детальная статистика доходов</CardTitle>
                <CardDescription>
                  Подробная информация о поступлении средств
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Раздел содержит подробные данные о финансовых поступлениях, категориях доходов, 
                  трендах и источниках дохода.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="spending">
          <motion.div
            variants={item}
            initial="hidden"
            animate="show"
          >
            <Card>
              <CardHeader>
                <CardTitle>Детальная статистика расходов</CardTitle>
                <CardDescription>
                  Подробная информация о списании средств
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Раздел содержит подробные данные о финансовых расходах, категориях списаний, 
                  трендах и целях расходов.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Analytics;

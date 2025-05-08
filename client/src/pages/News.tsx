import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
  category: 'system' | 'updates' | 'finance';
  isImportant: boolean;
}

// Мокап данных для новостей
/* const mockNews: NewsItem[] = [
  {
    id: 1,
    title: 'Обновление системы платежей',
    content: 'Мы обновили систему обработки платежей. Теперь транзакции обрабатываются быстрее и с большей безопасностью.',
    date: '2023-05-01T10:30:00',
    category: 'system',
    isImportant: true,
  },
  {
    id: 2,
    title: 'Новые методы вывода средств',
    content: 'Добавлены новые способы вывода средств включая международные платежные системы и криптовалютные кошельки.',
    date: '2023-04-28T14:15:00',
    category: 'updates',
    isImportant: false,
  },
  {
    id: 3,
    title: 'Изменения в комиссиях',
    content: 'Мы пересмотрели нашу систему комиссий. С 1 июня комиссия за вывод средств на банковские карты будет снижена с 2% до 1.5%.',
    date: '2023-04-25T09:00:00',
    category: 'finance',
    isImportant: true,
  },
  {
    id: 4,
    title: 'Технические работы',
    content: 'В ночь с 5 на 6 мая будут проводиться технические работы. Возможны кратковременные перебои в работе сервиса.',
    date: '2023-04-22T16:45:00',
    category: 'system',
    isImportant: true,
  },
  {
    id: 5,
    title: 'Новые возможности в личном кабинете',
    content: 'Мы добавили новый раздел аналитики в личный кабинет. Теперь вы можете отслеживать статистику ваших операций в удобных графиках.',
    date: '2023-04-20T11:20:00',
    category: 'updates',
    isImportant: false,
  },
  {
    id: 6,
    title: 'Партнерство с крупным банком',
    content: 'Мы заключили партнерство с одним из ведущих банков страны, что позволит ускорить процессы пополнения и вывода средств.',
    date: '2023-04-18T10:00:00',
    category: 'finance',
    isImportant: true,
  },
  {
    id: 7,
    title: 'Оптимизация работы сайта',
    content: 'Мы провели оптимизацию работы сайта. Теперь страницы загружаются на 30% быстрее.',
    date: '2023-04-15T13:10:00',
    category: 'system',
    isImportant: false,
  }
]; */

const mockNews: NewsItem[] = [];

const categoryLabels = {
  'system': { name: 'Система', color: 'default' },
  'updates': { name: 'Обновления', color: 'secondary' },
  'finance': { name: 'Финансы', color: 'destructive' },
};

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

const card = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

const News: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [expandedNews, setExpandedNews] = useState<number[]>([]);
  
  const filteredNews = mockNews.filter(news => {
    if (activeTab === 'all') return true;
    if (activeTab === 'important') return news.isImportant;
    return news.category === activeTab;
  });
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const toggleExpand = (id: number) => {
    setExpandedNews(prev => 
      prev.includes(id) 
        ? prev.filter(newsId => newsId !== id) 
        : [...prev, id]
    );
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
        <h1 className="text-3xl font-bold mb-2">Новости и обновления</h1>
        <p className="text-muted-foreground">
          Следите за последними новостями и обновлениями нашего сервиса
        </p>
      </motion.div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Все новости</TabsTrigger>
          <TabsTrigger value="important">Важные</TabsTrigger>
          <TabsTrigger value="system">Система</TabsTrigger>
          <TabsTrigger value="updates">Обновления</TabsTrigger>
          <TabsTrigger value="finance">Финансы</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2"
          >
            <AnimatePresence mode="wait">
              {filteredNews.length === 0 ? (
                <motion.div
                  key="no-news"
                  variants={card}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="col-span-2"
                >
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <div className="text-center space-y-2">
                        <p className="text-lg font-medium">Новостей пока нет</p>
                        <p className="text-sm text-muted-foreground">Следите за обновлениями, скоро здесь появятся новости</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                filteredNews.map((news, index) => (
                  <motion.div
                    key={news.id}
                    variants={card}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{news.title}</CardTitle>
                          <Badge 
                            variant={categoryLabels[news.category].color as "default" | "destructive" | "outline" | "secondary" | null}
                          >
                            {categoryLabels[news.category].name}
                          </Badge>
                        </div>
                        <CardDescription>{formatDate(news.date)}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className={expandedNews.includes(news.id) ? '' : 'line-clamp-3'}
                        >
                          {news.content}
                        </motion.div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleExpand(news.id)}
                        >
                          {expandedNews.includes(news.id) ? 'Скрыть' : 'Читать дальше'}
                        </Button>
                        {news.isImportant && (
                          <Badge variant="outline" className="ml-auto">Важно</Badge>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
          
          {filteredNews.length === 0 && activeTab !== 'all' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-10"
            >
              <p className="text-muted-foreground">Нет новостей по выбранной категории</p>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default News;

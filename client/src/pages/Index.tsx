import React from 'react';
import RequestsTable from '@/components/requests/RequestsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
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

const Index = () => {
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
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-3xl font-bold">Панель управления</h1>
        <Link to="/analytics">
          <Button variant="outline" className="flex items-center gap-1">
            Подробная аналитика <ArrowRight size={16} />
          </Button>
        </Link>
      </motion.div>
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-3"
      >
        <motion.div variants={item}>
          <Card className="transition-all hover:shadow-md h-[180px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Активные заявки
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-2xl font-bold"
                >
                  -
                </motion.div>
                <p className="text-xs text-muted-foreground">
                  Нет данных
                </p>
              </div>
              <div className="h-[24px]"></div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="transition-all hover:shadow-md h-[180px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                На проверке
              </CardTitle>
              <motion.svg
                initial={{ scale: 1 }}
                animate={{ scale: 1.1 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </motion.svg>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-2xl font-bold"
                >
                  -
                </motion.div>
                <p className="text-xs text-muted-foreground">
                  Нет данных
                </p>
              </div>
              <div className="h-[24px]"></div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="transition-all hover:shadow-md h-[180px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Сумма</CardTitle>
              <motion.svg
                initial={{ y: 0 }}
                animate={{ y: -5 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </motion.svg>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-2xl font-bold"
                >
                  -
                </motion.div>
                <p className="text-xs text-muted-foreground">
                  Нет данных
                </p>
              </div>
              <Link to="/transactions" className="text-xs text-primary hover:underline">
                Посмотреть историю транзакций
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <RequestsTable />
      </motion.div>
    </motion.div>
  );
};

export default Index;


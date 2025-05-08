import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ArrowDownToLine, ArrowUpRight, Filter, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface Transaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: string;
  details: string;
}

// Mock transactions data
// const mockTransactions: Transaction[] = [
//   {
//     id: 'TRX-001',
//     date: '2023-05-01T14:32:00',
//     type: 'deposit',
//     amount: 50000,
//     status: 'completed',
//     method: 'TRC20',
//     details: 'Пополнение через USDT TRC20'
//   },
//   {
//     id: 'TRX-002',
//     date: '2023-05-01T09:15:00',
//     type: 'withdrawal',
//     amount: 25000,
//     status: 'completed',
//     method: 'Банковская карта',
//     details: 'Вывод на карту *4589'
//   },
//   {
//     id: 'TRX-003',
//     date: '2023-04-30T18:45:00',
//     type: 'deposit',
//     amount: 100000,
//     status: 'completed',
//     method: 'TRC20',
//     details: 'Пополнение через USDT TRC20'
//   },
//   {
//     id: 'TRX-004',
//     date: '2023-04-29T12:20:00',
//     type: 'withdrawal',
//     amount: 35000,
//     status: 'pending',
//     method: 'Банковская карта',
//     details: 'Вывод на карту *7893'
//   },
//   {
//     id: 'TRX-005',
//     date: '2023-04-28T16:05:00',
//     type: 'withdrawal',
//     amount: 15000,
//     status: 'failed',
//     method: 'СБП',
//     details: 'Ошибка перевода'
//   },
//   {
//     id: 'TRX-006',
//     date: '2023-04-27T09:50:00',
//     type: 'deposit',
//     amount: 75000,
//     status: 'completed',
//     method: 'СБП',
//     details: 'Пополнение через СБП'
//   },
//   {
//     id: 'TRX-007',
//     date: '2023-04-26T14:10:00',
//     type: 'deposit',
//     amount: 30000,
//     status: 'completed',
//     method: 'TRC20',
//     details: 'Пополнение через USDT TRC20'
//   },
//   {
//     id: 'TRX-008',
//     date: '2023-04-25T17:35:00',
//     type: 'withdrawal',
//     amount: 50000,
//     status: 'completed',
//     method: 'Банковская карта',
//     details: 'Вывод на карту *1234'
//   },
// ];

const ITEMS_PER_PAGE = 5;

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

const tableRow = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

const Transactions: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions] = useState<Transaction[]>([]); // Пустой массив вместо тестовых данных
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format amount
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Завершено</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">В обработке</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Ошибка</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.method.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesType && matchesStatus && matchesSearch;
  });
  
  // Paginate transactions
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

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
        <h1 className="text-2xl font-bold mb-2">История операций</h1>
        <p className="text-muted-foreground">
          Все транзакции по вашему аккаунту
        </p>
      </motion.div>
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <div className="flex justify-between flex-col md:flex-row gap-4">
                <div>
                  <CardTitle>Транзакции</CardTitle>
                  <CardDescription>
                    Просмотр и поиск транзакций
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <Select 
                      value={filterType} 
                      onValueChange={setFilterType}
                    >
                      <SelectTrigger className="w-[140px]">
                        <Filter size={16} className="mr-2" />
                        <SelectValue placeholder="Тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все типы</SelectItem>
                        <SelectItem value="deposit">Пополнения</SelectItem>
                        <SelectItem value="withdrawal">Выводы</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={filterStatus} 
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-[140px]">
                        <Filter size={16} className="mr-2" />
                        <SelectValue placeholder="Статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все статусы</SelectItem>
                        <SelectItem value="completed">Завершено</SelectItem>
                        <SelectItem value="pending">В обработке</SelectItem>
                        <SelectItem value="failed">Ошибка</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Поиск..."
                        className="pl-8 w-[200px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Способ</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Детали</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map((transaction, index) => (
                      <motion.tr
                        key={transaction.id}
                        variants={tableRow}
                        initial="hidden"
                        animate="show"
                        transition={{ delay: index * 0.05 }}
                      >
                        <TableCell className="font-medium">{transaction.id}</TableCell>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          {transaction.type === 'deposit' ? (
                            <div className="flex items-center gap-2">
                              <ArrowUpRight size={16} className="text-green-600" />
                              <span>Пополнение</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <ArrowDownToLine size={16} className="text-blue-600" />
                              <span>Вывод</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className={transaction.type === 'deposit' ? 'text-green-600' : 'text-blue-600'}>
                          {transaction.type === 'deposit' ? '+' : '-'}{formatAmount(transaction.amount)}
                        </TableCell>
                        <TableCell>{transaction.method}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>{transaction.details}</TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Транзакции не найдены
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {totalPages > 1 && (
                <motion.div
                  variants={item}
                  className="mt-4 flex justify-end"
                >
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <PaginationItem key={index}>
                          <PaginationLink
                            onClick={() => setCurrentPage(index + 1)}
                            isActive={currentPage === index + 1}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Transactions;

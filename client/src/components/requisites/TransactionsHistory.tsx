  import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ArrowDown, ArrowUp } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  description: string;
  status: 'completed' | 'pending' | 'failed';
  counterparty: string;
}

interface TransactionsHistoryProps {
  requisiteId: string;
}

/* Тестовые данные для транзакций
const generateMockTransactions = (count: number): Transaction[] => {
  const types: ('income' | 'expense' | 'transfer')[] = ['income', 'expense', 'transfer'];
  const statuses: ('completed' | 'pending' | 'failed')[] = ['completed', 'pending', 'failed'];
  const descriptions = [
    'Оплата услуг', 
    'Перевод средств', 
    'Возврат средств', 
    'Выплата по договору', 
    'Пополнение баланса'
  ];
  const counterparties = [
    'ООО "Ромашка"', 
    'ИП Иванов И.И.', 
    'АО "Технологии"', 
    'ООО "СтройМастер"', 
    'Петров П.П.'
  ];
  
  return Array.from({ length: count }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    const type = types[Math.floor(Math.random() * types.length)];
    const amount = type === 'expense' 
      ? -Math.floor(Math.random() * 50000 + 1000) 
      : Math.floor(Math.random() * 100000 + 5000);
    
    return {
      id: `TRX-${5000 + i}`,
      date: date.toLocaleDateString('ru-RU'),
      amount,
      type,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      counterparty: counterparties[Math.floor(Math.random() * counterparties.length)],
    };
  });
};
*/

const ITEMS_PER_PAGE = 10;

const TransactionsHistory: React.FC<TransactionsHistoryProps> = ({ requisiteId }) => {
  const [transactions] = useState<Transaction[]>([]); // Пустой массив вместо тестовых данных
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction | null, direction: 'ascending' | 'descending' | null }>({
    key: 'date',
    direction: 'descending'
  });

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction => {
    return (
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.counterparty.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Handle sort change
  const handleSort = (key: keyof Transaction) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = null;
    }
    
    setSortConfig({ key, direction });
  };

  // Paginate transactions
  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-grow sm:flex-grow-0 w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск транзакций..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button variant="outline" className="flex items-center gap-2">
          <Filter size={16} />
          Фильтры
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="w-[90px] cursor-pointer"
                onClick={() => handleSort('id')}
              >
                ID
                {sortConfig.key === 'id' && (
                  sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                  sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                )}
              </TableHead>
              <TableHead 
                className="w-[100px] cursor-pointer"
                onClick={() => handleSort('date')}
              >
                Дата
                {sortConfig.key === 'date' && (
                  sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                  sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('description')}
              >
                Описание
                {sortConfig.key === 'description' && (
                  sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                  sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('counterparty')}
              >
                Контрагент
                {sortConfig.key === 'counterparty' && (
                  sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                  sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                )}
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('amount')}
              >
                Сумма
                {sortConfig.key === 'amount' && (
                  sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                  sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                )}
              </TableHead>
              <TableHead 
                className="text-center cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Статус
                {sortConfig.key === 'status' && (
                  sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                  sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.counterparty}</TableCell>
                  <TableCell className={`text-right font-medium ${
                    transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 
                    transaction.amount < 0 ? 'text-red-600 dark:text-red-400' : ''
                  }`}>
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={
                      transaction.status === 'completed' ? 'success' :
                      transaction.status === 'pending' ? 'outline' : 'destructive'
                    }>
                      {transaction.status === 'completed' ? 'Выполнено' :
                      transaction.status === 'pending' ? 'В процессе' : 'Отклонено'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Транзакции не найдены
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              // Show current page, first, last and one on each side
              if (
                page === 1 || 
                page === totalPages || 
                page === currentPage || 
                page === currentPage - 1 || 
                page === currentPage + 1
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              
              // Show ellipsis between page ranges
              if (
                (page === 2 && currentPage > 3) || 
                (page === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return <PaginationItem key={page}>...</PaginationItem>;
              }
              
              return null;
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default TransactionsHistory;

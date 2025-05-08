import React, { useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, Search, ArrowUp, ArrowDown, Eye, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import FilterMenu from './FilterMenu';
import { RequestType, StatusType } from '@/types/request';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';

// Mock data
/* Тестовые данные для заявок
const generateMockData = (): RequestType[] => {
  const statuses: StatusType[] = ['active', 'checking', 'closed', 'cancelled'];
  
  return Array.from({ length: 20 }).map((_, i) => ({
    id: `REQ-${1000 + i}`,
    merchant: `Мерчант ${i + 1}`,
    amount: Math.floor(Math.random() * 100000 + 1000),
    date: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    method: Math.random() > 0.5 ? 'Карта' : 'СБП',
  }));
};
*/

const statusLabels = {
  'active': { label: 'Активная', color: 'default' },
  'checking': { label: 'На проверке', color: 'warning' },
  'closed': { label: 'Закрыта', color: 'success' },
  'cancelled': { label: 'Отменена', color: 'destructive' },
};

const ITEMS_PER_PAGE = 5;

const RequestsTable: React.FC = () => {
  const [requests] = useState<RequestType[]>([]); // Пустой массив вместо тестовых данных
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof RequestType | null, direction: 'ascending' | 'descending' | null }>({
    key: null,
    direction: null
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { toast } = useToast();
  
  const handleSort = (key: keyof RequestType) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = null;
    }
    
    setSortConfig({ key, direction });
  };
  
  const filteredRequests = requests.filter(request => {
    // Filter by tab/status
    const statusFilter = activeTab === 'all' || request.status === activeTab;
    
    // Filter by search term
    const searchFilter = !searchTerm || 
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      request.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusFilter && searchFilter;
  });
  
  const sortedRequests = [...filteredRequests].sort((a, b) => {
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
  
  // Pagination
  const totalPages = Math.ceil(sortedRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = sortedRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCloseRequest = (id: string) => {
    toast({
      title: "Заявка закрыта",
      description: `Заявка ${id} успешно закрыта`,
    });
  };

  const handleCancelRequest = (id: string) => {
    toast({
      title: "Заявка отменена",
      description: `Заявка ${id} успешно отменена`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Заявки</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск..."
              className="pl-8 w-full sm:w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsFilterMenuOpen(true)}
          >
            <Filter size={18} />
          </Button>
          <FilterMenu open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen} />
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">Все заявки</TabsTrigger>
          <TabsTrigger value="active">Активные</TabsTrigger>
          <TabsTrigger value="checking">Проверки</TabsTrigger>
          <TabsTrigger value="closed">Закрытые</TabsTrigger>
          <TabsTrigger value="cancelled">Отмененные</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-2">
          <div className="rounded-md border">
            <Table>
              <TableCaption className="pb-4">Всего заявок: {sortedRequests.length}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort('id')}>
                    ID
                    {sortConfig.key === 'id' && (
                      sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                      sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                    )}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('merchant')}>
                    Мерчант
                    {sortConfig.key === 'merchant' && (
                      sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                      sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                    )}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                    Сумма
                    {sortConfig.key === 'amount' && (
                      sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                      sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                    )}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('bank')}>
                    Банк
                    {sortConfig.key === 'bank' && (
                      sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                      sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                    )}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('requisites')}>
                    Реквизиты
                    {sortConfig.key === 'requisites' && (
                      sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                      sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                    )}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('method')}>
                    Метод
                    {sortConfig.key === 'method' && (
                      sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                      sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                    )}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                    Дата
                    {sortConfig.key === 'date' && (
                      sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                      sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                    )}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    Статус
                    {sortConfig.key === 'status' && (
                      sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                      sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                    )}
                  </TableHead>
                  <TableHead className="text-center">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRequests.length > 0 ? (
                  paginatedRequests.map((request) => (
                    <TableRow key={request.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{request.id}</TableCell>
                      <TableCell>{request.merchant}</TableCell>
                      <TableCell>{formatAmount(request.amount)}</TableCell>
                      <TableCell>{request.bank}</TableCell>
                      <TableCell>{request.requisites}</TableCell>
                      <TableCell>{request.method}</TableCell>
                      <TableCell>{formatDate(request.date)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          request.status === 'active' ? 'success' :
                          request.status === 'checking' ? 'outline' : 'destructive'
                        }>
                          {request.status === 'active' ? 'Активная' :
                          request.status === 'checking' ? 'На проверке' : 'Отклонена'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleCloseRequest(request.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleCancelRequest(request.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                      Заявки не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    // Show current page, first page, last page, and one page before and after current
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
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    
                    // Show ellipsis between ranges of pages
                    if (
                      (page === 2 && currentPage > 3) || 
                      (page === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return <PaginationItem key={page}><PaginationEllipsis /></PaginationItem>;
                    }
                    
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RequestsTable;

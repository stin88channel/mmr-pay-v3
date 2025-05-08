import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Search, ArrowUp, ArrowDown, Edit, Check, X, Eye, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { RequisiteType } from '@/types/requisite';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import AddEditRequisiteForm from './AddEditRequisiteForm';
import './RequisitesTable.css';

// Мокап данных для реквизитов
/* Тестовые данные для реквизитов
const generateMockRequisites = (): RequisiteType[] => {
  const banks = [
    'Сбербанк', 
    'ВТБ', 
    'Альфа-Банк', 
    'Тинькофф', 
    'Газпромбанк', 
    'Райффайзен Банк'
  ];
  
  const fullNames = [
    'Иванов Иван Иванович',
    'Петров Петр Петрович',
    'Сидоров Сидор Сидорович',
    'Андреев Андрей Андреевич',
    'Павлова Ольга Сергеевна',
  ];
  
  return Array.from({ length: 15 }).map((_, i) => ({
    id: `REQ-${2000 + i}`,
    bank: banks[Math.floor(Math.random() * banks.length)],
    requisites: `4081 7810 ${1000 + i} ${5000 + i} ${9000 + i}`,
    fullName: fullNames[Math.floor(Math.random() * fullNames.length)],
    limits: {
      daily: Math.floor(Math.random() * 500000 + 100000),
      monthly: Math.floor(Math.random() * 5000000 + 1000000),
    },
    turnover: Math.floor(Math.random() * 10000000 + 500000),
    isActive: Math.random() > 0.3,
  }));
};
*/

const ITEMS_PER_PAGE = 5;

interface RequisitesTableProps {
  requisites: RequisiteType[];
  onRequisitesChange: (requisites: RequisiteType[]) => void;
}

const RequisitesTable: React.FC<RequisitesTableProps> = ({ requisites, onRequisitesChange }) => {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState<{ key: keyof RequisiteType | null, direction: 'ascending' | 'descending' | null }>({
    key: null,
    direction: null
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRequisite, setEditingRequisite] = useState<RequisiteType | null>(null);
  const [deletingRequisite, setDeletingRequisite] = useState<RequisiteType | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    localStorage.setItem('requisites', JSON.stringify(requisites));
  }, [requisites]);
  
  const handleSort = (key: keyof RequisiteType) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = null;
    }
    
    setSortConfig({ key, direction });
  };
  
  const filteredRequisites = requisites.filter(requisite => {
    // Фильтрация по поисковому запросу
    return !searchTerm || 
      requisite.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      requisite.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requisite.fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const getSortedValue = (requisite: RequisiteType, key: keyof RequisiteType): any => {
    if (key === 'limits') return requisite.limits.monthly; // Сортировка по месячному лимиту
    return requisite[key];
  };
  
  const sortedRequisites = [...filteredRequisites].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;
    
    const aValue = getSortedValue(a, sortConfig.key);
    const bValue = getSortedValue(b, sortConfig.key);
    
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
  
  // Пагинация
  const totalPages = Math.ceil(sortedRequisites.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequisites = sortedRequisites.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  // Форматирование суммы
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Обработчики
  const handleToggleActive = (id: string) => {
    const updatedRequisites = requisites.map(req => 
      req.id === id ? { ...req, isActive: !req.isActive } : req
    );
    onRequisitesChange(updatedRequisites);
    
    const requisite = requisites.find(r => r.id === id);
    if (requisite) {
      toast({
        title: requisite.isActive ? 'Реквизит деактивирован' : 'Реквизит активирован',
        description: `Реквизит ${requisite.bank} ${requisite.isActive ? 'больше не активен' : 'теперь активен'}`,
      });
    }
  };
  
  const handleEdit = (requisite: RequisiteType) => {
    setEditingRequisite(requisite);
    setIsAddDialogOpen(true);
  };

  const handleAddRequisite = (requisite: RequisiteType) => {
    if (editingRequisite) {
      const updatedRequisites = requisites.map(req => 
        req.id === requisite.id ? requisite : req
      );
      onRequisitesChange(updatedRequisites);
      toast({
        title: 'Реквизит обновлен',
        description: 'Информация о реквизите успешно обновлена',
      });
    } else {
      onRequisitesChange([...requisites, requisite]);
      toast({
        title: 'Реквизит добавлен',
        description: 'Новый реквизит успешно добавлен',
      });
    }
    setEditingRequisite(null);
    setIsAddDialogOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getMethodLabel = (category?: string) => {
    switch (category) {
      case 'personal':
        return 'Банковский счет';
      case 'business':
        return 'Карта';
      case 'partner':
        return 'СБП';
      default:
        return 'Неизвестно';
    }
  };

  const handleDelete = (requisite: RequisiteType) => {
    setDeletingRequisite(requisite);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingRequisite) {
      const updatedRequisites = requisites.filter(req => req.id !== deletingRequisite.id);
      onRequisitesChange(updatedRequisites);
      
      // Проверяем, нужно ли изменить текущую страницу
      const newTotalPages = Math.ceil((updatedRequisites.length) / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
      
      toast({
        title: 'Реквизит удален',
        description: 'Реквизит успешно удален из системы',
      });
      setIsDeleteDialogOpen(false);
      setDeletingRequisite(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Список реквизитов</h2>
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
            variant="default" 
            className="whitespace-nowrap"
            onClick={() => navigate('/requisites/add')}
          >
            Добавить реквизит
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableCaption className="pb-4">Всего реквизитов: {sortedRequisites.length}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort('id')}>
                ID
                {sortConfig.key === 'id' && (
                  sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                  sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                )}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>
                Метод
                {sortConfig.key === 'category' && (
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
              <TableHead>Реквизиты</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('fullName')}>
                ФИО
                {sortConfig.key === 'fullName' && (
                  sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                  sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                )}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('limits')}>
                Лимиты
                {sortConfig.key === 'limits' && (
                  sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                  sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                )}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('turnover')}>
                Оборот
                {sortConfig.key === 'turnover' && (
                  sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                  sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                )}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('isActive')}>
                Статус
                {sortConfig.key === 'isActive' && (
                  sortConfig.direction === 'ascending' ? <ArrowUp className="inline ml-1 h-3 w-3" /> : 
                  sortConfig.direction === 'descending' ? <ArrowDown className="inline ml-1 h-3 w-3" /> : null
                )}
              </TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRequisites.length > 0 ? (
              paginatedRequisites.map((requisite) => (
                <TableRow key={requisite.id}>
                  <TableCell className="font-medium">{requisite.id}</TableCell>
                  <TableCell>{getMethodLabel(requisite.category)}</TableCell>
                  <TableCell>{requisite.bank}</TableCell>
                  <TableCell className="font-mono text-sm">{requisite.requisites}</TableCell>
                  <TableCell>{requisite.fullName}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">День: {formatAmount(requisite.limits.daily)}</div>
                      <div className="text-sm">Месяц: {formatAmount(requisite.limits.monthly)}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatAmount(requisite.turnover)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={requisite.isActive}
                      onCheckedChange={() => handleToggleActive(requisite.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(requisite)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(requisite)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  Нет доступных реквизитов
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Диалог редактирования */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>Редактирование реквизита</DialogTitle>
            <DialogDescription>
              Измените информацию о реквизите
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <AddEditRequisiteForm 
              onSuccess={(updatedRequisite) => {
                handleAddRequisite(updatedRequisite);
                setIsAddDialogOpen(false);
              }} 
              initialData={editingRequisite || undefined}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Диалог подтверждения удаления */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить реквизит {deletingRequisite?.bank}? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Пагинация */}
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
                // Показываем текущую страницу, первую, последнюю и по одной до и после текущей
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
                
                // Показываем многоточие между диапазонами страниц
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
    </div>
  );
};

export default RequisitesTable;

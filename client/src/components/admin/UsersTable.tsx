import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal, UserPlus, Eye, Edit, Shield, Wallet, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Mail, User, Clock, Globe } from "lucide-react";
import * as XLSX from 'xlsx';

// Временные данные для демонстрации
const mockUsers = [
  { id: 1, name: 'Иван Петров', email: 'ivan@example.com', role: 'admin', status: 'active', balance: 15000, lastLogin: '2024-03-15 14:30', ip: '192.168.1.1' },
  { id: 2, name: 'Мария Сидорова', email: 'maria@example.com', role: 'user', status: 'active', balance: 5000, lastLogin: '2024-03-15 12:15', ip: '192.168.1.2' },
  { id: 3, name: 'Алексей Иванов', email: 'alex@example.com', role: 'user', status: 'blocked', balance: 0, lastLogin: '2024-03-14 18:45', ip: '192.168.1.3' },
  { id: 4, name: 'Елена Смирнова', email: 'elena@example.com', role: 'user', status: 'active', balance: 25000, lastLogin: '2024-03-15 09:20', ip: '192.168.1.4' },
  { id: 5, name: 'Дмитрий Козлов', email: 'dmitry@example.com', role: 'user', status: 'pending', balance: 1000, lastLogin: '2024-03-13 16:10', ip: '192.168.1.5' },
];

const UsersTable: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState(mockUsers);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    balance: 0,
    lastLogin: new Date().toLocaleString('ru-RU'),
    ip: '0.0.0.0',
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    const newId = Math.max(...users.map(u => u.id)) + 1;
    const user = {
      ...newUser,
      id: newId,
    };

    setUsers([...users, user]);
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      status: 'active',
      balance: 0,
      lastLogin: new Date().toLocaleString('ru-RU'),
      ip: '0.0.0.0',
    });
    setIsDialogOpen(false);

    toast({
      title: "Успешно",
      description: "Пользователь добавлен",
    });
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      balance: user.balance,
      lastLogin: user.lastLogin,
      ip: user.ip,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    setUsers(users.map(user => 
      user.id === selectedUser.id 
        ? { ...user, ...newUser }
        : user
    ));

    setIsEditDialogOpen(false);
    toast({
      title: "Успешно",
      description: "Данные пользователя обновлены",
    });
  };

  const handleToggleBlock = (user: any) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    setUsers(users.map(u => 
      u.id === user.id 
        ? { ...u, status: newStatus }
        : u
    ));

    toast({
      title: "Успешно",
      description: `Пользователь ${newStatus === 'active' ? 'разблокирован' : 'заблокирован'}`,
    });
  };

  const handleExportExcel = () => {
    try {
      const data = users.map(user => ({
        'ID': user.id,
        'Имя пользователя': user.name,
        'Email': user.email,
        'Роль': user.role,
        'Статус': user.status,
        'Баланс': user.balance,
        'Дата регистрации': user.lastLogin,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Пользователи');
      XLSX.writeFile(wb, 'users.xlsx');

      toast({
        title: "Успешно",
        description: "Данные экспортированы в Excel",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось экспортировать данные",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ['ID', 'Имя пользователя', 'Email', 'Роль', 'Статус', 'Баланс', 'Дата регистрации'];
      const data = users.map(user => [
        user.id,
        user.name,
        user.email,
        user.role,
        user.status,
        user.balance,
        user.lastLogin,
      ]);

      const csvContent = [
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'users.csv';
      link.click();

      toast({
        title: "Успешно",
        description: "Данные экспортированы в CSV",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось экспортировать данные",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени или email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Роль" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все роли</SelectItem>
              <SelectItem value="admin">Админ</SelectItem>
              <SelectItem value="user">Пользователь</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активен</SelectItem>
              <SelectItem value="blocked">Заблокирован</SelectItem>
              <SelectItem value="pending">Ожидает</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel}>
                Экспорт в Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>
                Экспорт в CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить пользователя</DialogTitle>
                <DialogDescription>
                  Заполните информацию о новом пользователе
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Введите имя"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Введите email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Роль</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Админ</SelectItem>
                      <SelectItem value="user">Пользователь</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Статус</Label>
                  <Select
                    value={newUser.status}
                    onValueChange={(value) => setNewUser({ ...newUser, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Активен</SelectItem>
                      <SelectItem value="blocked">Заблокирован</SelectItem>
                      <SelectItem value="pending">Ожидает</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="balance">Баланс</Label>
                  <Input
                    id="balance"
                    type="number"
                    value={newUser.balance}
                    onChange={(e) => setNewUser({ ...newUser, balance: Number(e.target.value) })}
                    placeholder="Введите баланс"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddUser}>Добавить</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Имя</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Баланс</TableHead>
              <TableHead>Последний вход</TableHead>
              <TableHead>IP</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {user.role === 'admin' ? 'Админ' : 'Пользователь'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.status === 'active' 
                      ? 'bg-green-500/10 text-green-500'
                      : user.status === 'blocked'
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {user.status === 'active' 
                      ? 'Активен' 
                      : user.status === 'blocked'
                      ? 'Заблокирован'
                      : 'Ожидает'}
                  </span>
                </TableCell>
                <TableCell>{user.balance.toLocaleString('ru-RU')} ₽</TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell>{user.ip}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewUser(user)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Просмотр
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Редактировать
                      </DropdownMenuItem>
                      {user.status === 'active' ? (
                        <DropdownMenuItem 
                          className="text-red-500"
                          onClick={() => handleToggleBlock(user)}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Заблокировать
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          className="text-green-500"
                          onClick={() => handleToggleBlock(user)}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Разблокировать
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Модальное окно просмотра пользователя */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Информация о пользователе</DialogTitle>
            <DialogDescription>
              Подробная информация о пользователе
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {selectedUser.id}</p>
                </div>
              </div>
              
              <div className="grid gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedUser.email}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Роль: {selectedUser.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Баланс: {selectedUser.balance.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Последний вход: {selectedUser.lastLogin}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    IP: {selectedUser.ip}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedUser.status === 'active' 
                    ? 'bg-green-500/10 text-green-500'
                    : selectedUser.status === 'blocked'
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {selectedUser.status === 'active' 
                    ? 'Активен' 
                    : selectedUser.status === 'blocked'
                    ? 'Заблокирован'
                    : 'Ожидает'}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальное окно редактирования пользователя */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
            <DialogDescription>
              Измените информацию о пользователе
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Имя</Label>
              <Input
                id="edit-name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Введите имя"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Введите email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Роль</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Админ</SelectItem>
                  <SelectItem value="user">Пользователь</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Статус</Label>
              <Select
                value={newUser.status}
                onValueChange={(value) => setNewUser({ ...newUser, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="blocked">Заблокирован</SelectItem>
                  <SelectItem value="pending">Ожидает</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-balance">Баланс</Label>
              <Input
                id="edit-balance"
                type="number"
                value={newUser.balance}
                onChange={(e) => setNewUser({ ...newUser, balance: Number(e.target.value) })}
                placeholder="Введите баланс"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-ip">IP</Label>
              <Input
                id="edit-ip"
                value={newUser.ip}
                onChange={(e) => setNewUser({ ...newUser, ip: e.target.value })}
                placeholder="Введите IP"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveEdit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersTable; 
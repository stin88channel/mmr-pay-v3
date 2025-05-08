import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash, Download } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';

// Временные данные для демонстрации
const mockNews = [
  {
    id: 1,
    title: 'Обновление системы',
    content: 'Мы обновили интерфейс системы для более удобной работы с заявками.',
    status: 'published',
    date: '2024-03-15',
    views: 150,
  },
  {
    id: 2,
    title: 'Новые способы вывода',
    content: 'Добавлены новые способы вывода средств через СБП и криптовалюты.',
    status: 'draft',
    date: '2024-03-14',
    views: 0,
  },
  {
    id: 3,
    title: 'Изменение комиссий',
    content: 'С 1 апреля изменяются комиссии за вывод средств.',
    status: 'published',
    date: '2024-03-13',
    views: 320,
  },
  {
    id: 4,
    title: 'Технические работы',
    content: 'Запланированы технические работы 20 марта с 02:00 до 04:00 МСК.',
    status: 'published',
    date: '2024-03-12',
    views: 280,
  },
];

const NewsManager: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [news, setNews] = useState(mockNews);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [newNews, setNewNews] = useState({
    title: '',
    content: '',
    status: 'draft',
  });

  const filteredNews = news.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddNews = () => {
    if (!newNews.title || !newNews.content) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    const newId = Math.max(...news.map(n => n.id)) + 1;
    const today = new Date().toISOString().split('T')[0];
    
    const newsItem = {
      ...newNews,
      id: newId,
      date: today,
      views: 0,
    };

    setNews([...news, newsItem]);
    setNewNews({
      title: '',
      content: '',
      status: 'draft',
    });
    setIsDialogOpen(false);

    toast({
      title: "Успешно",
      description: "Новость добавлена",
    });
  };

  const handleView = (newsItem: any) => {
    setSelectedNews(newsItem);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (newsItem: any) => {
    setSelectedNews(newsItem);
    setNewNews({
      title: newsItem.title,
      content: newsItem.content,
      status: newsItem.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!newNews.title || !newNews.content) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    setNews(news.map(item => 
      item.id === selectedNews.id 
        ? { ...item, ...newNews }
        : item
    ));

    setIsEditDialogOpen(false);
    toast({
      title: "Успешно",
      description: "Новость обновлена",
    });
  };

  const handleDelete = (id: number) => {
    setNews(news.filter(item => item.id !== id));
    toast({
      title: "Успешно",
      description: "Новость удалена",
    });
  };

  const handleExportExcel = () => {
    const headers = ['ID', 'Заголовок', 'Содержание', 'Статус', 'Дата', 'Просмотры'];
    const data = filteredNews.map(news => [
      news.id,
      news.title,
      news.content,
      news.status === 'published' ? 'Опубликовано' : 'Черновик',
      news.date,
      news.views
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Новости');
    XLSX.writeFile(wb, 'news.xlsx');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Заголовок', 'Содержание', 'Статус', 'Дата', 'Просмотры'];
    const data = filteredNews.map(news => [
      news.id,
      news.title,
      news.content,
      news.status === 'published' ? 'Опубликовано' : 'Черновик',
      news.date,
      news.views
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'news.csv';
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по заголовку или содержанию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="published">Опубликовано</SelectItem>
              <SelectItem value="draft">Черновик</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel}>
                <Download className="mr-2 h-4 w-4" />
                Экспорт в Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Экспорт в CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Создать
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать новость</DialogTitle>
                <DialogDescription>
                  Заполните информацию о новой новости
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Заголовок</Label>
                  <Input
                    id="title"
                    value={newNews.title}
                    onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                    placeholder="Введите заголовок"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Содержание</Label>
                  <Textarea
                    id="content"
                    value={newNews.content}
                    onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                    placeholder="Введите содержание новости"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Статус</Label>
                  <Select
                    value={newNews.status}
                    onValueChange={(value) => setNewNews({ ...newNews, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Опубликовать</SelectItem>
                      <SelectItem value="draft">Сохранить как черновик</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddNews}>Создать</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredNews.map((news) => (
          <Card key={news.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">{news.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {news.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{news.date}</span>
                    <span>•</span>
                    <span>{news.views} просмотров</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      news.status === 'published' 
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {news.status === 'published' ? 'Опубликовано' : 'Черновик'}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(news)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Просмотр
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(news)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Редактировать
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-500"
                      onClick={() => handleDelete(news.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Диалог просмотра новости */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNews?.title}</DialogTitle>
            <DialogDescription>
              {selectedNews?.date} • {selectedNews?.views} просмотров
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="whitespace-pre-wrap">{selectedNews?.content}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования новости */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать новость</DialogTitle>
            <DialogDescription>
              Измените информацию о новости
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Заголовок</Label>
              <Input
                id="edit-title"
                value={newNews.title}
                onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                placeholder="Введите заголовок"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-content">Содержание</Label>
              <Textarea
                id="edit-content"
                value={newNews.content}
                onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                placeholder="Введите содержание"
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Статус</Label>
              <Select
                value={newNews.status}
                onValueChange={(value) => setNewNews({ ...newNews, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Опубликовать</SelectItem>
                  <SelectItem value="draft">Сохранить как черновик</SelectItem>
                </SelectContent>
              </Select>
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

export default NewsManager; 
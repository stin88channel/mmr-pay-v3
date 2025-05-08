import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PlusCircle, Copy, CreditCard, FileSpreadsheet, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RequisitesTable from '@/components/requisites/RequisitesTable';
import AddEditRequisiteForm from '@/components/requisites/AddEditRequisiteForm';
import { useNavigate, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { motion } from 'framer-motion';
import { RequisiteType } from '@/types/requisite';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

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

const Requisites: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("table");
  const [requisites, setRequisites] = useState<RequisiteType[]>(() => {
    const savedRequisites = localStorage.getItem('requisites');
    return savedRequisites ? JSON.parse(savedRequisites) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('requisites', JSON.stringify(requisites));
  }, [requisites]);

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path) {
      switch (path) {
        case 'bank-accounts':
          setActiveTab('bank');
          break;
        case 'cards':
          setActiveTab('cards');
          break;
        case 'sbp':
          setActiveTab('sbp');
          break;
        case 'transgran':
          setActiveTab('transgran');
          break;
        case 'add':
          setActiveTab('add');
          break;
        default:
          setActiveTab('table');
      }
    }
  }, [location]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    switch (value) {
      case 'bank':
        navigate('/requisites/bank-accounts');
        break;
      case 'cards':
        navigate('/requisites/cards');
        break;
      case 'sbp':
        navigate('/requisites/sbp');
        break;
      case 'transgran':
        navigate('/requisites/transgran');
        break;
      case 'add':
        navigate('/requisites/add');
        break;
      default:
        navigate('/requisites');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано!',
      description: `${label} скопированы в буфер обмена`,
    });
  };

  const handleExportData = (format: 'xlsx' | 'csv') => {
    try {
      // Получаем данные из таблицы реквизитов
      const requisites = document.querySelectorAll('tbody tr');
      const data: any[] = [];

      requisites.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 7) {
          data.push({
            'ID': cells[0].textContent,
            'Банк': cells[1].textContent,
            'Реквизиты': cells[2].textContent,
            'ФИО': cells[3].textContent,
            'Лимиты': cells[4].textContent,
            'Оборот': cells[5].textContent,
            'Статус': cells[6].textContent,
          });
        }
      });

      if (data.length === 0) {
        toast({
          title: 'Ошибка экспорта',
          description: 'Нет данных для экспорта',
          variant: 'destructive',
        });
        return;
      }

      // Создаем рабочую книгу Excel
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Реквизиты');

      // Генерируем файл
      const excelBuffer = XLSX.write(workbook, { bookType: format, type: 'array' });
      const blob = new Blob([excelBuffer], { 
        type: format === 'xlsx' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'text/csv;charset=utf-8' 
      });

      // Сохраняем файл
      const fileName = `requisites_${new Date().toISOString().split('T')[0]}.${format}`;
      saveAs(blob, fileName);

      toast({
        title: 'Экспорт успешен',
        description: `Данные экспортированы в формате ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      toast({
        title: 'Ошибка экспорта',
        description: 'Произошла ошибка при экспорте данных',
        variant: 'destructive',
      });
    }
  };

  const handleAddRequisite = () => {
    setActiveTab("add");
  };

  const handleRequisiteSuccess = (newRequisite: RequisiteType) => {
    setRequisites(prev => [...prev, newRequisite]);
    setActiveTab('table');
    navigate('/requisites');
    toast({
      title: 'Реквизит добавлен',
      description: 'Новый реквизит успешно добавлен в систему',
    });
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
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold mb-2">Реквизиты</h1>
          <p className="text-muted-foreground">Управление платежными реквизитами</p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap gap-2"
        >
          <Button 
            variant="outline" 
            onClick={() => handleExportData('xlsx')}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet size={16} />
            Экспорт в Excel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExportData('csv')}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet size={16} />
            Экспорт в CSV
          </Button>
          <Button 
            onClick={() => handleAddRequisite()}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Добавить реквизит
          </Button>
        </motion.div>
      </motion.div>
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <motion.div variants={item}>
            <TabsList className="grid w-full max-w-6xl grid-cols-6">
              <TabsTrigger value="table">Таблица реквизитов</TabsTrigger>
              <TabsTrigger value="bank" className="flex items-center gap-2">
                <span>Банковские счета</span>
                <TooltipProvider>
                  <Tooltip>
                    <div className="cursor-help">
                      <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.1 }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                      >
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    </div>
                    <TooltipContent>
                      <div className="p-2">
                        <div className="text-sm font-medium mb-2">Пример отображения:</div>
                        <div className="text-xs space-y-1">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <div className="font-medium">ID:</div>
                            <div>REQ-1001</div>
                            <div className="font-medium">Банк:</div>
                            <div>Сбербанк</div>
                            <div className="font-medium">Номер:</div>
                            <div>4081 7810 XXXX XXXX</div>
                            <div className="font-medium">ФИО:</div>
                            <div>Иванов И.И.</div>
                            <div className="font-medium">Лимит:</div>
                            <div>500 000 ₽</div>
                            <div className="font-medium">Статус:</div>
                            <div>Активен</div>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsTrigger>
              <TabsTrigger value="cards" className="flex items-center gap-2">
                <span>Карты</span>
                <TooltipProvider>
                  <Tooltip>
                    <div className="cursor-help">
                      <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.1 }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                      >
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    </div>
                    <TooltipContent>
                      <div className="p-2">
                        <div className="text-sm font-medium mb-2">Пример отображения:</div>
                        <div className="text-xs space-y-1">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <div className="font-medium">ID:</div>
                            <div>CARD-1001</div>
                            <div className="font-medium">Банк:</div>
                            <div>Тинькофф</div>
                            <div className="font-medium">Номер:</div>
                            <div>XXXX XXXX XXXX 1234</div>
                            <div className="font-medium">ФИО:</div>
                            <div>Иванов И.И.</div>
                            <div className="font-medium">Лимит:</div>
                            <div>300 000 ₽</div>
                            <div className="font-medium">Статус:</div>
                            <div>Активна</div>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsTrigger>
              <TabsTrigger value="sbp" className="flex items-center gap-2">
                <span>СБП</span>
                <TooltipProvider>
                  <Tooltip>
                    <div className="cursor-help">
                      <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.1 }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                      >
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    </div>
                    <TooltipContent>
                      <div className="p-2">
                        <div className="text-sm font-medium mb-2">Пример отображения:</div>
                        <div className="text-xs space-y-1">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <div className="font-medium">ID:</div>
                            <div>SBP-1001</div>
                            <div className="font-medium">Банк:</div>
                            <div>Сбербанк</div>
                            <div className="font-medium">Телефон:</div>
                            <div>+7 (XXX) XXX-XX-XX</div>
                            <div className="font-medium">ФИО:</div>
                            <div>Иванов И.И.</div>
                            <div className="font-medium">Лимит:</div>
                            <div>100 000 ₽</div>
                            <div className="font-medium">Статус:</div>
                            <div>Активен</div>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsTrigger>
              <TabsTrigger value="transgran" className="flex items-center gap-2">
                <span>Трансгран</span>
                <TooltipProvider>
                  <Tooltip>
                    <div className="cursor-help">
                      <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.1 }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                      >
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    </div>
                    <TooltipContent>
                      <div className="p-2">
                        <div className="text-sm font-medium mb-2">Пример отображения:</div>
                        <div className="text-xs space-y-1">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <div className="font-medium">ID:</div>
                            <div>TR-1001</div>
                            <div className="font-medium">Банк:</div>
                            <div>Bank of America</div>
                            <div className="font-medium">SWIFT:</div>
                            <div>BOFAUS3N</div>
                            <div className="font-medium">IBAN:</div>
                            <div>XX00 XXXX XXXX XXXX</div>
                            <div className="font-medium">Лимит:</div>
                            <div>10 000 $</div>
                            <div className="font-medium">Статус:</div>
                            <div>Активен</div>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsTrigger>
              <TabsTrigger value="add">Добавить</TabsTrigger>
            </TabsList>
          </motion.div>
          
          <motion.div variants={item}>
            <TabsContent value="bank" className="space-y-4 mt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                key={activeTab}
              >
                {requisites.filter(r => r.category === 'personal').length > 0 ? (
                  <RequisitesTable 
                    requisites={requisites.filter(r => r.category === 'personal')} 
                    onRequisitesChange={setRequisites}
                  />
                ) : (
                  <>
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <div className="text-center space-y-2">
                          <p className="text-lg font-medium">У вас пока нет банковских счетов</p>
                          <p className="text-sm text-muted-foreground">Добавьте банковский счет для работы с платежами</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="mt-6">
                      <Button className="w-full sm:w-auto" onClick={handleAddRequisite}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Добавить банковский счет
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            </TabsContent>
          </motion.div>
          
          <motion.div variants={item}>
            <TabsContent value="cards" className="space-y-4 mt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                key={activeTab}
              >
                {requisites.filter(r => r.category === 'business').length > 0 ? (
                  <RequisitesTable 
                    requisites={requisites.filter(r => r.category === 'business')} 
                    onRequisitesChange={setRequisites}
                  />
                ) : (
                  <>
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <div className="text-center space-y-2">
                          <p className="text-lg font-medium">У вас пока нет привязанных карт</p>
                          <p className="text-sm text-muted-foreground">Добавьте банковскую карту для быстрых операций</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="mt-6">
                      <Button className="w-full sm:w-auto" onClick={handleAddRequisite}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Добавить банковскую карту
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            </TabsContent>
          </motion.div>
          
          <motion.div variants={item}>
            <TabsContent value="sbp" className="space-y-4 mt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                key={activeTab}
              >
                {requisites.filter(r => r.category === 'partner').length > 0 ? (
                  <RequisitesTable 
                    requisites={requisites.filter(r => r.category === 'partner')} 
                    onRequisitesChange={setRequisites}
                  />
                ) : (
                  <>
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <div className="text-center space-y-2">
                          <p className="text-lg font-medium">У вас пока нет СБП счетов</p>
                          <p className="text-sm text-muted-foreground">Добавьте СБП счет для быстрых переводов</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="mt-6">
                      <Button className="w-full sm:w-auto" onClick={handleAddRequisite}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Добавить СБП счет
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            </TabsContent>
          </motion.div>

          <motion.div variants={item}>
            <TabsContent value="transgran" className="space-y-4 mt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                key={activeTab}
              >
                {requisites.filter(r => r.category === 'transgran').length > 0 ? (
                  <RequisitesTable 
                    requisites={requisites.filter(r => r.category === 'transgran')} 
                    onRequisitesChange={setRequisites}
                  />
                ) : (
                  <>
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <div className="text-center space-y-2">
                          <p className="text-lg font-medium">У вас пока нет Трансгран счетов</p>
                          <p className="text-sm text-muted-foreground">Добавьте Трансгран счет для международных переводов</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="mt-6">
                      <Button className="w-full sm:w-auto" onClick={handleAddRequisite}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Добавить Трансгран счет
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            </TabsContent>
          </motion.div>
          
          <motion.div variants={item}>
            <TabsContent value="table" className="space-y-4 mt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                key={activeTab}
              >
                <RequisitesTable requisites={requisites} onRequisitesChange={setRequisites} />
              </motion.div>
            </TabsContent>
          </motion.div>
          
          <motion.div variants={item}>
            <TabsContent value="add" className="space-y-4 mt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                key={activeTab}
              >
                <AddEditRequisiteForm onSuccess={handleRequisiteSuccess} />
              </motion.div>
            </TabsContent>
          </motion.div>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default Requisites;

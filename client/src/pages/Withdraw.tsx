import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useBalance } from '@/contexts/BalanceContext';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

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

const tabVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

const Withdraw: React.FC = () => {
  const { balance, balanceVisible, setBalance } = useBalance();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("card");

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && ['card', 'account', 'other'].includes(path)) {
      setActiveTab(path);
    } else {
      setActiveTab('card');
      navigate('/withdraw/card', { replace: true });
    }
  }, [location, navigate]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/withdraw/${value}`);
  };
  
  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast({
        title: "Ошибка",
        description: "Введите корректную сумму",
        variant: "destructive",
      });
      return;
    }
    
    if (withdrawAmount > balance) {
      toast({
        title: "Недостаточно средств",
        description: "На вашем балансе недостаточно средств для вывода",
        variant: "destructive",
      });
      return;
    }
    
    setBalance(balance - withdrawAmount);
    setAmount('');
    toast({
      title: "Заявка на вывод создана",
      description: `Сумма ${withdrawAmount.toLocaleString('ru-RU')} ₽ будет выведена в ближайшее время`,
    });
  };
  
  const formatBalance = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
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
        <h1 className="text-2xl font-bold mb-2">Вывод средств</h1>
        <p className="text-muted-foreground">Вывод средств с баланса на банковский счет или карту</p>
      </motion.div>
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={item} className="md:col-span-2">
          <Card>
          <CardHeader>
            <CardTitle>Создать заявку на вывод</CardTitle>
            <CardDescription>Укажите сумму и способ вывода средств</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="card">Карта</TabsTrigger>
                <TabsTrigger value="account">Счёт</TabsTrigger>
                <TabsTrigger value="other">Другое</TabsTrigger>
              </TabsList>
              
                <div className="mt-4">
                  <AnimatePresence initial={false} mode="wait">
                    <motion.div
                      key={activeTab}
                      variants={tabVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.15 }}
                    >
                      <TabsContent value="card" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card">Выберите карту</Label>
                  <Select>
                    <SelectTrigger id="card">
                      <SelectValue placeholder="Выберите карту" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visa">**** **** **** 4567 (Visa)</SelectItem>
                      <SelectItem value="mastercard">**** **** **** 8901 (MasterCard)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Сумма вывода</Label>
                  <div className="relative">
                    <Input 
                      id="amount" 
                      type="number" 
                      placeholder="Введите сумму" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      ₽
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Комиссия:</span>
                  <span>0 ₽</span>
                </div>
                
                <div className="flex justify-between font-medium">
                  <span>К получению:</span>
                  <span>{amount ? `${parseFloat(amount).toLocaleString('ru-RU')} ₽` : '0 ₽'}</span>
                </div>
              </TabsContent>
              
                      <TabsContent value="account" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account">Выберите счёт</Label>
                  <Select>
                    <SelectTrigger id="account">
                      <SelectValue placeholder="Выберите счёт" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sber">Сбербанк (*3622)</SelectItem>
                      <SelectItem value="tinkoff">Тинькофф (*7890)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount-account">Сумма вывода</Label>
                  <div className="relative">
                    <Input 
                      id="amount-account" 
                      type="number" 
                      placeholder="Введите сумму" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      ₽
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Комиссия:</span>
                  <span>0 ₽</span>
                </div>
                
                <div className="flex justify-between font-medium">
                  <span>К получению:</span>
                  <span>{amount ? `${parseFloat(amount).toLocaleString('ru-RU')} ₽` : '0 ₽'}</span>
                </div>
              </TabsContent>
              
                      <TabsContent value="other" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-system">Платёжная система</Label>
                  <Select>
                    <SelectTrigger id="payment-system">
                      <SelectValue placeholder="Выберите систему" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qiwi">QIWI</SelectItem>
                      <SelectItem value="webmoney">WebMoney</SelectItem>
                      <SelectItem value="yoomoney">ЮMoney</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="wallet">Номер кошелька</Label>
                  <Input id="wallet" placeholder="Введите номер кошелька" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount-other">Сумма вывода</Label>
                  <div className="relative">
                    <Input 
                      id="amount-other" 
                      type="number" 
                      placeholder="Введите сумму" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      ₽
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Комиссия:</span>
                  <span>1.5%</span>
                </div>
                
                <div className="flex justify-between font-medium">
                  <span>К получению:</span>
                          <span>{amount ? `${(parseFloat(amount) * 0.985).toLocaleString('ru-RU')} ₽` : '0 ₽'}</span>
                        </div>
                      </TabsContent>
                    </motion.div>
                  </AnimatePresence>
                </div>
            </Tabs>
          </CardContent>
          <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleWithdraw}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Вывести средства
              </Button>
          </CardFooter>
        </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Информация</CardTitle>
              <CardDescription>Детали вывода средств</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Доступно для вывода:</span>
                  <span className="font-medium">{formatBalance(balance)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Минимальная сумма:</span>
                  <span>1 000 ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Максимальная сумма:</span>
                  <span>100 000 ₽</span>
              </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Сроки зачисления:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Карты: до 5 минут</li>
                  <li>• Счета: до 1 рабочего дня</li>
                  <li>• Электронные кошельки: до 15 минут</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Withdraw;

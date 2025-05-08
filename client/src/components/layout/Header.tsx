import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, History, Wallet, CreditCard, PiggyBank, LineChart } from 'lucide-react';
import { useBalance } from '@/contexts/BalanceContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DepositModal from '../deposit/DepositModal';

const Header: React.FC = () => {
  const { balanceVisible, toggleBalance, balance } = useBalance();
  const [isBalanceMenuOpen, setIsBalanceMenuOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  
  const formatBalance = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <header className="bg-card shadow-sm border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <div className="font-bold text-xl text-primary flex items-center gap-1">
            <span className="text-2xl">₽</span>
            <span className="hidden sm:inline">BalanceBlink</span>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          {/* Balance Section */}
          <Popover open={isBalanceMenuOpen} onOpenChange={setIsBalanceMenuOpen}>
            <PopoverTrigger asChild>
              <div className="relative min-w-[140px] font-semibold text-left flex items-center justify-between border rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer">
                <span className="truncate">
                  {balanceVisible ? formatBalance(balance) : '••••••• ₽'}
                </span>
                <div 
                  className="h-4 w-4 opacity-70 hover:opacity-100 cursor-pointer" 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBalance();
                  }}
                >
                  {balanceVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="end">
              <Card className="border-0 shadow-none">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Общий баланс</span>
                    <span className="font-semibold text-lg">
                      {balanceVisible ? formatBalance(balance) : '••••••• ₽'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Доступно</span>
                    <span>{balanceVisible ? formatBalance(balance * 0.98) : '•••••'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Заблокировано</span>
                    <span>{balanceVisible ? formatBalance(balance * 0.02) : '•••••'}</span>
                  </div>
                </div>
                
                <div className="p-4 border-b">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Лимит вывода</span>
                      </div>
                      <span className="text-sm font-medium">- / день</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Комиссия вывода</span>
                      </div>
                      <span className="text-sm font-medium">-</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <PiggyBank className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Бонусный баланс</span>
                      </div>
                      <span className="text-sm font-medium">-</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 divide-x my-6">
                  <Button 
                    variant="ghost" 
                    className="flex flex-col items-center justify-center rounded-none py-3 gap-1 hover:bg-accent min-h-[80px]"
                    onClick={() => {
                      setIsBalanceMenuOpen(false);
                      setIsDepositModalOpen(true);
                    }}
                  >
                    <ArrowUpRight size={18} />
                    <span className="text-xs">Пополнение</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex flex-col items-center justify-center rounded-none py-3 gap-1 hover:bg-accent min-h-[80px]"
                    onClick={() => {
                      setIsBalanceMenuOpen(false);
                      window.location.href = '/withdraw';
                    }}
                  >
                    <ArrowDownLeft size={18} />
                    <span className="text-xs">Вывод</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex flex-col items-center justify-center rounded-none py-3 gap-1 hover:bg-accent min-h-[80px]"
                    onClick={() => {
                      setIsBalanceMenuOpen(false);
                      window.location.href = '/transactions';
                    }}
                  >
                    <History size={18} />
                    <span className="text-xs">История</span>
                  </Button>
                </div>
                
                <div className="p-3 border-t">
                  <Link 
                    to="/analytics" 
                    className="flex items-center justify-center gap-2 text-primary text-sm hover:underline"
                    onClick={() => setIsBalanceMenuOpen(false)}
                  >
                    <LineChart size={14} />
                    <span>Подробная аналитика</span>
                  </Link>
                </div>
              </Card>
            </PopoverContent>
          </Popover>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell />
                <span className="absolute -top-1 -right-1 rounded-full bg-destructive w-4 h-4 text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px]" align="end">
              <DropdownMenuLabel>Уведомления</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-auto">
                {Array.from({ length: 3 }).map((_, i) => (
                  <DropdownMenuItem key={i} className="cursor-pointer py-3">
                    <div className="flex flex-col gap-1">
                      <div className="font-medium">Новое обновление системы</div>
                      <div className="text-xs text-muted-foreground">
                        Мы обновили интерфейс системы для более удобной работы с заявками.
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">2 часа назад</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center text-primary">
                <Link to="/news" className="w-full text-center">Все новости</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>ИП</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Мой профиль</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/profile" className="w-full">Профиль</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/settings" className="w-full">Настройки</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Выйти</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Модальное окно пополнения */}
      <DepositModal open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen} />
    </header>
  );
};

export default Header;

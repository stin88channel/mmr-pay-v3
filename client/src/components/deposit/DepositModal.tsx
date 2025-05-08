
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useBalance } from '@/contexts/BalanceContext';
import { CopyIcon, CheckIcon } from 'lucide-react';

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ open, onOpenChange }) => {
  const [amount, setAmount] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const { toast } = useToast();
  const { balance, setBalance } = useBalance();
  
  // Фиктивный адрес кошелька для TRC20
  const walletAddress = 'TV6MuMXfmLbBqPZvBHdwFsDnQeVfnmiuSi';
  
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Здесь будет код для обработки пополнения
    // В реальном проекте нужно будет интегрировать API для обработки платежей
    
    toast({
      title: "Заявка на пополнение создана",
      description: `Ваш запрос на пополнение ${amount} USDT обрабатывается.`,
    });
    
    // В демо-режиме сразу пополняем счет
    if (amount) {
      // Исправление: получаем текущий баланс из контекста и добавляем к нему новую сумму
      const newBalance = balance + Number(amount) * 90; // Конвертация USDT в рубли по примерному курсу
      setBalance(newBalance); // Передаем непосредственно число
    }
    
    setAmount('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Пополнение через TRC20 (USDT)</DialogTitle>
          <DialogDescription>
            Отправьте USDT на указанный адрес. После подтверждения транзакции ваш баланс будет пополнен.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="wallet">Адрес кошелька:</Label>
            <div className="flex items-center">
              <Input
                id="wallet"
                value={walletAddress}
                readOnly
                className="pr-10 font-mono text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-[-40px]"
                onClick={handleCopyAddress}
              >
                {isCopied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Отправляйте только USDT (TRC20) на этот адрес
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Сумма (USDT):</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Введите сумму"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
              required
            />
            {amount && (
              <p className="text-sm text-muted-foreground">
                ≈ {new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                  minimumFractionDigits: 0,
                }).format(Number(amount) * 90)}
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">Подтвердить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;

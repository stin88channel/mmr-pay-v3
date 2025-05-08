
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

interface FilterMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({ open, onOpenChange }) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Фильтры</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          {/* ID Filter */}
          <div className="space-y-2">
            <Label htmlFor="request-id">ID заявки</Label>
            <Input id="request-id" placeholder="Введите ID заявки" />
          </div>
          
          {/* Amount Range Filter */}
          <div className="space-y-2">
            <Label>Сумма</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="min-amount" className="text-xs text-muted-foreground">От</Label>
                <Input id="min-amount" type="number" placeholder="0" />
              </div>
              <div className="flex-1">
                <Label htmlFor="max-amount" className="text-xs text-muted-foreground">До</Label>
                <Input id="max-amount" type="number" placeholder="1000000" />
              </div>
            </div>
          </div>
          
          {/* Date Filter */}
          <div className="space-y-2">
            <Label>Дата</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: ru }) : "Выберите дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Payment Method Filter */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Способ оплаты</Label>
            <Select>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Выберите способ оплаты" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="card">Карта</SelectItem>
                  <SelectItem value="sbp">СБП</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {/* Status Filter */}
          <div className="space-y-3">
            <Label>Статус</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'active', label: 'Активные' },
                { id: 'checking', label: 'На проверке' },
                { id: 'closed', label: 'Закрытые' },
                { id: 'cancelled', label: 'Отмененные' }
              ].map((status) => (
                <div key={status.id} className="flex items-center space-x-2">
                  <Checkbox id={`status-${status.id}`} />
                  <Label htmlFor={`status-${status.id}`} className="font-normal">
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <SheetFooter>
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Сбросить
            </Button>
            <Button className="flex-1" onClick={() => onOpenChange(false)}>
              Применить
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default FilterMenu;

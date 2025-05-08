import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { RequisiteType } from '@/types/requisite';

// Validation schema for requisite form
const requisiteFormSchema = z.object({
  method: z.enum(["sbp", "card", "transgran", "bank"], {
    required_error: "Пожалуйста, выберите метод.",
  }),
  bank: z.string().min(2, { message: "Название банка должно содержать не менее 2 символов." }),
  requisites: z.string().min(1, { message: "Пожалуйста, введите реквизиты." }),
  fullName: z.string().min(5, { message: "ФИО должно содержать не менее 5 символов." }),
  dailyLimit: z.coerce.number().positive({ message: "Дневной лимит должен быть положительным числом." }),
  monthlyLimit: z.coerce.number().positive({ message: "Месячный лимит должен быть положительным числом." }),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type RequisiteFormValues = z.infer<typeof requisiteFormSchema>;

// Default values for the form
const defaultValues: Partial<RequisiteFormValues> = {
  method: "bank",
  bank: "",
  requisites: "",
  fullName: "",
  dailyLimit: 100000,
  monthlyLimit: 1000000,
  description: "",
  isActive: true,
};

interface AddEditRequisiteFormProps {
  onSuccess?: (requisite: RequisiteType) => void;
  initialData?: RequisiteType;
}

const AddEditRequisiteForm: React.FC<AddEditRequisiteFormProps> = ({ onSuccess, initialData }) => {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<"sbp" | "card" | "transgran" | "bank">(
    initialData?.category === 'partner' ? 'sbp' :
    initialData?.category === 'business' ? 'card' :
    initialData?.category === 'personal' ? 'bank' : 'bank'
  );
  
  // Initialize form with default values and validation schema
  const form = useForm<RequisiteFormValues>({
    resolver: zodResolver(requisiteFormSchema),
    defaultValues: initialData ? {
      method: selectedMethod,
      bank: initialData.bank,
      requisites: initialData.requisites,
      fullName: initialData.fullName,
      dailyLimit: initialData.limits.daily,
      monthlyLimit: initialData.limits.monthly,
      description: initialData.description,
      isActive: initialData.isActive,
    } : defaultValues,
  });

  // Handle form submission
  const onSubmit = (data: RequisiteFormValues) => {
    const newRequisite: RequisiteType = {
      id: initialData?.id || `REQ-${Date.now()}`,
      bank: data.bank,
      requisites: data.requisites,
      fullName: data.fullName,
      limits: {
        daily: data.dailyLimit,
        monthly: data.monthlyLimit,
      },
      turnover: initialData?.turnover || 0,
      isActive: data.isActive,
      description: data.description,
      category: data.method === 'sbp' ? 'partner' :
                data.method === 'card' ? 'business' :
                data.method === 'transgran' ? 'transgran' :
                'personal',
      verification: 'pending',
      createdAt: initialData?.createdAt || new Date(),
      lastUsed: initialData?.lastUsed,
    };

    toast({
      title: initialData ? "Реквизит обновлен" : "Реквизит добавлен",
      description: "Реквизит успешно сохранен в системе.",
    });

    onSuccess?.(newRequisite);
    if (!initialData) {
      form.reset();
    }
  };

  const getRequisitePlaceholder = (method: string) => {
    switch (method) {
      case "sbp":
        return "Введите номер телефона";
      case "card":
        return "XXXX XXXX XXXX XXXX";
      case "transgran":
        return "Введите SWIFT/IBAN";
      case "bank":
      default:
        return "4081 7810 XXXX XXXX XXXX";
    }
  };

  const getRequisiteDescription = (method: string) => {
    switch (method) {
      case "sbp":
        return "Введите номер телефона для СБП";
      case "card":
        return "Введите номер карты";
      case "transgran":
        return "Введите SWIFT/IBAN для международных переводов";
      case "bank":
      default:
        return "Формат: XXXX XXXX XXXX XXXX XXXX";
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Метод</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedMethod(value as "sbp" | "card" | "transgran" | "bank");
                      }} 
                      defaultValue={field.value}
                      disabled={!!initialData}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите метод" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sbp">СБП</SelectItem>
                        <SelectItem value="card">Карта</SelectItem>
                        <SelectItem value="transgran">Трансгран</SelectItem>
                        <SelectItem value="bank">Банковские счета</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Выберите тип реквизитов.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название банка</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Сбербанк" 
                        {...field} 
                        autoFocus={false}
                      />
                    </FormControl>
                    <FormDescription>
                      Введите полное название банка.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="requisites"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Реквизиты</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={getRequisitePlaceholder(selectedMethod)} 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      {getRequisiteDescription(selectedMethod)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ФИО</FormLabel>
                    <FormControl>
                      <Input placeholder="Иванов Иван Иванович" {...field} />
                    </FormControl>
                    <FormDescription>
                      Полное ФИО владельца реквизитов.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dailyLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дневной лимит (₽)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Максимальная сумма транзакций в день.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="monthlyLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Месячный лимит (₽)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Максимальная сумма транзакций в месяц.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Дополнительная информация о реквизитах..."
                          className="resize-none min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Необязательное поле для дополнительной информации.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Активность
                        </FormLabel>
                        <FormDescription>
                          Включите, чтобы реквизит был доступен для использования.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="submit">
                {initialData ? 'Сохранить изменения' : 'Добавить реквизит'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddEditRequisiteForm;


import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyIcon, CheckIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className={`language-${language} rounded-md bg-muted p-4 overflow-x-auto`}>
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3"
        onClick={copyToClipboard}
      >
        {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
      </Button>
    </div>
  );
};

const EndpointCard = ({ 
  title, 
  method, 
  endpoint, 
  description, 
  requestExample,
  responseExample
}: { 
  title: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  requestExample?: string;
  responseExample: string;
}) => {
  const methodColors = {
    GET: 'bg-green-100 text-green-800',
    POST: 'bg-blue-100 text-blue-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800',
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge className={methodColors[method]}>{method}</Badge>
        </div>
        <CardDescription>
          <div className="font-mono text-sm bg-muted p-2 rounded-md my-2">{endpoint}</div>
          <div>{description}</div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {requestExample && (
          <div>
            <h4 className="text-sm font-medium mb-2">Запрос</h4>
            <CodeBlock code={requestExample} language="json" />
          </div>
        )}
        <div>
          <h4 className="text-sm font-medium mb-2">Ответ</h4>
          <CodeBlock code={responseExample} language="json" />
        </div>
      </CardContent>
    </Card>
  );
};

const ApiDocs: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">API документация</h1>
        <p className="text-muted-foreground">Используйте наше API для интеграции платежей в свои приложения</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Начало работы</CardTitle>
          <CardDescription>
            Для использования API вам понадобится ключ аутентификации.
            Ключ можно получить в разделе настройки / API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="font-medium">Базовый URL</h3>
          <CodeBlock code="https://api.payment-platform.com/v1" language="text" />
          
          <h3 className="font-medium">Аутентификация</h3>
          <p>Добавляйте ключ API в заголовок каждого запроса:</p>
          <CodeBlock code='Authorization: Bearer YOUR_API_KEY' language="text" />
        </CardContent>
      </Card>

      <Tabs defaultValue="payments">
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger value="payments">Платежи</TabsTrigger>
          <TabsTrigger value="customers">Клиенты</TabsTrigger>
          <TabsTrigger value="webhooks">Вебхуки</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="mt-0">
          <EndpointCard
            title="Создание платежа"
            method="POST"
            endpoint="/payments"
            description="Создает новый платеж и возвращает URL для оплаты"
            requestExample={`{
  "amount": 1500,
  "currency": "RUB",
  "description": "Оплата заказа №123",
  "customer_id": "cust_1234567890",
  "return_url": "https://example.com/success"
}`}
            responseExample={`{
  "id": "pay_28n4j2nfi2n4",
  "status": "pending",
  "amount": 1500,
  "currency": "RUB", 
  "payment_url": "https://payment-platform.com/pay/28n4j2nfi2n4",
  "created_at": "2023-05-15T14:23:45Z"
}`}
          />
          
          <EndpointCard
            title="Получение информации о платеже"
            method="GET"
            endpoint="/payments/{payment_id}"
            description="Возвращает подробную информацию о платеже"
            responseExample={`{
  "id": "pay_28n4j2nfi2n4",
  "status": "completed",
  "amount": 1500,
  "fee": 45,
  "net": 1455,
  "currency": "RUB",
  "description": "Оплата заказа №123",
  "customer": {
    "id": "cust_1234567890",
    "email": "customer@example.com"
  },
  "payment_method": "card",
  "card": {
    "last4": "4242",
    "brand": "Visa"
  },
  "created_at": "2023-05-15T14:23:45Z",
  "completed_at": "2023-05-15T14:25:12Z"
}`}
          />
          
          <EndpointCard
            title="Отмена платежа"
            method="POST"
            endpoint="/payments/{payment_id}/cancel"
            description="Отменяет платеж, который еще не был обработан"
            responseExample={`{
  "id": "pay_28n4j2nfi2n4",
  "status": "cancelled",
  "cancelled_at": "2023-05-15T14:30:22Z"
}`}
          />
        </TabsContent>
        
        <TabsContent value="customers" className="mt-0">
          <EndpointCard
            title="Создание клиента"
            method="POST"
            endpoint="/customers"
            description="Регистрирует нового клиента в системе"
            requestExample={`{
  "email": "customer@example.com",
  "name": "Иван Петров",
  "phone": "+7 999 123 4567",
  "metadata": {
    "user_id": "12345"
  }
}`}
            responseExample={`{
  "id": "cust_9h7g6f5e4d",
  "email": "customer@example.com",
  "name": "Иван Петров",
  "phone": "+7 999 123 4567",
  "created_at": "2023-05-15T10:11:12Z"
}`}
          />
          
          <EndpointCard
            title="Получение списка клиентов"
            method="GET"
            endpoint="/customers"
            description="Возвращает список клиентов с пагинацией"
            responseExample={`{
  "data": [
    {
      "id": "cust_9h7g6f5e4d",
      "email": "customer@example.com",
      "name": "Иван Петров",
      "created_at": "2023-05-15T10:11:12Z"
    },
    {
      "id": "cust_8g7f6e5d4c",
      "email": "another@example.com",
      "name": "Петр Иванов",
      "created_at": "2023-05-14T09:10:11Z"
    }
  ],
  "meta": {
    "total": 42,
    "current_page": 1,
    "per_page": 10,
    "last_page": 5
  }
}`}
          />
        </TabsContent>
        
        <TabsContent value="webhooks" className="mt-0">
          <EndpointCard
            title="Регистрация вебхука"
            method="POST"
            endpoint="/webhooks"
            description="Регистрирует URL для получения уведомлений о событиях"
            requestExample={`{
  "url": "https://example.com/webhook",
  "events": ["payment.completed", "payment.failed"],
  "secret": "whsec_your_webhook_secret"
}`}
            responseExample={`{
  "id": "wh_1n2m3b4v5c6x7z",
  "url": "https://example.com/webhook",
  "events": ["payment.completed", "payment.failed"],
  "created_at": "2023-05-15T12:13:14Z",
  "active": true
}`}
          />
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Формат вебхук уведомлений</CardTitle>
              <CardDescription>
                Когда происходит событие, на указанный URL отправляется HTTP POST запрос со следующей структурой
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock code={`{
  "id": "evt_1a2b3c4d5e",
  "type": "payment.completed",
  "created": "2023-05-15T14:25:12Z",
  "data": {
    "object": {
      "id": "pay_28n4j2nfi2n4",
      "status": "completed",
      "amount": 1500,
      "currency": "RUB",
      "description": "Оплата заказа №123"
      // ... другие поля платежа
    }
  }
}`} language="json" />

              <div className="mt-4">
                <h4 className="font-medium mb-2">Верификация вебхука</h4>
                <p className="text-muted-foreground mb-2">
                  Для проверки подлинности вебхука используйте заголовок Signature:
                </p>
                <CodeBlock code="X-Signature: t=1683555234,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd" language="text" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiDocs;

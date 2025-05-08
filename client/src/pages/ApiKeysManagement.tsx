
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Key, RotateCw, Copy, Eye, EyeOff, Plus, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsed: string;
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
  permissions: string[];
}

const generateMockApiKeys = (): ApiKey[] => {
  return [
    {
      id: 'key_live_1',
      name: 'Production API Key',
      key: 'sk_live_51KjG7hC2DZrFYn6Z8bLxNiQqP9DhOWJlMnbYVz',
      lastUsed: '02.05.2025',
      createdAt: '15.01.2025',
      expiresAt: '15.01.2026',
      isActive: true,
      permissions: ['read', 'write'],
    },
    {
      id: 'key_test_1',
      name: 'Test Environment Key',
      key: 'sk_test_51KjG7hC2DZrFYn6Z8bLxNiQqP9DhOWJlMnV93',
      lastUsed: '01.05.2025',
      createdAt: '20.02.2025',
      expiresAt: null,
      isActive: true,
      permissions: ['read'],
    },
    {
      id: 'key_dev_1',
      name: 'Development Key',
      key: 'sk_dev_51KjG7hC2DZrFYn6Z8bLxNiQqP9DhOWJlMnbH1',
      lastUsed: '28.04.2025',
      createdAt: '10.03.2025',
      expiresAt: '10.06.2025',
      isActive: false,
      permissions: ['read', 'write', 'delete'],
    }
  ];
};

const ApiKeysManagement: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(generateMockApiKeys());
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['read']);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleToggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: 'Ключ скопирован',
      description: 'API ключ скопирован в буфер обмена'
    });
  };

  const handleToggleKeyStatus = (keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, isActive: !key.isActive } : key
    ));
    
    const key = apiKeys.find(k => k.id === keyId);
    if (key) {
      toast({
        title: key.isActive ? 'Ключ деактивирован' : 'Ключ активирован',
        description: `API ключ "${key.name}" ${key.isActive ? 'деактивирован' : 'активирован'}`
      });
    }
  };

  const handleRotateKey = (keyId: string) => {
    const newKey = `sk_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { 
        ...key, 
        key: newKey,
        lastUsed: new Date().toLocaleDateString('ru-RU')
      } : key
    ));
    
    toast({
      title: 'Ключ обновлен',
      description: 'API ключ был успешно обновлен'
    });
  };

  const handleCreateNewKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название ключа',
        variant: 'destructive'
      });
      return;
    }
    
    const newKey = `sk_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const newKeyId = `key_${Date.now()}`;
    
    const newApiKey: ApiKey = {
      id: newKeyId,
      name: newKeyName,
      key: newKey,
      lastUsed: 'Никогда',
      createdAt: new Date().toLocaleDateString('ru-RU'),
      expiresAt: null,
      isActive: true,
      permissions: newKeyPermissions,
    };
    
    setApiKeys(prev => [...prev, newApiKey]);
    setNewlyCreatedKey(newKey);
    setNewKeyName('');
    setNewKeyPermissions(['read']);
    
    toast({
      title: 'Новый ключ создан',
      description: 'API ключ успешно создан'
    });
  };

  const formatMaskedKey = (key: string, show: boolean) => {
    if (show) return key;
    return `${key.substring(0, 7)}...${key.substring(key.length - 4)}`;
  };

  const handlePermissionToggle = (permission: string) => {
    setNewKeyPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission) 
        : [...prev, permission]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">API Ключи</h1>
          <p className="text-muted-foreground">Управление доступом к API</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Создать новый ключ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Создать новый API ключ</DialogTitle>
              <DialogDescription>
                API ключи предоставляют доступ к вашим данным через API.
              </DialogDescription>
            </DialogHeader>
            
            {!newlyCreatedKey ? (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label htmlFor="keyName" className="text-sm font-medium">
                    Название ключа
                  </label>
                  <Input
                    id="keyName"
                    placeholder="Например: Production API Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Права доступа
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={newKeyPermissions.includes('read') ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handlePermissionToggle('read')}
                    >
                      Чтение
                    </Badge>
                    <Badge
                      variant={newKeyPermissions.includes('write') ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handlePermissionToggle('write')}
                    >
                      Запись
                    </Badge>
                    <Badge
                      variant={newKeyPermissions.includes('delete') ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handlePermissionToggle('delete')}
                    >
                      Удаление
                    </Badge>
                  </div>
                </div>
                
                <DialogFooter className="sm:justify-end">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleCreateNewKey}>
                    Создать ключ
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-sm font-medium">
                    Ваш новый API ключ (сохраните его, он больше не будет показан)
                  </label>
                  <div className="mt-2 flex items-center gap-2 p-2 bg-muted rounded-md">
                    <code className="text-xs sm:text-sm break-all">{newlyCreatedKey}</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleCopyKey(newlyCreatedKey)}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
                
                <DialogFooter className="sm:justify-end">
                  <Button onClick={() => {
                    setIsDialogOpen(false);
                    setNewlyCreatedKey(null);
                  }}>
                    Готово
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>API ключи</CardTitle>
          <CardDescription>
            Управляйте ключами доступа к API. Не передавайте ключи третьим лицам.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Ключ</TableHead>
                <TableHead>Права</TableHead>
                <TableHead>Создан</TableHead>
                <TableHead>Истекает</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[150px]">
                        {formatMaskedKey(apiKey.key, !!showKeys[apiKey.id])}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleToggleKeyVisibility(apiKey.id)}
                      >
                        {showKeys[apiKey.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleCopyKey(apiKey.key)}
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {apiKey.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission === 'read' ? 'Чтение' : 
                           permission === 'write' ? 'Запись' : 'Удаление'}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{apiKey.createdAt}</TableCell>
                  <TableCell>{apiKey.expiresAt || 'Никогда'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={apiKey.isActive} 
                        onCheckedChange={() => handleToggleKeyStatus(apiKey.id)}
                      />
                      <Badge variant={apiKey.isActive ? 'success' : 'destructive'} className="text-xs">
                        {apiKey.isActive ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleRotateKey(apiKey.id)}
                      title="Обновить ключ"
                    >
                      <RotateCw size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key size={20} />
            Безопасность API
          </CardTitle>
          <CardDescription>
            Рекомендации по безопасному использованию API ключей
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 list-disc pl-5">
            <li>Никогда не храните API ключи в публичном коде или репозиториях</li>
            <li>Регулярно обновляйте ключи для максимальной безопасности</li>
            <li>Используйте разные ключи для разных сред (разработка, тестирование, продакшн)</li>
            <li>Всегда предоставляйте минимальные необходимые права доступа</li>
            <li>При подозрении на компрометацию немедленно обновите ключ</li>
          </ul>
          
          <Separator className="my-4" />
          
          <div>
            <h3 className="font-medium mb-2">Примеры использования</h3>
            <div className="bg-muted p-4 rounded-md overflow-x-auto">
              <pre className="text-xs sm:text-sm">
                <code>{`
// Пример запроса с использованием API ключа
fetch('https://api.example.com/v1/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
.then(response => response.json())
.then(data => console.log(data));
                `}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeysManagement;

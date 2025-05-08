
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">BalanceBlink</h3>
            <p className="text-muted-foreground text-sm">
              Современная платформа для управления финансовыми операциями и обработки платежных заявок.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Контакты</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: support@balanceblink.com</li>
              <li>Телефон: +7 (800) 555-12-34</li>
              <li>Адрес: г. Москва, ул. Финансовая, 42</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Полезные ссылки</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-primary hover:underline">Документация</a></li>
              <li><a href="#" className="text-primary hover:underline">Политика конфиденциальности</a></li>
              <li><a href="#" className="text-primary hover:underline">Условия использования</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} BalanceBlink. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

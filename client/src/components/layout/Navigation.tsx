import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, CreditCard, ArrowDownToLine, Settings, UserRound, LineChart, History, Newspaper, Shield } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/requisites') {
      return location.pathname.startsWith('/requisites');
    }
    if (path === '/withdraw') {
      return location.pathname.startsWith('/withdraw');
    }
    if (path === '/analytics') {
      return location.pathname.startsWith('/analytics');
    }
    if (path === '/profile') {
      return location.pathname.startsWith('/profile');
    }
    if (path === '/admin') {
      return location.pathname.startsWith('/admin');
    }
    return location.pathname === path;
  };
  
  const navItems = [
    { name: 'Заявки', path: '/', icon: <FileText size={18} /> },
    { name: 'Реквизиты', path: '/requisites', icon: <CreditCard size={18} /> },
    { name: 'Вывод', path: '/withdraw', icon: <ArrowDownToLine size={18} /> },
    { name: 'История', path: '/transactions', icon: <History size={18} /> },
    { name: 'Аналитика', path: '/analytics', icon: <LineChart size={18} /> },
    { name: 'Новости', path: '/news', icon: <Newspaper size={18} /> },
    { name: 'Настройки', path: '/settings', icon: <Settings size={18} /> },
    { name: 'Профиль', path: '/profile', icon: <UserRound size={18} /> },
    { name: 'Админ', path: '/admin', icon: <Shield size={18} /> },
  ];

  return (
    <nav className="bg-card/50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto py-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link whitespace-nowrap flex items-center px-4 py-2 text-sm ${
                isActive(item.path) 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground transition-colors'
              }`}
            >
              <span className="mr-1.5">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

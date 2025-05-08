
import React, { createContext, useState, useContext } from 'react';

interface BalanceContextType {
  balanceVisible: boolean;
  toggleBalance: () => void;
  balance: number;
  setBalance: (amount: number) => void;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balanceVisible, setBalanceVisible] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(150000);

  const toggleBalance = () => {
    setBalanceVisible(prev => !prev);
  };

  return (
    <BalanceContext.Provider value={{ balanceVisible, toggleBalance, balance, setBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = (): BalanceContextType => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};

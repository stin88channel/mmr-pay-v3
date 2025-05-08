
import React, { createContext, useState, useContext, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'purple' | 'green' | 'midnight' | 'charcoal';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Check if there's a saved theme in localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check if user prefers dark mode
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
    }
  }, []);

  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove(
      'dark', 
      'theme-purple', 
      'theme-green', 
      'theme-midnight', 
      'theme-charcoal'
    );
    
    // Add the current theme class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'purple') {
      document.documentElement.classList.add('theme-purple');
    } else if (theme === 'green') {
      document.documentElement.classList.add('theme-green');
    } else if (theme === 'midnight') {
      document.documentElement.classList.add('theme-midnight');
    } else if (theme === 'charcoal') {
      document.documentElement.classList.add('theme-charcoal');
    }
    
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

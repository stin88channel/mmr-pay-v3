import { useState, useCallback, useEffect } from 'react';
import { authApi } from '@/lib/api';
import type { User } from '@/types/user';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  });

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const token = localStorage.getItem('token');
      
      if (!token) {
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null
        });
        return false;
      }

      const response = await authApi.getMe();
      setState({
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
        error: null
      });
      return true;
    } catch (error) {
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      });
      return false;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await authApi.login({ email, password });
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setState({
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка при входе'
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    login: string;
    phoneNumber: string;
    typeOfAccount: string;
  }) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await authApi.register(data);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setState({
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка при регистрации'
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await authApi.logout();
    } catch (error) {
      // Игнорируем ошибку при выходе
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      });
    }
  }, []);

  // Проверяем аутентификацию при монтировании компонента
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...state,
    login,
    logout,
    register,
    checkAuth,
    setError
  };
} 
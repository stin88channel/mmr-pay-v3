import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate, UNSAFE_NavigationContext } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BalanceProvider } from "./contexts/BalanceContext";
import Layout from "./components/layout/Layout";
import { useEffect } from "react";
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Requisites from "./pages/Requisites";
import RequisiteStatistics from "./pages/RequisiteStatistics";
import Withdraw from "./pages/Withdraw";
import News from "./pages/News";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import Transactions from "./pages/Transactions";
import ApiDocs from "./pages/ApiDocs";
import ApiKeysManagement from "./pages/ApiKeysManagement";
import Admin from '@/pages/Admin';
import TwoFactorAuth from "./pages/TwoFactorAuth";
import SecuritySettings from "./pages/SecuritySettings";
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/register';

const queryClient = new QueryClient();

// Конфигурация будущих флагов React Router
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

const App = () => {
  useEffect(() => {
    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BalanceProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Router {...routerConfig}>
              <Routes>
                {/* Публичные роуты */}
                <Route path="/auth/login" element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } />
                <Route path="/auth/register" element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                } />

                {/* Защищенные роуты */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout><Index /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Layout><Settings /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/requisites" element={
                  <ProtectedRoute>
                    <Layout><Requisites /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/requisites/bank-accounts" element={
                  <ProtectedRoute>
                    <Layout><Requisites /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/requisites/cards" element={
                  <ProtectedRoute>
                    <Layout><Requisites /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/requisites/sbp" element={
                  <ProtectedRoute>
                    <Layout><Requisites /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/requisites/transgran" element={
                  <ProtectedRoute>
                    <Layout><Requisites /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/requisites/add" element={
                  <ProtectedRoute>
                    <Layout><Requisites /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/requisites/statistics/:id" element={
                  <ProtectedRoute>
                    <Layout><RequisiteStatistics /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/withdraw" element={
                  <ProtectedRoute>
                    <Layout><Withdraw /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/withdraw/card" element={
                  <ProtectedRoute>
                    <Layout><Withdraw /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/withdraw/account" element={
                  <ProtectedRoute>
                    <Layout><Withdraw /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/withdraw/other" element={
                  <ProtectedRoute>
                    <Layout><Withdraw /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout><Profile /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/profile/security" element={
                  <ProtectedRoute>
                    <Layout><Profile /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/profile/security/general" element={
                  <ProtectedRoute>
                    <Layout><Profile /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/profile/security/password" element={
                  <ProtectedRoute>
                    <Layout><Profile /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/profile/security/restrictions" element={
                  <ProtectedRoute>
                    <Layout><Profile /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/profile/security/activity" element={
                  <ProtectedRoute>
                    <Layout><Profile /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/profile/security/2fa" element={
                  <ProtectedRoute>
                    <Layout><Profile /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/news" element={
                  <ProtectedRoute>
                    <Layout><News /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Layout><Analytics /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/analytics/summary" element={
                  <ProtectedRoute>
                    <Layout><Analytics /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/analytics/income" element={
                  <ProtectedRoute>
                    <Layout><Analytics /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/analytics/spending" element={
                  <ProtectedRoute>
                    <Layout><Analytics /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/transactions" element={
                  <ProtectedRoute>
                    <Layout><Transactions /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/api" element={
                  <ProtectedRoute>
                    <Layout><ApiDocs /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/api/keys" element={
                  <ProtectedRoute>
                    <Layout><ApiKeysManagement /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <Layout><Admin /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute>
                    <Layout><Admin /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/database" element={
                  <ProtectedRoute>
                    <Layout><Admin /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/news" element={
                  <ProtectedRoute>
                    <Layout><Admin /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/security" element={
                  <ProtectedRoute>
                    <Layout><Admin /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute>
                    <Layout><Admin /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </TooltipProvider>
        </BalanceProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

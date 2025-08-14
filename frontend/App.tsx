import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainApp from './components/MainApp';
import AuthPage from './pages/AuthPage';
import { AnimatePresence } from 'framer-motion';

const AppContent: React.FC = () => {
    const { currentUser, isLoading } = useAuth();

    if (isLoading) {
        // You can return a global loading spinner here if desired
        return <div className="min-h-screen bg-slate-100 dark:bg-slate-900" />;
    }

    return (
        <AnimatePresence mode="wait">
            {currentUser ? (
                <MainApp key="main-app" />
            ) : (
                <AuthPage key="auth-page" />
            )}
        </AnimatePresence>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
  );
};

export default App;
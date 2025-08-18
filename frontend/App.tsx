import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainApp from './components/MainApp';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import { AnimatePresence } from 'framer-motion';

const AppContent: React.FC = () => {
    const { currentUser, isLoading } = useAuth();

    if (isLoading) {
        // You can return a global loading spinner here if desired
    return <div className="min-h-screen bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-[#0f172a] to-[#334155]" />;
    }

    return (
        <AnimatePresence mode="wait">
            {currentUser ? (
                <MainApp key="main-app" />
            ) : (
                <HomePage key="home-page" />
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
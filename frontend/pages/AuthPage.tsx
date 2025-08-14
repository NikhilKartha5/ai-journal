import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogoIcon, LoadingSpinner, AlertTriangleIcon } from '../components/Icons';

type AuthMode = 'login' | 'register';

const AuthPage: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');

    const formVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4">
            <div className="text-center mb-8">
                <LogoIcon className="h-16 w-16 mx-auto text-sky-500" />
                <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mt-4">Welcome to Aura</h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Your space for reflection and growth.</p>
            </div>

            <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <AnimatePresence mode="wait">
                    {mode === 'login' ? (
                        <motion.div key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                           <AuthForm mode="login" setMode={setMode} />
                        </motion.div>
                    ) : (
                        <motion.div key="register" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                            <AuthForm mode="register" setMode={setMode} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
             <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
                
            </p>
        </div>
    );
};

interface AuthFormProps {
    mode: AuthMode;
    setMode: (mode: AuthMode) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, setMode }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await register(name, email, password);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const isLogin = mode === 'login';

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-6">
                {isLogin ? 'Log In' : 'Create Account'}
            </h2>
             {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-4 text-sm flex items-center">
                    <AlertTriangleIcon className="h-4 w-4 mr-2" />
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:ring-2 focus:ring-sky-500"
                    />
                )}
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:ring-2 focus:ring-sky-500"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:ring-2 focus:ring-sky-500"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors"
                >
                    {isLoading ? <LoadingSpinner /> : (isLogin ? 'Log In' : 'Register')}
                </button>
            </form>
            <p className="text-center text-sm mt-6 text-slate-500 dark:text-slate-400">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                    onClick={() => setMode(isLogin ? 'register' : 'login')}
                    className="font-semibold text-sky-600 dark:text-sky-400 hover:underline ml-1"
                >
                    {isLogin ? 'Sign up' : 'Log in'}
                </button>
            </p>
        </div>
    );
};


export default AuthPage;

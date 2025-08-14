import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavBar } from './NavBar';
import DashboardPage from '../pages/DashboardPage';
import InsightsPage from '../pages/InsightsPage';
import RecommendationsPage from '../pages/RecommendationsPage';
import JournalPage from '../pages/JournalPage';
import SettingsPage from '../pages/SettingsPage';
import { analyzeDiaryEntry } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/apiService';
import type { DiaryEntry, AnalysisResult, AppSettings, User } from '../types';

const defaultSettings: AppSettings = {
    theme: 'system',
    reminders: {
        enabled: false,
        time: '09:00',
    }
};

const MainApp: React.FC = () => {
  const { currentUser, logout, token } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  
  // Load diary entries from backend when user/token changes
  useEffect(() => {
    const fetchEntries = async () => {
      if (!token) return;
      try {
        const backendEntries = await api.getDiaryEntries(token) as any[];
        setEntries(
          backendEntries.map(e => ({
            id: e._id,
            text: e.content,
            timestamp: e.date,
            analysis: typeof e.analysis === 'string' ? JSON.parse(e.analysis) : e.analysis,
          }))
        );
      } catch (e) {
        setEntries([]);
      }
    };
    fetchEntries();
  }, [token]);

  // Handle theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.toggle('dark', isDark);
  }, [settings.theme]);


  const handleNewEntry = useCallback(async (text: string) => {
    if (!text.trim() || !token) return;
    setIsLoading(true);
    setError(null);
    setCurrentAnalysis(null);
    try {
      const analysis = await analyzeDiaryEntry(text);
      const entryPayload = {
        date: new Date().toISOString(),
        mood: '',
        content: text,
        analysis: JSON.stringify(analysis),
      };
      const savedEntry = await api.createDiaryEntry(token, entryPayload) as any;
      const newEntry: DiaryEntry = {
        id: savedEntry._id || Date.now(),
        text: savedEntry.content,
        timestamp: savedEntry.date,
        analysis: typeof savedEntry.analysis === 'string' ? JSON.parse(savedEntry.analysis) : savedEntry.analysis,
      };
      setEntries(prevEntries => [newEntry, ...prevEntries]);
      setCurrentAnalysis(newEntry.analysis);
    } catch (err: any) {
      setError(err.message || 'Sorry, something went wrong while saving your entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleDeleteEntry = async (idToDelete: number) => {
    if (!token) return;
    try {
  await api.deleteDiaryEntry(token, String(idToDelete));
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== idToDelete));
    } catch (err: any) {
      setError('Failed to delete entry. Please try again.');
    }
  };
  
  const handleExportData = () => {
    if (!currentUser) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({ user: {name: currentUser.name, email: currentUser.email }, entries, settings }, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `aura_diary_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleDeleteAllData = () => {
    if (!currentUser) return;
    if (window.confirm('Are you absolutely sure? This will permanently delete all YOUR entries and settings. This action cannot be undone.')) {
        setEntries([]);
        setSettings(defaultSettings);
        setCurrentAnalysis(null);
  // Removed localStorage cleanup, not needed with backend integration
        // Note: This does not delete the user account itself from the 'auraUsers' list.
        // A full implementation would require more complex user management.
    }
  };

  return (
    <motion.div
        className="flex w-full min-h-screen bg-slate-100 dark:bg-slate-900 font-sans"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
    >
        <NavBar activePage={activePage} setActivePage={setActivePage} onLogout={logout} />
        <main className="flex-1 w-full md:pl-20 pb-20 md:pb-0">
        <AnimatePresence mode="wait">
            {activePage === 'dashboard' && (
            <DashboardPage
                key="dashboard"
                entries={entries}
                currentAnalysis={currentAnalysis}
                isLoading={isLoading}
                error={error}
                onNewEntry={handleNewEntry}
                theme={settings.theme}
            />
            )}
            {activePage === 'insights' && <InsightsPage key="insights" entries={entries} theme={settings.theme} />}
            {activePage === 'recommendations' && <RecommendationsPage key="recommendations" entries={entries} />}
            {activePage === 'journal' && (
            <JournalPage
                key="journal"
                entries={entries}
                onDeleteEntry={handleDeleteEntry}
                theme={settings.theme}
            />
            )}
            {activePage === 'settings' && (
            <SettingsPage 
                key="settings"
                settings={settings}
                onSettingsChange={setSettings}
                onExportAll={handleExportData}
                onDeleteAll={handleDeleteAllData}
                entries={entries}
            />
            )}
        </AnimatePresence>
        </main>
    </motion.div>
  );
};

export default MainApp;

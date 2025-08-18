import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavBar } from './NavBar';
import { OfflineBanner } from './OfflineBanner';
import DashboardPage from '../pages/DashboardPage';
import InsightsPage from '../pages/InsightsPage';
import RecommendationsPage from '../pages/RecommendationsPage';
import JournalPage from '../pages/JournalPage';
import SettingsPage from '../pages/SettingsPage';
import CommunityPage from '../pages/CommunityPage';
import { analyzeDiaryEntry } from '../services/geminiService';
import FloatingLanguageSwitcher from './FloatingLanguageSwitcher';
import { exportFullDataPdf } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/apiService';
import { loadLocal, queueCreate, queueDelete, flushQueue, offlineDelete, queueUpdate } from '../offline_sync';
import { loadSetting, saveSetting } from '../offline_db';
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
  
  // Offline-first load: entries + settings from IndexedDB first, then network
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = await loadLocal();
      if (!cancelled && local.length) {
        setEntries(local.map(l => ({ id: l.id, text: l.text, title: (l as any).title, tags: (l as any).tags, timestamp: l.timestamp, analysis: l.analysis })));
      }
      const storedTheme = await loadSetting('settings:theme');
      const storedReminders = await loadSetting('settings:reminders');
      const storedLang = await loadSetting('settings:lang');
      if (!cancelled && (storedTheme || storedReminders)) {
        setSettings(prev => ({
          theme: storedTheme || prev.theme,
          reminders: storedReminders || prev.reminders,
        }));
      }
      if (storedLang) {
        try { (await import('i18next')).default.changeLanguage(storedLang); } catch {}
      }
      if (token && navigator.onLine) {
        try {
          const backendEntries = await api.getDiaryEntries(token) as any[];
          const mapped = backendEntries.map(e => ({
            id: e._id,
            text: e.content,
            title: e.title,
            tags: e.tags,
            timestamp: e.date,
            analysis: typeof e.analysis === 'string' ? JSON.parse(e.analysis) : e.analysis,
          }));
          if (!cancelled) setEntries(mapped);
        } catch {}
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  // Flush queue when online
  useEffect(() => {
    async function onOnline() { if (token) { const idMap = await flushQueue(token); if (idMap && Object.keys(idMap).length) { setEntries(prev => prev.map(e => (idMap as any)[e.id] ? { ...e, id: (idMap as any)[e.id], pending: false } : e)); } } }
    window.addEventListener('online', onOnline);
    if (navigator.onLine && token) onOnline();
    return () => window.removeEventListener('online', onOnline);
  }, [token]);

  // Handle theme changes & persist settings
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.toggle('dark', isDark);
  saveSetting('settings:theme', settings.theme);
  saveSetting('settings:reminders', settings.reminders);
  }, [settings.theme, settings.reminders]);

  // Periodic background sync (basic fallback)
  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => { if (navigator.onLine) flushQueue(token); }, 60000);
    return () => clearInterval(id);
  }, [token]);


  const handleNewEntry = useCallback(async (text: string, meta?: { title?: string; tags?: string[] }) => {
    if (!text.trim() || !token) return;
    setIsLoading(true); setError(null); setCurrentAnalysis(null);
    try {
      const analysis = await analyzeDiaryEntry(text);
      const id = Date.now();
      const timestamp = new Date().toISOString();
  const optimistic: DiaryEntry & { pending?: boolean } = { id, text, title: meta?.title, tags: meta?.tags, timestamp, analysis, pending: !navigator.onLine };
  setEntries(prev => [optimistic, ...prev]);
      if (navigator.onLine) {
        try {
          const payload = { date: timestamp, mood: '', content: text, title: meta?.title, tags: meta?.tags, analysis: JSON.stringify(analysis) };
          const saved = await api.createDiaryEntry(token, payload) as any;
          if (saved?._id) {
            setEntries(prev => prev.map(e => e.id === id ? {
              id: saved._id,
              text: saved.content,
              title: saved.title,
              tags: saved.tags,
              timestamp: saved.date,
              analysis: typeof saved.analysis === 'string' ? JSON.parse(saved.analysis) : saved.analysis,
              pending: false,
            } : e));
          }
        } catch {
          await queueCreate({ id, text, title: meta?.title, tags: meta?.tags, timestamp, analysis, pending: true, temp: true });
        }
      } else {
        await queueCreate({ id, text, title: meta?.title, tags: meta?.tags, timestamp, analysis, pending: true, temp: true });
      }
      setCurrentAnalysis(analysis);
    } catch (err:any) { setError(err.message || 'Save failed'); }
    finally { setIsLoading(false); }
  }, [token]);

  const handleDeleteEntry = async (idToDelete: number | string) => {
    if (!token) return;
    // Optimistic UI removal
    setEntries(prev => prev.filter(e => e.id !== idToDelete));
    if (!navigator.onLine) {
      await offlineDelete(idToDelete);
      // If it was a real (string) id we still need to queue delete
      if (typeof idToDelete === 'string') await queueDelete(idToDelete);
      return;
    }
    // Online path
    try {
      await api.deleteDiaryEntry(token, String(idToDelete));
    } catch (err) {
      // Queue delete fallback for reliability
      await queueDelete(idToDelete);
    }
  };

  const handleUpdateEntry = async (idToUpdate: number | string, newText: string, meta?: { title?: string; tags?: string[] }) => {
    if (!token) return;
    // Optimistic local change
    setEntries(prev => prev.map(e => e.id === idToUpdate ? { ...e, text: newText, title: meta?.title ?? e.title, tags: meta?.tags ?? e.tags, pending: e.pending || !navigator.onLine } : e));
    const payload: any = { content: newText };
    if (meta?.title !== undefined) payload.title = meta.title;
    if (meta?.tags !== undefined) payload.tags = meta.tags;
    if (!navigator.onLine) {
      await queueUpdate(String(idToUpdate), { id: idToUpdate, text: newText, title: meta?.title, tags: meta?.tags } as any);
      return;
    }
    try {
      const updated = await api.updateDiaryEntry(token, String(idToUpdate), payload) as any;
      if (updated) {
        setEntries(prev => prev.map(e => e.id === idToUpdate ? { ...e, text: updated.content ?? newText, title: updated.title, tags: updated.tags, timestamp: updated.date || e.timestamp, pending: false } : e));
      }
    } catch (e) {
      // queue update for retry
      await queueUpdate(String(idToUpdate), { id: idToUpdate, text: newText, title: meta?.title, tags: meta?.tags } as any);
    }
  };
  
  const handleExportData = () => {
    if (!currentUser) return;
    try {
      exportFullDataPdf(entries, settings);
    } catch (e) {
      console.error('PDF export failed', e);
      // fallback simple JSON if PDF fails
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify({ user: {name: currentUser.name, email: currentUser.email }, entries, settings }, null, 2))}`;
      const link = document.createElement('a');
      link.href = jsonString;
      link.download = `aura_diary_export_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    }
  };

  const handleDeleteAllData = async () => {
    if (!currentUser || !token) return;
    if (!window.confirm('Delete ALL your diary entries? This cannot be undone.')) return;
    try {
      await api.deleteAllDiaryEntries(token);
      setEntries([]);
      setSettings(defaultSettings);
      setCurrentAnalysis(null);
    } catch (e) {
      console.error('Failed to delete all entries', e);
      alert('Failed to delete entries on server. Please try again.');
    }
  };

  return (
  <motion.div
    className="flex w-full min-h-screen font-sans bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-[#0f172a] to-[#334155]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
    >
  <OfflineBanner token={token} onSynced={(map) => { setEntries(prev => prev.map(e => (map as any)[e.id] ? { ...e, id: (map as any)[e.id], pending: false } : e)); }} />
  <NavBar activePage={activePage} setActivePage={setActivePage} onLogout={logout} />
  <FloatingLanguageSwitcher />
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
                onUpdateEntry={handleUpdateEntry}
                theme={settings.theme}
            />
            )}
            {activePage === 'community' && <CommunityPage key="community" />}
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

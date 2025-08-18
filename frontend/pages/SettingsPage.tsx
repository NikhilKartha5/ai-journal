import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { AppSettings, DiaryEntry } from '../types';
import { PaletteIcon, BellIcon, DatabaseIcon, DownloadIcon, TrashIcon, SunIcon, MoonIcon, ShieldCheckIcon } from '../components/Icons';
import TherapistModeModal from '../components/TherapistModeModal';

interface SettingsPageProps {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
    onExportAll: () => void;
    onDeleteAll: () => void;
    entries: DiaryEntry[];
}

const pageVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 120, staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSettingsChange, onExportAll, onDeleteAll, entries }) => {
    const [notificationPermission, setNotificationPermission] = useState('default');
    const { t } = useTranslation();
    const [isTherapistModalOpen, setIsTherapistModalOpen] = useState(false);
    const [reminderTimeoutId, setReminderTimeoutId] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    // Schedule notification when reminders or time change
    useEffect(() => {
        // Clear any previous timeout
        if (reminderTimeoutId) {
            clearTimeout(reminderTimeoutId);
            setReminderTimeoutId(null);
        }
        // Only schedule if enabled and permission granted
        if (settings.reminders.enabled && notificationPermission === 'granted') {
            // Parse reminder time (HH:mm)
            const [reminderHour, reminderMinute] = settings.reminders.time.split(':').map(Number);
            const now = new Date();
            let reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), reminderHour, reminderMinute, 0, 0);
            // If reminder time has already passed today, schedule for tomorrow
            if (reminderDate <= now) {
                reminderDate.setDate(reminderDate.getDate() + 1);
            }
            const msUntilReminder = reminderDate.getTime() - now.getTime();
            // Schedule notification
            const timeoutId = setTimeout(() => {
                new Notification('AI Diary Reminder', {
                    body: 'Time to write in your diary!',
                    icon: '/favicon.ico',
                });
            }, msUntilReminder);
            setReminderTimeoutId(timeoutId);
        }
        // Cleanup on unmount
        return () => {
            if (reminderTimeoutId) {
                clearTimeout(reminderTimeoutId);
            }
        };
    }, [settings.reminders.enabled, settings.reminders.time, notificationPermission]);

    const handleThemeChange = (theme: AppSettings['theme']) => {
        onSettingsChange({ ...settings, theme });
    };

    const handleReminderToggle = (enabled: boolean) => {
        if (enabled && Notification.permission === 'default') {
             Notification.requestPermission().then(setNotificationPermission);
        }
        onSettingsChange({ ...settings, reminders: { ...settings.reminders, enabled } });
    };

    const handleTimeChange = (time: string) => {
        onSettingsChange({ ...settings, reminders: { ...settings.reminders, time } });
    };

    const getNotificationStatusText = () => {
        switch (notificationPermission) {
            case 'granted': return 'Notifications are enabled.';
            case 'denied': return 'Notifications blocked. Change this in your browser settings.';
            default: return 'Enable reminders to get notifications.';
        }
    };
    
    return (
        <>
            <motion.div
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="p-4 sm:p-6 lg:p-8"
            >
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">{t('settings.title')}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Appearance Card */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center mb-4"><PaletteIcon className="mr-2 text-sky-500"/> {t('settings.appearance')}</h2>
                        <div className="flex items-center justify-between">
                                                        <label className="text-slate-600 dark:text-slate-300">Theme</label>
                            <div className="flex items-center space-x-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-700">
                               <ThemeButton icon={SunIcon} label="Light" currentTheme={settings.theme} targetTheme="light" onClick={handleThemeChange} />
                               <ThemeButton icon={MoonIcon} label="Dark" currentTheme={settings.theme} targetTheme="dark" onClick={handleThemeChange} />
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">Language setting moved to the sidebar switcher.</p>
                    </motion.div>

                     {/* Reminders Card */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                         <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center mb-4"><BellIcon className="mr-2 text-sky-500"/> {t('settings.reminders')}</h2>
                         <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <label htmlFor="reminder-toggle" className="text-slate-600 dark:text-slate-300">Enable daily reminders</label>
                                <ToggleSwitch id="reminder-toggle" checked={settings.reminders.enabled} onChange={handleReminderToggle} />
                             </div>
                             <AnimatePresence>
                             {settings.reminders.enabled && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center justify-between overflow-hidden"
                                >
                                    <label htmlFor="reminder-time" className="text-slate-600 dark:text-slate-300">Reminder time</label>
                                    <input 
                                        type="time"
                                        id="reminder-time"
                                        value={settings.reminders.time}
                                        onChange={(e) => handleTimeChange(e.target.value)}
                                        className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1"
                                    />
                                </motion.div>
                             )}
                             </AnimatePresence>
                             <p className="text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">{getNotificationStatusText()}</p>
                         </div>
                    </motion.div>

                    {/* Therapist Mode Card */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center mb-4"><ShieldCheckIcon className="mr-2 text-green-500"/> Therapist Mode</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Securely share your progress with a therapist or trusted individual by generating a customized report.</p>
                        <button onClick={() => setIsTherapistModalOpen(true)} className="w-full flex items-center justify-center bg-green-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                            Generate Report
                        </button>
                    </motion.div>


                    {/* Data Management Card */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                         <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center mb-4"><DatabaseIcon className="mr-2 text-sky-500"/> {t('settings.dataManagement')}</h2>
                         <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-slate-600 dark:text-slate-300">{t('settings.exportPdf')}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Download a PDF containing your entries, summaries, emotions, and settings.</p>
                                </div>
                                <button onClick={onExportAll} className="mt-2 sm:mt-0 w-full sm:w-auto flex items-center justify-center bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                                    <DownloadIcon/> Export PDF
                                </button>
                            </div>
                             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div>
                                    <h3 className="font-medium text-red-600 dark:text-red-400">{t('settings.deleteAll')}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Permanently delete your account and all associated data.</p>
                                </div>
                                <button onClick={onDeleteAll} className="mt-2 sm:mt-0 w-full sm:w-auto flex items-center justify-center bg-red-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                                    <TrashIcon/> Delete
                                </button>
                            </div>
                         </div>
                    </motion.div>
                </div>
            </motion.div>
            <AnimatePresence>
                {isTherapistModalOpen && (
                    <TherapistModeModal 
                        isOpen={isTherapistModalOpen}
                        onClose={() => setIsTherapistModalOpen(false)}
                        entries={entries}
                        theme={settings.theme}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

const ThemeButton: React.FC<{icon: React.FC<{className?: string}>, label: string, currentTheme: string, targetTheme: string, onClick: (theme: any) => void}> = ({ icon: Icon, label, currentTheme, targetTheme, onClick}) => {
    const isActive = currentTheme === targetTheme;
    return (
        <button
            onClick={() => onClick(targetTheme)}
            className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isActive ? 'text-sky-700' : 'text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100'}`}
        >
            <span className="relative z-10 flex items-center"><Icon className="mr-1.5"/> {label}</span>
            {isActive && <motion.div layoutId="theme-pill" className="absolute inset-0 bg-white dark:bg-slate-800/80 shadow rounded-md" />}
        </button>
    )
}

const ToggleSwitch: React.FC<{id: string, checked: boolean, onChange: (checked: boolean) => void}> = ({ id, checked, onChange }) => {
    return (
        <button
            id={id}
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex items-center h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${checked ? 'bg-sky-600' : 'bg-slate-200 dark:bg-slate-600'}`}
        >
            <motion.span
                aria-hidden="true"
                layout
                transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
    );
};


export default SettingsPage;
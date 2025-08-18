import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, Variants } from 'framer-motion';
import { DiaryInput } from '../components/DiaryInput';
import { DashboardEditor } from '../components/DashboardEditor';
import { AnalysisDisplay } from '../components/AnalysisDisplay';
import { MoodChart } from '../components/MoodChart';
import { DiaryEntry, AnalysisResult, AppSettings } from '../types';

interface DashboardPageProps {
  entries: DiaryEntry[];
  currentAnalysis: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  onNewEntry: (text: string, meta?: { title?: string; tags?: string[] }) => void;
  theme?: AppSettings['theme'];
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 120, staggerChildren: 0.1 },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

const DashboardPage: React.FC<DashboardPageProps> = ({
  entries,
  currentAnalysis,
  isLoading,
  error,
  onNewEntry,
  theme,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [draft, setDraft] = React.useState('');
  const wordCount = React.useMemo(() => (draft?.trim() ? draft.trim().split(/\s+/).length : 0), [draft]);

  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = (e.target as HTMLInputElement).value.trim();
      if (val && !tags.includes(val)) setTags(prev => [...prev, val]);
      (e.target as HTMLInputElement).value = '';
    }
  };
  const removeTag = (tag: string) => setTags(prev => prev.filter(tg => tg !== tag));
  const handleSave = () => { if (!isLoading && draft.trim()) { onNewEntry(draft, { title: title.trim() || undefined, tags: tags.length ? tags : undefined }); setDraft(''); setTitle(''); setTags([]);} };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8 max-w-[1600px] mx-auto w-full">
        <motion.div variants={itemVariants} className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-900/70 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider font-medium text-brand-600 dark:text-brand-400">{t('dashboard.prompt')}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300">{wordCount} words</span>
            </div>
            <button onClick={handleSave} disabled={isLoading || !draft.trim()} className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-gradient-to-r from-brand-600 via-brand-500 to-pink-500 hover:from-brand-700 hover:via-brand-600 hover:to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition">
              {isLoading ? t('diaryInput.analyzing') : t('diaryInput.saveButton', 'Save')}
            </button>
          </div>
          <div className="px-6 pt-6 space-y-4">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full bg-transparent text-2xl font-semibold tracking-tight focus:outline-none placeholder:text-slate-400 text-slate-800 dark:text-slate-100" />
            <div className="flex flex-wrap gap-2 text-xs">
              {tags.map(tag => (
                <button key={tag} onClick={() => removeTag(tag)} className="px-2 py-1 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 hover:bg-brand-200 dark:hover:bg-brand-800/50 transition">
                  {tag}
                </button>
              ))}
              <input onKeyDown={handleTagKey} placeholder="Add tag & press Enter" className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs" />
            </div>
          </div>
          <div className="p-6 pt-2">
            <DashboardEditor value={draft} onChange={setDraft} />
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">{t('dashboard.moodJourney')}</h3>
            {entries.length > 1 ? (
              <MoodChart data={entries} theme={theme} />
            ) : (
              <div className="h-48 flex items-center justify-center text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <p>{t('dashboard.moodChartPlaceholderLine1')} <br/> {t('dashboard.moodChartPlaceholderLine2')}</p>
              </div>
            )}
          </div>
          <AnalysisDisplay analysis={currentAnalysis} isLoading={isLoading} error={error} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
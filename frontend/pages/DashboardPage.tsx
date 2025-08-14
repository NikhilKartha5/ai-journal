import React from 'react';
import { motion, Variants } from 'framer-motion';
import { DiaryInput } from '../components/DiaryInput';
import { AnalysisDisplay } from '../components/AnalysisDisplay';
import { MoodChart } from '../components/MoodChart';
import { DiaryEntry, AnalysisResult, AppSettings } from '../types';

interface DashboardPageProps {
  entries: DiaryEntry[];
  currentAnalysis: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  onNewEntry: (text: string) => void;
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
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="p-4 sm:p-6 lg:p-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col space-y-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">How are you feeling today?</h2>
            <DiaryInput onSubmit={onNewEntry} isLoading={isLoading} />
          </div>
          <AnalysisDisplay analysis={currentAnalysis} isLoading={isLoading} error={error} />
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Your Mood Journey</h2>
          {entries.length > 1 ? (
            <MoodChart data={entries} theme={theme} />
          ) : (
            <div className="h-64 flex items-center justify-center text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
              <p>Your mood chart will appear here once you have more than one entry. <br/> It's a great way to visualize your progress over time!</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
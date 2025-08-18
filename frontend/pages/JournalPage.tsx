import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Slider from 'rc-slider';

import { DiaryEntry, AppSettings } from '../types';
import { EntryCard } from '../components/EntryCard';
import CalendarHeatmap from '../components/CalendarHeatmap';
import { getCalendarData } from '../utils/insights';
import { BookOpenIcon, SearchIcon, FilterIcon, XIcon } from '../components/Icons';

interface JournalPageProps {
  entries: DiaryEntry[];
  onDeleteEntry: (id: number | string) => void;
  onUpdateEntry?: (id: number | string, newText: string) => void;
  theme?: AppSettings['theme'];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const ENTRIES_PER_PAGE = 10;

const JournalPage: React.FC<JournalPageProps> = ({ entries, onDeleteEntry, onUpdateEntry, theme }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ startDate: string, endDate: string }>({
    startDate: '',
    endDate: '',
  });
  const [moodRange, setMoodRange] = useState<[number, number]>([1, 10]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(ENTRIES_PER_PAGE);

  const { calendarData, startDate: heatmapStartDate } = useMemo(() => getCalendarData(entries, 182), [entries]);

  const allEmotions = useMemo(() => {
    const emotions = new Set<string>();
    entries.forEach(entry => entry.analysis.emotions.forEach(e => emotions.add(e)));
    return Array.from(emotions).sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries
      .filter(entry => {
        const entryDateStr = entry.timestamp.split('T')[0];
        const { startDate, endDate } = dateRange;
        
        let inDateRange = true;
        if (startDate && entryDateStr < startDate) {
          inDateRange = false;
        }
        if (inDateRange && endDate && entryDateStr > endDate) {
          inDateRange = false;
        }
        
        const inMoodRange =
          entry.analysis.sentimentScore >= moodRange[0] &&
          entry.analysis.sentimentScore <= moodRange[1];

        const hasSelectedEmotion =
          selectedEmotions.length === 0 ||
          selectedEmotions.some(emotion => entry.analysis.emotions.includes(emotion));

        const matchesSearch =
          searchQuery === '' ||
          entry.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.analysis.summary.toLowerCase().includes(searchQuery.toLowerCase());

        return inDateRange && inMoodRange && hasSelectedEmotion && matchesSearch;
      });
  }, [entries, searchQuery, dateRange, moodRange, selectedEmotions]);

  const handleDayClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setDateRange({ startDate: dateString, endDate: dateString });
    if (window.innerWidth < 768) setIsFilterOpen(false);
  };
  
  const handleEmotionToggle = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDateRange({ startDate: '', endDate: '' });
    setMoodRange([1, 10]);
    setSelectedEmotions([]);
  };

  const hasActiveFilters = searchQuery || dateRange.startDate || dateRange.endDate || moodRange[0] !== 1 || moodRange[1] !== 10 || selectedEmotions.length > 0;
  
  const FilterPanel = () => (
    <div className="flex flex-col space-y-6">
        <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t('journal.jumpToDate')}</h3>
            <CalendarHeatmap startDate={heatmapStartDate} data={calendarData} onDayClick={handleDayClick} theme={theme} />
        </div>
        <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t('journal.filterDateRange')}</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="startDate" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('journal.startDate')}</label>
                <input
                    type="date"
                    id="startDate"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full mt-1 px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 dark:text-slate-200"
                />
              </div>
              <div>
                  <label htmlFor="endDate" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('journal.endDate')}</label>
                  <input
                      type="date"
                      id="endDate"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full mt-1 px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 dark:text-slate-200"
                  />
              </div>
            </div>
        </div>
        <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t('journal.filterMoodScore', { min: moodRange[0], max: moodRange[1] })}</h3>
            <div className="px-2">
                 <Slider
                    range
                    min={1}
                    max={10}
                    value={moodRange}
                    onChange={(value) => setMoodRange(value as [number, number])}
                    allowCross={false}
                    marks={{ 1: '1', 10: '10' }}
                />
            </div>
        </div>
        <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t('journal.filterEmotion')}</h3>
            <div className="flex flex-wrap gap-2">
                {allEmotions.map(emotion => (
                    <button
                        key={emotion}
                        onClick={() => handleEmotionToggle(emotion)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                            selectedEmotions.includes(emotion) 
                            ? 'bg-sky-600 text-white' 
                            : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500'
                        }`}
                    >
                        {emotion}
                    </button>
                ))}
            </div>
        </div>
        {hasActiveFilters && (
      <button onClick={handleClearFilters} className="text-sm text-sky-600 hover:underline flex items-center justify-center dark:text-sky-400">
        <XIcon className="mr-1"/> {t('journal.clearAll')}
            </button>
        )}
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Desktop Filter Sidebar */}
      <aside className="hidden md:block w-80 lg:w-96 flex-shrink-0 p-6 border-r border-slate-200 dark:border-slate-700 overflow-y-auto h-screen sticky top-0 bg-white dark:bg-slate-800">
  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">{t('journal.filterPanelTitle')}</h2>
        <FilterPanel/>
      </aside>

      {/* Mobile Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
           <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-800 z-50 shadow-lg p-6 overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('journal.filterPanelTitle')}</h2>
                     <button onClick={() => setIsFilterOpen(false)}><XIcon className="h-6 w-6"/></button>
                </div>
                <FilterPanel />
           </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t('journal.pastEntriesTitle')}</h1>
            <button onClick={() => setIsFilterOpen(true)} className="md:hidden p-2 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600">
                <FilterIcon />
            </button>
        </div>
        <div className="relative mb-6">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input
                type="text"
                placeholder={t('journal.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white dark:bg-slate-700 dark:placeholder-slate-400"
            />
        </div>

        {entries.length === 0 ? (
             <motion.div 
                variants={itemVariants}
                initial="hidden" animate="visible"
                className="text-center py-16 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
            >
                <BookOpenIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                <p className="mt-4 font-semibold text-slate-700 dark:text-slate-200">{t('journal.empty')}</p>
                <p className="mt-1 text-sm">{t('journal.emptyHint')}</p>
            </motion.div>
        ) : (
            filteredEntries.length > 0 ? (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                  {filteredEntries.slice(0, visibleCount).map((entry) => (
                    <motion.div key={entry.id} variants={itemVariants}>
                        <EntryCard entry={entry} onDelete={onDeleteEntry} onUpdate={onUpdateEntry} />
                    </motion.div>
                  ))}
                </motion.div>
            ) : (
       <div className="text-center py-16 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
         <p className="font-semibold text-slate-700 dark:text-slate-200">{t('journal.noResultsTitle')}</p>
        <p className="mt-1 text-sm">{t('journal.noResultsHint')}</p>
                </div>
            )
        )}
        
        {filteredEntries.length > visibleCount && (
            <div className="mt-8 text-center">
                <button
                    onClick={() => setVisibleCount(prev => prev + ENTRIES_PER_PAGE)}
                    className="bg-sky-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-sky-700 transition-colors"
                >
                    {t('journal.loadMore')}
                </button>
            </div>
        )}
      </main>
    </div>
  );
};

export default JournalPage;
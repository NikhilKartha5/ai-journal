import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { DiaryEntry, WeeklyRecapData, TrendInsight, Affirmation, AppSettings } from '../types';
import { getCalendarData, getWeeklyRecap, generateTrendInsights, extractAffirmations } from '../utils/insights';
import CalendarHeatmap from '../components/CalendarHeatmap';
import { TrendingUpIcon, TrendingDownIcon, CalendarDaysIcon, ClockIcon, QuoteIcon, ChartBarIcon } from '../components/Icons';

interface InsightsPageProps {
  entries: DiaryEntry[];
  theme?: AppSettings['theme'];
}

const pageVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 120, staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' } },
};

const InsightsPage: React.FC<InsightsPageProps> = ({ entries, theme }) => {
    const { calendarData, startDate } = useMemo(() => getCalendarData(entries, 182), [entries]);
    const weeklyRecap = useMemo(() => getWeeklyRecap(entries), [entries]);
    const trendInsights = useMemo(() => generateTrendInsights(entries), [entries]);
    const affirmations = useMemo(() => extractAffirmations(entries), [entries]);

    if (entries.length < 2) {
        return (
            <motion.div
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="p-4 sm:p-6 lg:p-8 h-full flex items-center justify-center text-center"
            >
                <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                    <h2 className="mt-4 text-xl font-semibold text-slate-700 dark:text-slate-200">Not Enough Data for Insights</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md">
                        Keep journaling to unlock your personal insights! After a few entries, this page will fill up with beautiful charts and trends about your mental wellness journey.
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="p-4 sm:p-6 lg:p-8"
        >
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">Insights & Trends</h1>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="xl:col-span-2 flex flex-col space-y-8">
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Mood Calendar</h2>
                        <CalendarHeatmap startDate={startDate} data={calendarData} theme={theme}/>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Your Affirmations</h2>
                        <AffirmationsSection affirmations={affirmations} />
                    </motion.div>
                </div>

                {/* Right Column */}
                <div className="xl:col-span-1 flex flex-col space-y-8">
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                         <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Weekly Recap</h2>
                         <WeeklyRecapCard recap={weeklyRecap} />
                    </motion.div>
                     <motion.div variants={itemVariants}>
                        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">AI-Powered Trends</h2>
                        <TrendsSection insights={trendInsights} />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

const WeeklyRecapCard: React.FC<{ recap: WeeklyRecapData }> = ({ recap }) => {
    const { topEmotions, bestDay, worstDay, changeSinceLastWeek, entryCount } = recap;
    
    if(entryCount === 0) {
        return <p className="text-slate-500 dark:text-slate-400 text-sm">No entries this week. Write an entry to see your weekly recap.</p>
    }

    return (
        <div className="space-y-4">
            {changeSinceLastWeek !== null && (
                 <div className="flex items-center space-x-2">
                    {changeSinceLastWeek >= 0 ? <TrendingUpIcon className="text-green-500"/> : <TrendingDownIcon className="text-red-500"/>}
                    <p className={`text-sm font-medium ${changeSinceLastWeek >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        Your average mood is {changeSinceLastWeek >= 0 ? 'up' : 'down'} <strong>{Math.abs(changeSinceLastWeek).toFixed(0)}%</strong> from last week.
                    </p>
                </div>
            )}
            <div>
                <h4 className="font-semibold text-slate-600 dark:text-slate-300 text-sm mb-2">Top Emotions</h4>
                <div className="flex flex-wrap gap-2">
                    {topEmotions.map(({ emotion }) => (
                        <span key={emotion} className="bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300 text-xs font-medium px-2.5 py-1 rounded-full">{emotion}</span>
                    ))}
                </div>
            </div>
            {bestDay && (
                <div>
                    <h4 className="font-semibold text-slate-600 dark:text-slate-300 text-sm mb-1">Best Day</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{bestDay.day} (Avg. mood: {bestDay.score.toFixed(1)})</p>
                </div>
            )}
            {worstDay && (
                 <div>
                    <h4 className="font-semibold text-slate-600 dark:text-slate-300 text-sm mb-1">Worst Day</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{worstDay.day} (Avg. mood: {worstDay.score.toFixed(1)})</p>
                </div>
            )}
        </div>
    );
}

const trendIconMap: { [key in TrendInsight['icon']]: React.FC<{className?: string}> } = {
    trending_down: TrendingDownIcon,
    trending_up: TrendingUpIcon,
    calendar_month: CalendarDaysIcon,
    schedule: ClockIcon
};
const trendColorMap = {
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    blue: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
}

const TrendsSection: React.FC<{insights: TrendInsight[]}> = ({ insights }) => {
    if (insights.length === 0) {
        return <p className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-sm">More journaling will reveal personalized trends here!</p>
    }
    return (
        <div className="space-y-3">
            {insights.map(insight => {
                const Icon = trendIconMap[insight.icon];
                return (
                    <div key={insight.id} className={`p-4 rounded-lg flex items-start space-x-3 ${trendColorMap[insight.color]}`}>
                        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-medium">{insight.text}</p>
                    </div>
                )
            })}
        </div>
    );
};

const AffirmationsSection: React.FC<{affirmations: Affirmation[]}> = ({ affirmations }) => {
    if (affirmations.length === 0) {
        return (
             <div className="text-center py-10 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <QuoteIcon className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600"/>
                <p className="mt-2">Positive affirmations from your own writing will appear here.</p>
                <p className="text-xs mt-1">Try writing about what makes you happy!</p>
            </div>
        )
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {affirmations.map(affirmation => (
                <div key={affirmation.id} className="bg-gradient-to-br from-sky-50 to-teal-50 dark:from-sky-900/50 dark:to-teal-900/50 border-l-4 border-sky-400 dark:border-sky-500 p-4 rounded-lg shadow-sm">
                    <QuoteIcon className="h-5 w-5 text-sky-300 dark:text-sky-600 mb-2"/>
                    <p className="italic text-slate-700 dark:text-slate-300">"{affirmation.text}"</p>
                </div>
            ))}
        </div>
    )
}

export default InsightsPage;
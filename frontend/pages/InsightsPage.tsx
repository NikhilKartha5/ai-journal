import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { DiaryEntry, WeeklyRecapData, TrendInsight, Affirmation, AppSettings, MoodTrendPoint, WeekdayMood, EmotionFrequency, PositiveWordStat } from '../types';
import { getCalendarData, getWeeklyRecap, generateTrendInsights, extractAffirmations, getMoodTrend, smoothTrend, getWeekdayMood, getEmotionFrequencies, getPositiveWordStats } from '../utils/insights';
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
    const moodTrendRaw = useMemo(() => getMoodTrend(entries, 30), [entries]);
    const moodTrend = useMemo(() => smoothTrend(moodTrendRaw, 4), [moodTrendRaw]);
    const weekdayMood = useMemo(() => getWeekdayMood(entries), [entries]);
    const topEmotionsAll = useMemo(() => getEmotionFrequencies(entries, 6), [entries]);
    const positiveWords = useMemo(() => getPositiveWordStats(entries, 6), [entries]);

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
                        <div className="grid grid-cols-1 2xl:grid-cols-3 gap-8">
                {/* Left Column */}
                                <div className="2xl:col-span-2 flex flex-col space-y-8">
                                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                                                    <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Mood Calendar</h2>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">Each square reflects your average mood score for that day (scale 1–10). Darker intensity = higher average. Missing days mean no entries.</p>
                                                </div>
                                                <CalendarHeatmap startDate={startDate} data={calendarData} theme={theme}/>
                                        </motion.div>

                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Mood Trend (30d)</h2>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">Smoothed daily avg</span>
                                                </div>
                                                <MoodTrendChart points={moodTrend} />
                                            </motion.div>
                                            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Weekday Patterns</h2>
                                                <WeekdayMoodBars data={weekdayMood} />
                                            </motion.div>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Emotion Frequency</h2>
                                                <EmotionChips emotions={topEmotionsAll} />
                                            </motion.div>
                                            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Self-Affirmations</h2>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">These are uplifting sentences extracted from your own positive entries (score ≥ 8). Revisit them for encouragement.</p>
                                                <AffirmationsSection affirmations={affirmations} />
                                            </motion.div>
                                        </div>
                                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Positive Word Cloud</h2>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Words you use often that reflect growth or resilience.</p>
                                                <PositiveWordsList words={positiveWords} />
                                        </motion.div>
                </div>

                {/* Right Column */}
        <div className="2xl:col-span-1 flex flex-col space-y-8">
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                         <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Weekly Recap</h2>
                         <WeeklyRecapCard recap={weeklyRecap} />
                    </motion.div>
                     <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Adaptive Insights</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Generated from patterns across time, days, and your mood shifts. They evolve as you write more.</p>
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

// --- New Visualization Components ---

const MoodTrendChart: React.FC<{points: MoodTrendPoint[]}> = ({ points }) => {
    if (points.length === 0) return <p className="text-sm text-slate-500 dark:text-slate-400">Need more recent entries to chart trend.</p>;
    // Simple SVG sparkline
    const width = 400; const height = 120; const padding = 8;
    const scores = points.map(p => p.avgScore);
    const min = Math.min(...scores, 1); const max = Math.max(...scores, 10);
    const xStep = (width - padding*2) / Math.max(points.length -1, 1);
    const path = points.map((p,i) => {
        const x = padding + i * xStep;
        const y = padding + (1 - (p.avgScore - min)/(max - min || 1)) * (height - padding*2);
        return `${i===0?'M':'L'}${x},${y}`;
    }).join(' ');
    const last = points[points.length -1];
    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
                <defs>
                    <linearGradient id="moodLine" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9"/>
                        <stop offset="100%" stopColor="#0369a1"/>
                    </linearGradient>
                </defs>
                <path d={path} fill="none" stroke="url(#moodLine)" strokeWidth={2.5} strokeLinecap="round"/>
                {points.map((p,i) => {
                    const x = padding + i * xStep;
                    const y = padding + (1 - (p.avgScore - min)/(max - min || 1)) * (height - padding*2);
                    return <circle key={p.date} cx={x} cy={y} r={3} className="fill-sky-500"/>;
                })}
            </svg>
            <div className="mt-2 flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>{points[0].date.slice(5)}</span>
                <span className="font-medium">Latest: {last.avgScore.toFixed(1)}</span>
                <span>{last.date.slice(5)}</span>
            </div>
        </div>
    );
};

const WeekdayMoodBars: React.FC<{data: WeekdayMood[]}> = ({ data }) => {
    if (data.length === 0) return <p className="text-sm text-slate-500 dark:text-slate-400">Not enough entries yet.</p>;
    const max = Math.max(...data.map(d=>d.avgScore), 10);
    return (
        <div className="space-y-2">
            {data.map(d => (
                <div key={d.weekday} className="flex items-center space-x-2">
                    <span className="w-16 shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">{d.weekday.slice(0,3)}</span>
                    <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-sky-400 to-teal-500" style={{ width: `${(d.avgScore/max)*100}%` }} />
                    </div>
                    <span className="w-8 text-xs text-right text-slate-600 dark:text-slate-300">{d.avgScore.toFixed(1)}</span>
                </div>
            ))}
        </div>
    );
};

const EmotionChips: React.FC<{emotions: EmotionFrequency[]}> = ({ emotions }) => {
    if (emotions.length === 0) return <p className="text-sm text-slate-500 dark:text-slate-400">Write more to surface core emotions.</p>;
    return (
        <div className="flex flex-wrap gap-2">
            {emotions.map(e => (
                <span key={e.emotion} className="px-3 py-1 rounded-full text-xs font-medium bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/40">{e.emotion} <span className="opacity-60">×{e.count}</span></span>
            ))}
        </div>
    );
};

const PositiveWordsList: React.FC<{words: PositiveWordStat[]}> = ({ words }) => {
    if (words.length === 0) return <p className="text-sm text-slate-500 dark:text-slate-400">Positive word usage will appear once you have more uplifting entries.</p>;
    return (
        <div className="flex flex-wrap gap-3">
            {words.map(w => (
                <div key={w.word} className="px-3 py-2 rounded-lg bg-gradient-to-br from-teal-50 to-sky-50 dark:from-teal-900/40 dark:to-sky-900/40 border border-teal-200/60 dark:border-teal-800/40 shadow-sm">
                    <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">{w.word}</span>
                    <span className="ml-1 text-[10px] text-slate-500 dark:text-slate-400">{w.count}</span>
                </div>
            ))}
        </div>
    );
};

export default InsightsPage;
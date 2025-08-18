import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { DiaryEntry, Recommendation, EmotionSuggestion } from '../types';
import { getRecommendations } from '../utils/recommendations';
import { WandSparklesIcon, XCircleIcon, ClockIcon } from '../components/Icons';
import { saveCache, loadCache } from '../offline_db';

interface RecommendationsPageProps {
  entries: DiaryEntry[];
}

const pageVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 120, staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const RecommendationsPage: React.FC<RecommendationsPageProps> = ({ entries }) => {
        // Ensure we use true most recent entry by timestamp (entries may not be pre-sorted)
        const latestEntry = useMemo(() => {
            if (!entries.length) return undefined;
            return [...entries].sort((a,b)=> new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        }, [entries]);
        const recSections = useMemo(() => getRecommendations(latestEntry, entries), [latestEntry, entries]);
    const [personalized, setPersonalized] = useState<Recommendation[]>([]);
    const [pattern, setPattern] = useState<Recommendation[]>([]);
    const [general, setGeneral] = useState<Recommendation[]>([]);
    const [emotionBundles, setEmotionBundles] = useState<EmotionSuggestion[]>([]);

    useEffect(() => {
        (async () => {
            // Attempt to hydrate from cache when offline
                        if (!navigator.onLine) {
                                            const cached = await loadCache('recs:sections.v2');
                            if (cached) {
                                                setPersonalized(cached.personalized || []);
                                setPattern(cached.pattern || []);
                                                setGeneral(cached.general || []);
                                                setEmotionBundles(cached.emotionBundles || []);
                                return;
                            }
                        }
                                        setPersonalized(recSections.personalized);
                        setPattern(recSections.pattern);
                                        setGeneral(recSections.general);
                                        setEmotionBundles(recSections.emotionBundles);
                                        saveCache('recs:sections.v2', recSections);
                })();
        }, [recSections]);


            const handleDismiss = (id: string, section: 'personalized' | 'pattern' | 'general') => {
                    const updaterMap: Record<string, React.Dispatch<React.SetStateAction<Recommendation[]>>> = {
                        personalized: setPersonalized,
                        pattern: setPattern,
                        general: setGeneral,
                    } as any;
                const updater = updaterMap[section];
                updater(list => list.filter(r => r.id !== id));
    };

    if (entries.length === 0) {
        return (
            <motion.div
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="p-4 sm:p-6 lg:p-8 h-full flex items-center justify-center text-center"
            >
                <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <WandSparklesIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                    <h2 className="mt-4 text-xl font-semibold text-slate-700 dark:text-slate-200">Unlock Personalized Recommendations</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md">
                        Start journaling to receive suggestions and resources tailored just for you. Your recommendations will appear here.
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
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">Recommendations</h1>
            
                                                {personalized.length > 0 && (
                            <motion.section variants={itemVariants} className="mb-12">
                                            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Personalized Suggestions – Recent Entry</h2>
                                            <p className="text-slate-500 dark:text-slate-400 mb-4">Immediate support based on what you just wrote.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <AnimatePresence>
                                                    {personalized.map(rec => (
                                                        <RecommendationCard key={rec.id} recommendation={rec} onDismiss={() => handleDismiss(rec.id, 'personalized')} />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.section>
                        )}
                                                {personalized.length === 0 && entries.length > 0 && (
                                                    <motion.section variants={itemVariants} className="mb-12">
                                                        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Personalized Suggestions – Recent Entry</h2>
                                                        <p className="text-slate-500 dark:text-slate-400 mb-4">No immediate flags detected in your latest entry. Try expressing how you feel (e.g. "anxious", "overwhelmed", "sad") for tailored suggestions.</p>
                                                    </motion.section>
                                                )}

                        {pattern.length > 0 && (
                            <motion.section variants={itemVariants} className="mb-12">
                                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Emerging Patterns</h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-4">Insights based on trends over the last couple of weeks.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <AnimatePresence>
                                        {pattern.map(rec => (
                                            <RecommendationCard key={rec.id} recommendation={rec} onDismiss={() => handleDismiss(rec.id, 'pattern')} />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.section>
                        )}

                                    {general.length > 0 && (
                            <motion.section variants={itemVariants} className="mb-12">
                                            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">General & Popular Resources</h2>
                                            <p className="text-slate-500 dark:text-slate-400 mb-4">Widely helpful tools and best practices for overall wellbeing.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <AnimatePresence>
                                                    {general.map(rec => (
                                                        <RecommendationCard key={rec.id} recommendation={rec} onDismiss={() => handleDismiss(rec.id, 'general')} />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.section>
                        )}
                                    {emotionBundles.length > 0 && (
                                        <motion.section variants={itemVariants} className="mt-16">
                                            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Emotion‑Tagged Quick Aids</h2>
                                            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-2xl">Pick a feeling to explore 1–2 fast, practical supports.</p>
                                            <div className="space-y-8">
                                                {emotionBundles.map(bundle => (
                                                    <div key={bundle.emotion}>
                                                        <h3 className="text-lg font-semibold capitalize text-slate-700 dark:text-slate-200 mb-3">{bundle.emotion}</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <AnimatePresence>
                                                                {bundle.items.map(item => (
                                                                    <RecommendationCard key={item.id} recommendation={item} onDismiss={() => { /* no dismiss for emotion micro items */ }} />
                                                                ))}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.section>
                                    )}

        </motion.div>
    );
};

interface RecommendationCardProps {
    recommendation: Recommendation;
    onDismiss: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onDismiss }) => {
    const { icon: Icon, title, description, source, link } = recommendation;
    
    const CardContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-shadow hover:shadow-lg dark:hover:shadow-brand-900/40 relative overflow-hidden group">
            <div className="p-5 flex-grow">
                <div className="flex items-start justify-between">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400`}>
                        <Icon className="h-6 w-6" />
                    </div>
                     <button onClick={onDismiss} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Dismiss recommendation">
                        <XCircleIcon />
                    </button>
                </div>
                <h3 className="mt-4 font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 flex-grow">{description}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-2 border-t dark:border-slate-700">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase">{source}</p>
            </div>
        </div>
    );
    
    return (
        <motion.div variants={itemVariants} exit="exit" layout="position">
            {link && link !== '#' ? (
                <a href={link} target="_blank" rel="noopener noreferrer" className="block h-full">
                    <CardContent />
                </a>
            ) : (
                <CardContent />
            )}
        </motion.div>
    );
};


export default RecommendationsPage;
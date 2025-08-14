import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { DiaryEntry, Recommendation } from '../types';
import { getRecommendations } from '../utils/recommendations';
import { WandSparklesIcon, XCircleIcon, ClockIcon } from '../components/Icons';

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
    const latestEntry = entries.length > 0 ? entries[0] : undefined;
    
    const allRecommendations = useMemo(() => getRecommendations(latestEntry), [latestEntry]);

    const [visibleTriggered, setVisibleTriggered] = useState<Recommendation[]>([]);
    const [visibleResources, setVisibleResources] = useState<Recommendation[]>([]);

    useEffect(() => {
        setVisibleTriggered(allRecommendations.triggered);
        setVisibleResources(allRecommendations.resources);
    }, [allRecommendations]);


    const handleDismiss = (id: string, type: 'triggered' | 'resource') => {
        if (type === 'triggered') {
            setVisibleTriggered(current => current.filter(r => r.id !== id));
        } else {
            setVisibleResources(current => current.filter(r => r.id !== id));
        }
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
            
            {visibleTriggered.length > 0 && (
                <motion.section variants={itemVariants} className="mb-12">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">For You Today</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Based on your recent entry, here are a few things that might help.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                        {visibleTriggered.map(rec => (
                            <RecommendationCard key={rec.id} recommendation={rec} onDismiss={() => handleDismiss(rec.id, 'triggered')} />
                        ))}
                        </AnimatePresence>
                    </div>
                </motion.section>
            )}

             <motion.section variants={itemVariants}>
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">Resource Library</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {visibleResources.map(rec => (
                            <RecommendationCard key={rec.id} recommendation={rec} onDismiss={() => handleDismiss(rec.id, 'resource')} />
                        ))}
                    </AnimatePresence>
                </div>
            </motion.section>

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
        <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-shadow hover:shadow-lg dark:hover:shadow-sky-900/50 relative overflow-hidden group">
            <div className="p-5 flex-grow">
                <div className="flex items-start justify-between">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400`}>
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
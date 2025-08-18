import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalysisResult } from '../types';
import { SparklesIcon, HeartIcon, BrainCircuitIcon, LightbulbIcon, AlertTriangleIcon } from './Icons';

interface AnalysisDisplayProps {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

const emotionColorMap: { [key: string]: string } = {
  joy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  sadness: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  anger: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  fear: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  anxiety: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  surprise: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
  hope: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  calm: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
  love: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
  gratitude: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
};

const getEmotionColor = (emotion: string) => {
    return emotionColorMap[emotion.toLowerCase()] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
};


const SkeletonLoader: React.FC = () => (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mt-4"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        </div>
    </div>
);


export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, isLoading, error }) => {
  const { t } = useTranslation();
  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-300 p-4 rounded-lg flex items-start space-x-3">
        <AlertTriangleIcon className="mt-1" />
        <div>
          <h3 className="font-semibold">{t('analysis.errorTitle')}</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
        <SparklesIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
  <p className="mt-4">{t('analysis.placeholder')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
      <div>
          <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200 flex items-center mb-2">
            <BrainCircuitIcon />
            {t('analysis.summaryTitle')}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 italic">"{analysis.summary}"</p>
      </div>

      <div>
          <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200 flex items-center mb-3">
            <HeartIcon />
            {t('analysis.emotionsTitle')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.emotions.map((emotion, index) => (
              <span key={index} className={`px-2.5 py-1 text-sm font-medium rounded-full ${getEmotionColor(emotion)}`}>
                {emotion}
              </span>
            ))}
          </div>
      </div>
      
      <div>
          <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200 flex items-center mb-3">
            <LightbulbIcon />
            {t('analysis.suggestionsTitle')}
          </h3>
          <ul className="space-y-2 list-disc list-inside text-slate-600 dark:text-slate-300">
            {analysis.suggestions.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
      </div>
    </div>
  );
};
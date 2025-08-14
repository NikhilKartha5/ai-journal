export interface AnalysisResult {
  sentimentScore: number;
  emotions: string[];
  summary: string;
  suggestions: string[];
}

export interface DiaryEntry {
  id: number;
  text: string;
  timestamp: string;
  analysis: AnalysisResult;
}

export interface WeeklyRecapData {
  topEmotions: { emotion: string; count: number }[];
  bestDay: { day: string; score: number } | null;
  worstDay: { day: string; score: number } | null;
  changeSinceLastWeek: number | null;
  entryCount: number;
}

export interface TrendInsight {
  id: string;
  icon: 'trending_down' | 'trending_up' | 'calendar_month' | 'schedule';
  text: string;
  color: 'red' | 'green' | 'blue' | 'yellow';
}

export interface Affirmation {
  id: number;
  text: string;
}

export type RecommendationType = 'video' | 'task' | 'article' | 'exercise';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  source: string;
  link?: string;
  icon: React.FC<{ className?: string }>;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  reminders: {
    enabled: boolean;
    time: string;
  };
}

export interface TherapistReportOptions {
  startDate: string;
  endDate: string;
  includeEntries: boolean;
  includeSummaries: boolean;
  includeChart: boolean;
  isAnonymous: boolean;
  shareMethod: 'download' | 'email' | 'link';
  therapistEmail?: string;
}

export interface User {
  name: string;
  email: string;
  password?: string; // Password should not be stored in state, only used for registration
}
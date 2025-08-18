import type React from 'react';
export interface AnalysisResult {
  sentimentScore: number;
  emotions: string[];
  summary: string;
  suggestions: string[];
}

export interface DiaryEntry {
  id: number | string; // temp numeric id (Date.now()) or persistent Mongo _id string
  text: string;
  timestamp: string;
  analysis: AnalysisResult;
  pending?: boolean; // unsynced create
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

// --- Extended Insight Data Types ---
export interface MoodTrendPoint {
  date: string; // YYYY-MM-DD
  avgScore: number; // 1-10
}

export interface WeekdayMood {
  weekday: string; // Monday, Tuesday...
  avgScore: number;
}

export interface EmotionFrequency {
  emotion: string;
  count: number;
}

export interface PositiveWordStat {
  word: string;
  count: number;
}

// Community Feed
export interface CommunityPost {
  id: string;
  content: string;
  sentimentScore: number;
  emotions: string[];
  likes: number;
  createdAt: string;
  author: string; // anonymized
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
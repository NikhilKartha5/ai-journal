import { DiaryEntry, WeeklyRecapData, TrendInsight, Affirmation, MoodTrendPoint, WeekdayMood, EmotionFrequency, PositiveWordStat } from '../types';
import { scaleLinear } from 'd3-scale';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// --- Calendar Heatmap ---

export const getCalendarData = (entries: DiaryEntry[], numDays: number = 180) => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (numDays - 1) * MS_PER_DAY);
  
  const entriesByDate: { [key: string]: { scores: number[], count: number } } = {};
  
  for (const entry of entries) {
    const entryDate = new Date(entry.timestamp);
    if (entryDate >= startDate && entryDate <= endDate) {
      const dateString = entryDate.toISOString().split('T')[0];
      if (!entriesByDate[dateString]) {
        entriesByDate[dateString] = { scores: [], count: 0 };
      }
      entriesByDate[dateString].scores.push(entry.analysis.sentimentScore);
      entriesByDate[dateString].count++;
    }
  }

  const calendarData: { [key: string]: { level: number, score: number } } = {};
  const colorScale = scaleLinear<number, number>().domain([1, 10]).range([0, 4]);

  for (const date in entriesByDate) {
    const dayData = entriesByDate[date];
    const avgScore = dayData.scores.reduce((sum, score) => sum + score, 0) / dayData.count;
    calendarData[date] = {
      level: Math.round(colorScale(avgScore)),
      score: parseFloat(avgScore.toFixed(1))
    };
  }
  
  return { calendarData, startDate, endDate };
};

// --- Weekly Recap ---

export const getWeeklyRecap = (entries: DiaryEntry[]): WeeklyRecapData => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * MS_PER_DAY);
  const twoWeeksAgo = new Date(now.getTime() - 14 * MS_PER_DAY);

  const thisWeekEntries = entries.filter(e => new Date(e.timestamp) >= oneWeekAgo);
  const lastWeekEntries = entries.filter(e => {
    const entryDate = new Date(e.timestamp);
    return entryDate >= twoWeeksAgo && entryDate < oneWeekAgo;
  });

  // Top emotions
  const emotionCounts = thisWeekEntries
    .flatMap(e => e.analysis.emotions)
    .reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  
  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emotion, count]) => ({ emotion, count }));

  // Best/Worst day
  const dailyScores: { [key: string]: number[] } = {};
  for (const entry of thisWeekEntries) {
    const day = new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
    if (!dailyScores[day]) dailyScores[day] = [];
    dailyScores[day].push(entry.analysis.sentimentScore);
  }

  const avgDailyScores = Object.entries(dailyScores).map(([day, scores]) => ({
    day,
    score: scores.reduce((a, b) => a + b, 0) / scores.length,
  }));

  const bestDay = avgDailyScores.length > 0 ? avgDailyScores.reduce((best, current) => current.score > best.score ? current : best) : null;
  const worstDay = avgDailyScores.length > 0 ? avgDailyScores.reduce((worst, current) => current.score < worst.score ? current : worst) : null;

  // Change since last week
  const avgThisWeek = thisWeekEntries.length > 0 ? thisWeekEntries.reduce((sum, e) => sum + e.analysis.sentimentScore, 0) / thisWeekEntries.length : null;
  const avgLastWeek = lastWeekEntries.length > 0 ? lastWeekEntries.reduce((sum, e) => sum + e.analysis.sentimentScore, 0) / lastWeekEntries.length : null;
  let changeSinceLastWeek = null;
  if (avgThisWeek !== null && avgLastWeek !== null) {
    changeSinceLastWeek = ((avgThisWeek - avgLastWeek) / avgLastWeek) * 100;
  }
  
  return {
    topEmotions,
    bestDay,
    worstDay,
    changeSinceLastWeek,
    entryCount: thisWeekEntries.length,
  };
};

// --- Trend Insights ---

export const generateTrendInsights = (entries: DiaryEntry[]): TrendInsight[] => {
  if (entries.length < 5) return [];

  const insights: TrendInsight[] = [];
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // Insight 1: Best/Worst day of the week
  const moodByDay: { [key: number]: number[] } = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  entries.forEach(e => {
    const day = new Date(e.timestamp).getDay();
    moodByDay[day].push(e.analysis.sentimentScore);
  });
  
  const avgMoodByDay = Object.entries(moodByDay)
    .filter(([, scores]) => scores.length > 0)
    .map(([day, scores]) => ({
      day: parseInt(day),
      avg: scores.reduce((a, b) => a + b, 0) / scores.length
    }));
  
  if (avgMoodByDay.length > 2) {
    const worstDay = avgMoodByDay.reduce((min, day) => day.avg < min.avg ? day : min);
    insights.push({
      id: 'worst-day',
      icon: 'trending_down',
      text: `Your mood seems to be lowest on ${daysOfWeek[worstDay.day]}s.`,
      color: 'red'
    });
  }

  // Insight 2: Mood trend over the last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * MS_PER_DAY);
  const recentEntries = entries.filter(e => new Date(e.timestamp) > thirtyDaysAgo);
  if(recentEntries.length > 5) {
      const firstHalf = recentEntries.filter(e => new Date(e.timestamp) < new Date(now.getTime() - 15 * MS_PER_DAY));
      const secondHalf = recentEntries.filter(e => new Date(e.timestamp) >= new Date(now.getTime() - 15 * MS_PER_DAY));
      
      if(firstHalf.length > 2 && secondHalf.length > 2) {
          const avgFirstHalf = firstHalf.reduce((s, e) => s + e.analysis.sentimentScore, 0) / firstHalf.length;
          const avgSecondHalf = secondHalf.reduce((s, e) => s + e.analysis.sentimentScore, 0) / secondHalf.length;

          if (avgSecondHalf > avgFirstHalf * 1.1) {
              insights.push({ id: 'mood-up', icon: 'trending_up', text: 'Your average mood has been trending upwards recently.', color: 'green' });
          } else if (avgSecondHalf < avgFirstHalf * 0.9) {
              insights.push({ id: 'mood-down', icon: 'trending_down', text: 'Your average mood has been trending downwards recently.', color: 'red' });
          }
      }
  }

  // Insight 3: Time of day
  const moodByHour: { [key: number]: number[] } = {};
  entries.forEach(e => {
    const hour = new Date(e.timestamp).getHours();
    if (!moodByHour[hour]) moodByHour[hour] = [];
    moodByHour[hour].push(e.analysis.sentimentScore);
  });
  
  const avgMoodByHour = Object.entries(moodByHour)
    .filter(([, scores]) => scores.length > 1)
    .map(([hour, scores]) => ({
      hour: parseInt(hour),
      avg: scores.reduce((a, b) => a + b, 0) / scores.length
    }));

  if (avgMoodByHour.length > 2) {
    const worstHour = avgMoodByHour.reduce((min, h) => h.avg < min.avg ? h : min);
    const timeDesc = worstHour.hour < 12 ? 'mornings' : worstHour.hour < 18 ? 'afternoons' : 'evenings';
    insights.push({
      id: 'worst-time',
      icon: 'schedule',
      text: `You tend to feel down most during the ${timeDesc}.`,
      color: 'yellow'
    });
  }

  // Additional Rules
  // 4. Consistency streak (consecutive days with at least one entry)
  const dateSet = new Set(entries.map(e => new Date(e.timestamp).toISOString().split('T')[0]));
  let streak = 0;
  const today = new Date();
  for (let i=0; i<30; i++) { // cap at 30 days lookback
    const d = new Date(today.getTime() - i * MS_PER_DAY);
    const key = d.toISOString().split('T')[0];
    if (dateSet.has(key)) streak++; else break;
  }
  if (streak >= 3) {
    insights.push({
      id: 'streak',
      icon: streak >= 7 ? 'trending_up' : 'calendar_month',
      text: streak >= 7 ? `Amazing consistency: ${streak} days in a row of journaling.` : `Nice streak: ${streak} consecutive days of entries. Consistency builds insight.`,
      color: streak >= 7 ? 'green' : 'blue'
    });
  }

  // 5. Weekend vs Weekday difference
  const weekendScores: number[] = [];
  const weekdayScores: number[] = [];
  entries.forEach(e => {
    const d = new Date(e.timestamp).getDay();
    (d === 0 || d === 6 ? weekendScores : weekdayScores).push(e.analysis.sentimentScore);
  });
  if (weekendScores.length >= 3 && weekdayScores.length >= 5) {
    const avgWeekend = weekendScores.reduce((a,b)=>a+b,0)/weekendScores.length;
    const avgWeekday = weekdayScores.reduce((a,b)=>a+b,0)/weekdayScores.length;
    const diff = avgWeekend - avgWeekday;
    if (Math.abs(diff) >= 0.8) {
      if (diff > 0) {
        insights.push({ id: 'weekend-lift', icon: 'trending_up', text: 'Weekends noticeably lift your mood.', color: 'green' });
      } else {
        insights.push({ id: 'weekend-slump', icon: 'trending_down', text: 'Weekends tend to feel heavier for you.', color: 'red' });
      }
    }
  }

  // 6. Emotion surge (last 7 days vs prior 14 days)
  const nowTime = Date.now();
  const last7 = entries.filter(e => nowTime - new Date(e.timestamp).getTime() <= 7 * MS_PER_DAY);
  const prev14 = entries.filter(e => {
    const diff = nowTime - new Date(e.timestamp).getTime();
    return diff > 7 * MS_PER_DAY && diff <= 21 * MS_PER_DAY; // days 8-21
  });
  if (last7.length >= 4 && prev14.length >= 4) {
    const countEmotions = (arr: DiaryEntry[]) => arr.flatMap(e => e.analysis.emotions).reduce((acc, em) => { acc[em] = (acc[em]||0)+1; return acc; }, {} as Record<string, number>);
    const lastCounts = countEmotions(last7);
    const prevCounts = countEmotions(prev14);
    const topLast = Object.entries(lastCounts).sort((a,b)=>b[1]-a[1])[0];
    if (topLast) {
      const [emotion, recentCount] = topLast;
      const prevCount = prevCounts[emotion] || 0;
      if (recentCount >= 2 && prevCount >= 1) {
        if (recentCount >= prevCount * 1.5) {
          insights.push({ id: 'emotion-surge-'+emotion, icon: 'calendar_month', text: `You're expressing more '${emotion}' recently.`, color: 'blue' });
        } else if (recentCount <= prevCount * 0.5) {
          insights.push({ id: 'emotion-drop-'+emotion, icon: 'calendar_month', text: `Less frequent mention of '${emotion}' lately.`, color: 'yellow' });
        }
      }
    }
  }

  // 7. Mood volatility (std dev / mean) last 14 days
  const last14Entries = entries.filter(e => nowTime - new Date(e.timestamp).getTime() <= 14 * MS_PER_DAY);
  if (last14Entries.length >= 6) {
    const scores = last14Entries.map(e => e.analysis.sentimentScore);
    const mean = scores.reduce((a,b)=>a+b,0)/scores.length;
    const variance = scores.reduce((a,b)=> a + Math.pow(b-mean,2),0)/scores.length;
    const std = Math.sqrt(variance);
    if (mean > 0) {
      const cv = std / mean; // coefficient of variation
      if (cv >= 0.35) {
        insights.push({ id: 'high-volatility', icon: 'calendar_month', text: 'Your mood swings have been larger than usual lately.', color: 'yellow' });
      }
    }
  }

  return insights.slice(0, 5);
};


// --- Affirmations ---

export const extractAffirmations = (entries: DiaryEntry[]): Affirmation[] => {
  const positiveEntries = entries
    .filter(e => e.analysis.sentimentScore >= 8)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const affirmations = positiveEntries.map(entry => {
    // A simple heuristic: find a short, positive sentence.
    const sentences = entry.text.split(/[.!?]/).filter(s => s.trim().length > 0);
    const shortSentences = sentences.filter(s => s.split(' ').length > 5 && s.split(' ').length < 20);
    return {
      id: entry.id,
      text: shortSentences.length > 0 ? shortSentences[0].trim() : entry.analysis.summary
    };
  });

  return affirmations.slice(0, 5); // Return up to 5 recent affirmations
};

// --- Extended Insight Helpers ---

// Daily mood trend (last 30 days)
export const getMoodTrend = (entries: DiaryEntry[], days: number = 30): MoodTrendPoint[] => {
  if (!entries.length) return [];
  const end = new Date();
  const start = new Date(end.getTime() - (days - 1) * MS_PER_DAY);
  const byDate: Record<string, number[]> = {};
  entries.forEach(e => {
    const d = new Date(e.timestamp);
    if (d >= start && d <= end) {
      const key = d.toISOString().split('T')[0];
      (byDate[key] ||= []).push(e.analysis.sentimentScore);
    }
  });
  const points: MoodTrendPoint[] = Object.entries(byDate)
    .sort((a,b) => a[0].localeCompare(b[0]))
    .map(([date, scores]) => ({ date, avgScore: parseFloat((scores.reduce((s,v)=>s+v,0)/scores.length).toFixed(2)) }));
  return points;
};

// Average mood per weekday
export const getWeekdayMood = (entries: DiaryEntry[]): WeekdayMood[] => {
  if (!entries.length) return [];
  const buckets: Record<number, number[]> = {0:[],1:[],2:[],3:[],4:[],5:[],6:[]};
  entries.forEach(e => { buckets[new Date(e.timestamp).getDay()].push(e.analysis.sentimentScore); });
  const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return Object.entries(buckets)
    .filter(([,scores]) => scores.length > 0)
    .map(([day, scores]) => ({
      weekday: names[parseInt(day)],
      avgScore: parseFloat((scores.reduce((s,v)=>s+v,0)/scores.length).toFixed(2))
    }))
    .sort((a,b) => names.indexOf(a.weekday) - names.indexOf(b.weekday));
};

// Emotion frequencies overall (top N)
export const getEmotionFrequencies = (entries: DiaryEntry[], topN: number = 8): EmotionFrequency[] => {
  const counts: Record<string, number> = {};
  entries.forEach(e => e.analysis.emotions.forEach(em => counts[em] = (counts[em] || 0) + 1));
  return Object.entries(counts).map(([emotion, count]) => ({ emotion, count }))
    .sort((a,b) => b.count - a.count).slice(0, topN);
};

// Positive word frequency (simple heuristic)
const POSITIVE_WORDS = ['love','grateful','happy','progress','calm','proud','excited','optimistic','peace','joy','confident','strong'];
export const getPositiveWordStats = (entries: DiaryEntry[], topN: number = 6): PositiveWordStat[] => {
  const counts: Record<string, number> = {};
  entries.forEach(e => {
    const words = e.text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    words.forEach(w => { if (POSITIVE_WORDS.includes(w)) counts[w] = (counts[w] || 0) + 1; });
  });
  return Object.entries(counts).map(([word, count]) => ({ word, count }))
    .sort((a,b)=> b.count - a.count).slice(0, topN);
};

// Simple moving average smoothing (for potential future graphs)
export const smoothTrend = (points: MoodTrendPoint[], windowSize: number = 3): MoodTrendPoint[] => {
  if (windowSize <= 1) return points;
  const smoothed: MoodTrendPoint[] = [];
  for (let i=0;i<points.length;i++) {
    const start = Math.max(0, i - windowSize + 1);
    const slice = points.slice(start, i+1);
    const avg = slice.reduce((s,p)=>s+p.avgScore,0)/slice.length;
    smoothed.push({ date: points[i].date, avgScore: parseFloat(avg.toFixed(2)) });
  }
  return smoothed;
};

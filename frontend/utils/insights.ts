import { DiaryEntry, WeeklyRecapData, TrendInsight, Affirmation } from '../types';
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

  return insights.slice(0, 3);
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

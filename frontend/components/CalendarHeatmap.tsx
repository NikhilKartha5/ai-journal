import React from 'react';
import { AppSettings } from '../types';

interface CalendarHeatmapProps {
  startDate: Date;
  data: { [key: string]: { level: number; score: number } };
  onDayClick?: (date: Date) => void;
  theme?: AppSettings['theme'];
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAY_SIZE = 14;
const DAY_GAP = 3;
const WEEK_WIDTH = DAY_SIZE + DAY_GAP;
const MONTH_LABEL_HEIGHT = 20;

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Brand gradient (light → intense) for heatmap levels
const lightColors = ['#f1f5f9', '#e9d5ff', '#c084fc', '#a855f7', '#7c3aed']; // slate-100 to brand-600
const darkColors = ['#1e293b', '#4c1d95', '#5b21b6', '#7e22ce', '#a21caf']; // slate-800 through violet spectrum

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ startDate, data, onDayClick, theme = 'system' }) => {
  const isDarkMode =
      theme === 'dark' ||
      (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const colors = isDarkMode ? darkColors : lightColors;
  const emptyColor = isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'; // A bit of glow on dark empty cells

  const today = new Date();
  const weeks: { date: Date; level: number; score: number }[][] = [];
  let currentDate = new Date(startDate);
  
  // Align start date to the previous Sunday
  currentDate.setDate(currentDate.getDate() - currentDate.getDay());

  while (currentDate <= today) {
    const week: { date: Date; level: number; score: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayData = data[dateKey];
      if (currentDate >= startDate && currentDate <= today) {
          week.push({
            date: new Date(currentDate),
            level: dayData ? dayData.level : -1,
            score: dayData ? dayData.score : 0,
          });
      } else {
          // Push empty placeholder for days before start date
          week.push({ date: new Date(currentDate), level: -2, score: 0 });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
  }

  return (
    <div className="relative overflow-x-auto pb-2">
      <svg width={weeks.length * WEEK_WIDTH + 30} height={7 * WEEK_WIDTH + MONTH_LABEL_HEIGHT}>
        {/* Month Labels */}
        <g transform={`translate(30, ${MONTH_LABEL_HEIGHT - 5})`}>
          {weeks.map((week, weekIndex) => {
            const firstDayOfWeek = week[0].date;
            // Show month label for the first week of the month or the first week in the chart
            if (weekIndex === 0 || firstDayOfWeek.getDate() <= 7) {
              const monthLabel = monthLabels[firstDayOfWeek.getMonth()];
              return (
                <text
                  key={weekIndex}
                  x={weekIndex * WEEK_WIDTH}
                  y={-8}
                  className="text-xs fill-current text-slate-500 dark:text-slate-400"
                >
                  {monthLabel}
                </text>
              );
            }
            return null;
          })}
        </g>
        
        {/* Day labels */}
        <g transform={`translate(0, ${MONTH_LABEL_HEIGHT})`}>
             {dayLabels.map((day, i) => ( i % 2 !== 0 && (
                <text key={day} x={15} y={i * WEEK_WIDTH + (DAY_SIZE/2) + 4} textAnchor="middle" className="text-xs fill-current text-slate-400 dark:text-slate-500">
                    {day}
                </text>
             )))}
        </g>
        
        <g transform={`translate(30, ${MONTH_LABEL_HEIGHT})`}>
          {weeks.map((week, weekIndex) => (
            <g key={weekIndex} transform={`translate(${weekIndex * WEEK_WIDTH}, 0)`}>
              {week.map((day, dayIndex) => {
                if(day.level === -2) return null; // Don't render placeholders
                
                const color = day.level === -1 ? emptyColor : colors[day.level];
                return (
                  <rect
                    key={day.date.toISOString()}
                    x={0}
                    y={dayIndex * WEEK_WIDTH}
                    width={DAY_SIZE}
                    height={DAY_SIZE}
                    fill={color}
                    rx={3}
                    ry={3}
                    data-date={day.date.toISOString().split('T')[0]}
                    data-score={day.score}
                    onClick={() => onDayClick && onDayClick(day.date)}
                    className={`day-cell ${onDayClick ? 'cursor-pointer' : ''}`}
                  >
                    <title>{`${day.date.toLocaleDateString()}: ${day.score > 0 ? `Mood ${day.score}` : 'No entry'}`}</title>
                  </rect>
                );
              })}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default CalendarHeatmap;
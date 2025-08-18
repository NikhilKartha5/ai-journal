import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DiaryEntry, AppSettings } from '../types';

interface MoodChartProps {
  data: DiaryEntry[];
  theme?: AppSettings['theme'];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 p-3 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-700 dark:text-slate-200">{`Date: ${new Date(label).toLocaleDateString()}`}</p>
                <p className="text-brand-600 dark:text-brand-400">{`Mood Score: ${payload[0].value}`}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">{`"${payload[0].payload.analysis.summary}"`}</p>
            </div>
        );
    }
    return null;
};

export const MoodChart: React.FC<MoodChartProps> = ({ data, theme = 'system' }) => {
  const chartData = data.map(entry => ({
    timestamp: entry.timestamp,
    moodScore: entry.analysis.sentimentScore,
    analysis: entry.analysis,
  })).reverse(); // Reverse to show time progression from left to right
  
  const isDarkMode =
      theme === 'dark' ||
      (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const gridColor = isDarkMode ? '#334155' : '#e2e8f0'; // slate-700 : slate-200
  const textColor = isDarkMode ? '#94a3b8' : '#64748b'; // slate-400 : slate-500
  const lineColor = isDarkMode ? '#a855f7' : '#7c3aed'; // brand mid : brand primary
  const activeDotColor = isDarkMode ? '#d8b4fe' : '#6d28d9'; // brand light : brand dark

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(timeStr) => new Date(timeStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            stroke={textColor}
            fontSize={12}
            tickLine={{ stroke: textColor }}
          />
          <YAxis 
            dataKey="moodScore" 
            domain={[1, 10]} 
            allowDataOverflow={true}
            stroke={textColor}
            fontSize={12}
            tickLine={{ stroke: textColor }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: textColor, strokeWidth: 1, strokeDasharray: '3 3' }}/>
          <Legend wrapperStyle={{fontSize: "14px", color: textColor}}/>
          <Line 
            type="monotone" 
            dataKey="moodScore" 
            stroke={lineColor} 
            strokeWidth={2}
            dot={{ r: 4, fill: lineColor, stroke: 'none' }}
            activeDot={{ r: 6, stroke: activeDotColor, fill: lineColor }}
            name="Mood Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
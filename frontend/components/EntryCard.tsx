import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DiaryEntry } from '../types';
import { ShareIcon, PrinterIcon, ChevronDownIcon, TrashIcon, HeartIcon } from './Icons';

interface EntryCardProps { entry: DiaryEntry & { pending?: boolean }; onDelete: (id: number | string) => void; onUpdate?: (id: string | number, newText: string) => void; }

export const EntryCard: React.FC<EntryCardProps> = ({ entry, onDelete, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { id, text, timestamp, analysis, title, tags } = entry;
  const date = new Date(timestamp);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const shareViaEmail = () => {
    const subject = `My Diary Entry from ${date.toLocaleDateString()}`;
    const body = `Date: ${date.toLocaleString()}\n\nMood Score: ${analysis.sentimentScore}/10\n\nEntry:\n${text}\n\nSummary:\n${analysis.summary}\n\nEmotions:\n${analysis.emotions.join(', ')}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    // Try to open mail client
    const win = window.open(mailtoLink, '_blank');
    setTimeout(() => {
      if (!win || win.closed || typeof win.closed === 'undefined') {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(body).then(() => {
          setShareMsg('Entry copied to clipboard! Paste it into your email app.');
        }, () => {
          setShareMsg('Could not open mail client or copy to clipboard.');
        });
      } else {
        setShareMsg(null);
      }
    }, 500);
  };

  const handlePrint = () => {
    const cardElement = document.getElementById(`entry-${id}`);
    if (!cardElement) return;

    const originalBodyClassName = document.body.className;
    document.body.className = `${originalBodyClassName} printing-entry`;
    cardElement.classList.add('printable');

    window.print();

    cardElement.classList.remove('printable');
    document.body.className = originalBodyClassName;
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
        onDelete(id);
    }
  };

  const sentimentColor =
    analysis.sentimentScore > 7 ? 'border-green-400 dark:border-green-500' :
    analysis.sentimentScore > 4 ? 'border-yellow-400 dark:border-yellow-500' :
    'border-red-400 dark:border-red-500';
  
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
  const getEmotionColor = (emotion: string) => emotionColorMap[emotion.toLowerCase()] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';

  return (
  <div id={`entry-${id}`} className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border-l-4 ${sentimentColor} transition-shadow hover:shadow-md dark:hover:shadow-brand-900/40`}>
    <div className="p-5">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          {title && <h3 className="text-base font-semibold leading-snug text-slate-800 dark:text-slate-100 mb-0.5 line-clamp-1">{title}</h3>}
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
            {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {entry.pending && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700">Unsynced</span>}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{date.toLocaleTimeString()}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Mood Score: <span className="font-bold text-slate-700 dark:text-slate-200">{analysis.sentimentScore}/10</span></p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <HeartIcon className="h-4 w-4 text-rose-400"/>
            {analysis.emotions.slice(0, 3).map((emotion) => (
              <span key={emotion} className={`px-2 py-0.5 text-xs font-medium rounded-full ${getEmotionColor(emotion)}`}>
              {emotion}
              </span>
            ))}
            {tags && tags.slice(0,4).map(tag => (
              <span key={tag} className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300">#{tag}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-0.5 sm:space-x-1 no-print">
          <button onClick={shareViaEmail} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-600 dark:hover:text-brand-400 rounded-full transition-colors" aria-label="Share entry">
            <ShareIcon />
          </button>
          <button onClick={handlePrint} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-600 dark:hover:text-brand-400 rounded-full transition-colors" aria-label="Print entry">
            <PrinterIcon />
          </button>
          <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" aria-label="Delete entry">
            <TrashIcon />
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-600 dark:hover:text-brand-400 rounded-full transition-colors" aria-label="Expand entry">
            <ChevronDownIcon className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      {shareMsg && (
  <div className="mt-2 text-xs text-brand-600 dark:text-brand-400">{shareMsg}</div>
      )}
      <AnimatePresence>
      {isExpanded && (
         <motion.div
          key="details"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4 overflow-hidden"
         >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-300">Your Words</h4>
              {!isEditing && onUpdate && (
                <button onClick={() => { setIsEditing(true); setEditText(text); }} className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Edit</button>
              )}
            </div>
            {!isEditing && (
              <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{text}</p>
            )}
            {isEditing && (
              <div className="space-y-2">
                <textarea value={editText} onChange={e => setEditText(e.target.value)} className="w-full h-32 text-sm p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <div className="flex gap-2">
                  <button onClick={() => { setIsEditing(false); setEditText(text); }} className="px-3 py-1 text-xs rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                  <button onClick={() => { if (editText.trim() && editText !== text) { onUpdate && onUpdate(id, editText.trim()); } setIsEditing(false); }} className="px-3 py-1 text-xs rounded bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-40" disabled={!editText.trim() || editText === text}>Save</button>
                </div>
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-300 mb-1">Gentle Summary</h4>
            <p className="text-slate-700 dark:text-slate-300 italic">"{analysis.summary}"</p>
          </div>
         </motion.div>
      )}
      </AnimatePresence>
    </div>
  </div>
  );
};
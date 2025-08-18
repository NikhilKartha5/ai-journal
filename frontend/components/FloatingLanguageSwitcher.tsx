import React from 'react';
import { useTranslation } from 'react-i18next';
import { secureSet } from '../utils/secureStorage';

// Floating language switcher (always visible) as fallback if nav version not visible.
const FloatingLanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const current = i18n.language || 'en';
  const change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value; i18n.changeLanguage(lang); try { localStorage.setItem('lang', lang); secureSet('lang', lang); } catch {}
  };
  return (
    <div className="fixed z-50 bottom-4 right-4 flex flex-col items-end space-y-1">
      <label htmlFor="floating-lang" className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-800/70 px-2 py-0.5 rounded shadow">Lang</label>
      <select
        id="floating-lang"
        value={current}
        onChange={change}
  className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1 text-xs shadow focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="ta">தமிழ்</option>
        <option value="te">తెలుగు</option>
        <option value="ml">മലയാളം</option>
        <option value="bn">বাংলা</option>
      </select>
    </div>
  );
};

export default FloatingLanguageSwitcher;

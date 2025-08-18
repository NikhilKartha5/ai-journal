import React from 'react';
import { useTranslation } from 'react-i18next';
import { secureSet } from '../utils/secureStorage';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoIcon, HomeIcon, ChartBarIcon, BookOpenIcon, CogIcon, WandSparklesIcon, LogoutIcon, HeartIcon } from './Icons';
import { LightbulbIcon } from './Icons';

interface NavBarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onLogout: () => void;
}

type NavItemData = {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
};

function buildNavItems(t: any): NavItemData[] {
  return [
    { id: 'dashboard', label: t('nav.dashboard'), icon: HomeIcon },
    { id: 'insights', label: t('nav.insights'), icon: ChartBarIcon },
    { id: 'recommendations', label: t('nav.recommendations'), icon: LightbulbIcon },
    { id: 'journal', label: t('nav.journal'), icon: BookOpenIcon },
    { id: 'community', label: t('nav.community'), icon: HeartIcon },
    { id: 'settings', label: t('nav.settings'), icon: CogIcon },
  ];
}

export const NavBar: React.FC<NavBarProps> = ({ activePage, setActivePage, onLogout }) => {
  const { t } = useTranslation();
  const navItems = buildNavItems(t);
  return (
    <>
      {/* Desktop Sidebar */}
  <nav className="hidden md:flex flex-col items-center justify-between w-24 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 py-4 fixed h-full z-30">
        <div>
          <a href="#" className="mb-8 block" onClick={() => setActivePage('dashboard')}>
            <LogoIcon className="h-9 w-9 mx-auto" />
          </a>
          <ul className="flex flex-col items-center space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activePage === item.id}
                onClick={() => setActivePage(item.id)}
              />
            ))}
            <li className="pt-4">
              <LanguageSwitcher compact />
            </li>
          </ul>
        </div>
        <div className="flex flex-col items-center space-y-2">
           <button onClick={onLogout} title={t('nav.logout')} className="flex flex-col items-center justify-center w-16 h-16 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-500 transition-colors group relative">
              <LogoutIcon />
           </button>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 h-16 z-30">
        <ul className="flex justify-around items-center h-full">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activePage === item.id}
              onClick={() => setActivePage(item.id)}
              isMobile
            />
          ))}
          <li>
            <LanguageSwitcher />
          </li>
           <li>
              <button onClick={onLogout} className="flex flex-col items-center justify-center w-16 h-16 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors" aria-label={t('nav.logout')}>
                  <LogoutIcon className="h-6 w-6" />
              </button>
           </li>
        </ul>
      </nav>
    </>
  );
};

interface NavItemProps {
  item: NavItemData;
  isActive: boolean;
  onClick: () => void;
  isMobile?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ item, isActive, onClick, isMobile = false }) => {
  const { icon: Icon } = item;
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-colors duration-200 group relative ${
          isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400'
        }`}
        aria-label={item.label}
        aria-current={isActive ? 'page' : undefined}
      >
        <div className="relative flex flex-col items-center justify-center">
          <Icon className="h-6 w-6" />
          <AnimatePresence>
          {isActive && !isMobile && (
             <motion.div
                className="mt-1 h-1 w-4 rounded-full bg-sky-600 dark:bg-sky-400"
                layoutId="active-indicator"
             />
          )}
          </AnimatePresence>
          {isActive && isMobile && (
            <div className="mt-1 h-1 w-2 rounded-full bg-sky-600 dark:bg-sky-400" />
          )}
        </div>
        <span
          className={`mt-1 text-xs font-medium ${isMobile ? 'hidden' : 'block'} w-20 text-center truncate whitespace-nowrap`}
          style={{ maxWidth: '5rem' }}
        >
          {item.label}
        </span>
      </button>
    </li>
  );
};

// Small reusable language switcher (fallback if Settings page not rendering correctly)
const LanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { i18n } = useTranslation();
  const current = i18n.language || 'en';
  const change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value; i18n.changeLanguage(lang); try { localStorage.setItem('lang', lang); secureSet('lang', lang);} catch {}
  };
  return (
    <select
      value={current}
      onChange={change}
      className={`text-xs bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500 ${compact ? 'w-16' : 'w-20'}`}
      aria-label="Language"
    >
      <option value="en">EN</option>
      <option value="hi">हि</option>
      <option value="ta">TA</option>
      <option value="te">TE</option>
      <option value="ml">ML</option>
      <option value="bn">BN</option>
    </select>
  );
};
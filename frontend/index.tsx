
import React from 'react';
import './i18n';
import i18n from 'i18next';
import { secureGet } from './utils/secureStorage';
// Load stored language (no async/await needed)
// Async secure retrieval of language preference (non-blocking)
(async () => {
  try {
    const lang = (await secureGet('lang')) || localStorage.getItem('lang');
    if (lang) i18n.changeLanguage(lang as string);
  } catch {}
})();
import ReactDOM from 'react-dom/client';
import App from './App';
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

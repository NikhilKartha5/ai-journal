
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

// Register service worker only in production builds to avoid aggressive caching in dev
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        // Auto-reload when a new SW takes control (ensures latest UI loads)
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
            sw?.addEventListener('statechange', () => {
              if (sw.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available; force reload once
                window.location.reload();
              }
            });
        });
      })
      .catch(() => {});
  });
} else if (!import.meta.env.PROD && 'serviceWorker' in navigator) {
  // In dev, ensure any previously registered SW is removed to prevent stale cache
  navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
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

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AppProvider } from './context/AppContext';
import ToastProvider from './components/ToastProvider.tsx';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

// Initialize jeep-sqlite for web platform
jeepSqlite(window);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(error => {
      console.log('ServiceWorker registration failed: ', error);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <ToastProvider />
      <App />
    </AppProvider>
  </StrictMode>
);
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AppProvider } from './context/AppContext';
import ToastProvider from './components/ToastProvider.tsx';
import { JeepSqlite } from 'jeep-sqlite/dist/components/jeep-sqlite';

// Define the custom element for the SQLite PWA driver
customElements.define('jeep-sqlite', JeepSqlite);

const AppWrapper = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      const platform = (await (await import('@capacitor/core')).Capacitor.getPlatform());
      if (platform === 'web') {
        const jeepEl = document.createElement('jeep-sqlite');
        document.body.appendChild(jeepEl);
        await customElements.whenDefined('jeep-sqlite');
        await (await import('@capacitor-community/sqlite')).CapacitorSQLite.initWebStore();
      }
      setIsReady(true);
    };
    setup();
  }, []);

  if (!isReady) {
    return <div>Initializing Database...</div>; // Or a proper loading spinner
  }

  return (
    <StrictMode>
      <AppProvider>
        <ToastProvider />
        <App />
      </AppProvider>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')!).render(<AppWrapper />);
import React from 'react';
import { Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import NotificationsBell from './NotificationsBell';
import SegmentedControl from './SegmentedControl';
import SyncStatusIndicator from './SyncStatusIndicator';

const TopBar: React.FC = () => {
  const { 
    notifications, setCurrentView, headerAction, isTopBarVisible, currentView,
    isStudioHeaderSticky, studioSection, setStudioSection, studioSectionOptions
  } = useAppContext();
  
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const isStudioView = currentView === 'rolls';
  const isStudioSticky = isStudioView && isStudioHeaderSticky;

  const BackButton = headerAction ? headerAction.icon : null;

  // Always apply the glass style so the top bar looks consistent,
  // but keep the visibility/translate behavior controlled by isTopBarVisible.
  const headerClasses = `sticky top-0 z-40 transition-all duration-300 top-bar-glass ${!isTopBarVisible ? '-translate-y-full' : 'translate-y-0'}`;
  
  return (
    <header 
      className={headerClasses}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="relative flex items-center justify-between px-4 h-20 pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))]">
        {/* Default Header (Filmique, Bell, Settings) */}
        <div className={`absolute inset-0 flex items-center justify-between px-4 pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))] transition-all duration-300 ${isStudioSticky ? 'opacity-0 -translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
          <div className="flex items-center gap-x-4">
            {headerAction && BackButton ? (
              <button onClick={headerAction.action} className="p-2 transition-colors -ml-2 text-gray-300 hover:text-white">
                <BackButton className="w-5 h-5" />
              </button>
            ) : (
              <>
                <SyncStatusIndicator />
                <NotificationsBell
                  theme="dark"
                  unreadCount={unreadCount}
                  onClick={() => setCurrentView('notifications')}
                />
              </>
            )}
          </div>
          <h1 className="text-lg font-bold text-white">Filmique</h1>
          <div className="flex items-center gap-2 justify-end">
            {/* Only show settings if not in back-button context */}
            {(!headerAction || !BackButton) && (
              <button
                onClick={() => setCurrentView('settings')}
                aria-label="Settings"
                className="p-2 rounded-full transition-colors text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-amber-start"
              >
                <Settings className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Studio Sticky Header */}
        <div className={`absolute inset-0 flex items-center justify-between px-4 pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))] transition-all duration-300 ${isStudioSticky ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <h1 className="text-xl font-bold text-white">Studio</h1>
          <div className="w-auto">
            <SegmentedControl
              options={studioSectionOptions}
              value={studioSection}
              onChange={(val) => setStudioSection(val as any)}
              hideLabels={true}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
import React from 'react';
import { useAppContext } from '../context/AppContext';
import NotificationsBell from './NotificationsBell';
import SegmentedControl from './SegmentedControl';

const TopBar: React.FC = () => {
  const { 
    notifications, setCurrentView, headerAction, isTopBarVisible, currentView,
    isStudioHeaderSticky, studioSection, setStudioSection, studioSectionOptions
  } = useAppContext();
  
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const isStudioView = currentView === 'rolls';

  const BackButton = headerAction ? headerAction.icon : null;

  const headerClasses = `sticky top-0 z-40 transition-all duration-300 backdrop-blur-lg ${
    isStudioHeaderSticky
      ? 'bg-neutral-800/80 border-b border-neutral-700/50'
      : isStudioView
      ? 'bg-transparent border-b border-transparent'
      : 'bg-neutral-900/80 border-b border-neutral-700/50'
  } ${!isTopBarVisible ? '-translate-y-full' : 'translate-y-0'}`;
  
  const backButtonClasses = 'text-gray-300 hover:text-white';

  return (
    <header 
      className={headerClasses}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className={`flex items-center justify-between px-4 transition-all duration-300 ${isStudioHeaderSticky ? 'h-16' : isStudioView ? 'h-24' : 'h-20'}`}>
        {isStudioView ? (
          <>
            <h1 className={`font-bold text-white transition-all duration-300 ${isStudioHeaderSticky ? 'text-xl' : 'text-3xl'}`}>Studio</h1>
            <div className="w-auto">
              <SegmentedControl
                options={studioSectionOptions}
                value={studioSection}
                onChange={(val) => setStudioSection(val as any)}
              />
            </div>
          </>
        ) : (
          <>
            <div className="w-10">
              {headerAction && BackButton && (
                <button onClick={headerAction.action} className={`p-2 transition-colors -ml-2 ${backButtonClasses}`}>
                  <BackButton className="w-5 h-5" />
                </button>
              )}
            </div>
            <h1 className="text-lg font-bold text-white">
              Filmique
            </h1>
            <NotificationsBell 
              theme="dark"
              unreadCount={unreadCount} 
              onClick={() => setCurrentView('notifications')} 
            />
          </>
        )}
      </div>
    </header>
  );
};

export default TopBar;
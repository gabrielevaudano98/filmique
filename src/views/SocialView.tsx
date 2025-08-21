import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, User, ArrowDown, Users, Library as LibraryIcon, Trophy } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { useAppContext, Post } from '../context/AppContext';
import CreatePostModal from '../components/CreatePostModal'; // Will be used by CommunityFeedView
import RollPostCard from '../components/RollPostCard'; // Will be used by CommunityFeedView
import { isRollDeveloped } from '../utils/rollUtils'; // Will be used by CommunityFeedView
import StoryRollsCarousel from '../components/StoryRollsCarousel'; // Will be used by CommunityFeedView
import FullStoryViewer from '../components/FullStoryViewer'; // Will be used by CommunityFeedView
import LoadingIndicator from '../components/LoadingIndicator';
import SegmentedControl from '../components/SegmentedControl';
import ProfileView from '../components/ProfileView';
import ChallengesView from '../components/ChallengesView';
import CommunityFeedView from '../components/CommunityFeedView'; // New component for the main feed content

interface FilterPillProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: React.ElementType;
}

const FilterPill: React.FC<FilterPillProps> = ({ label, isActive, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex-shrink-0 whitespace-nowrap flex items-center gap-2
      ${
        isActive
          ? 'bg-gradient-to-r from-brand-amber-start to-brand-amber-end text-white shadow-lg shadow-brand-amber-start/20'
          : 'bg-neutral-100 dark:bg-neutral-800/60 text-neutral-700 dark:text-gray-300 hover:bg-neutral-200 dark:hover:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-700/50'
      }`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {label}
  </button>
);

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const SocialView: React.FC = () => {
  const { 
    profile,
    socialSection, setSocialSection, socialSectionOptions,
    setIsSocialHeaderSticky,
  } = useAppContext();

  const observerTriggerRef = useRef<HTMLDivElement | null>(null);
  const prevSection = usePrevious(socialSection);

  const sectionOrder = useMemo(() => socialSectionOptions.map(opt => opt.value), [socialSectionOptions]);

  const direction = useMemo(() => {
    if (!prevSection) return 'right';
    const prevIndex = sectionOrder.indexOf(prevSection);
    const currentIndex = sectionOrder.indexOf(socialSection);
    if (prevIndex === -1 || currentIndex === -1) return 'right';
    return currentIndex > prevIndex ? 'left' : 'right';
  }, [socialSection, prevSection, sectionOrder]);

  const animationClass = direction === 'left' ? 'animate-slide-in-from-right' : 'animate-slide-in-from-left';

  useEffect(() => {
    const el = observerTriggerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      setIsSocialHeaderSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    }, { threshold: 0, rootMargin: '-80px 0px 0px 0px' }); // Adjust rootMargin if TopBar height changes

    obs.observe(el);
    return () => obs.disconnect();
  }, [setIsSocialHeaderSticky]);

  useEffect(() => {
    if (!sectionOrder.includes(socialSection)) {
      setSocialSection(sectionOrder[0] as any);
    }
  }, [sectionOrder, setSocialSection, socialSection]);

  if (!profile) return null;

  const getTitleForSocialSection = (section: typeof socialSection) => {
    switch (section) {
      case 'community': return 'Community';
      case 'profile': return 'Profile';
      case 'challenges': return 'Challenges';
      default: return 'Social';
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentIndex = sectionOrder.indexOf(socialSection);
    if (direction === 'left' && currentIndex < sectionOrder.length - 1) {
        setSocialSection(sectionOrder[currentIndex + 1] as any);
    } else if (direction === 'right' && currentIndex > 0) {
        setSocialSection(sectionOrder[currentIndex - 1] as any);
    }
  };

  const horizontalSwipeHandlers = useSwipeable({
      onSwipedLeft: () => handleSwipe('left'),
      onSwipedRight: () => handleSwipe('right'),
      preventScrollOnSwipe: false,
      preventDefaultTouchmoveEvent: false,
      trackMouse: true,
      trackTouch: true,
  });

  return (
    <div className="w-full min-h-full bg-white/10 text-black dark:bg-neutral-900/10 backdrop-blur-xl border border-white/20 dark:border-neutral-700/50 rounded-2xl transition-colors duration-300 p-4">
      {/* Pull-to-refresh indicator (will be moved to CommunityFeedView) */}
      {/* <div className="absolute top-[-60px] left-0 right-0 flex justify-center items-center transition-transform duration-200" style={{ transform: `translateY(${Math.min(pullPosition, PULL_THRESHOLD * 1.5)}px)` }}>
        <div className="p-3 bg-neutral-800 rounded-full shadow-lg" style={{ opacity: Math.min(pullPosition / PULL_THRESHOLD, 1), transform: `rotate(${Math.min(pullPosition, PULL_THRESHOLD) * 2}deg)` }}>
          {isRefreshing ? <LoadingIndicator size={22} /> : <ArrowDown className="w-6 h-6 text-white" />}
        </div>
      </div> */}

      {/* Sentinel that the observer watches */}
      <div ref={observerTriggerRef} />

      {/* Header + icon-only segment control */}
      <div className={`flex items-center justify-between pt-0 pb-4 transition-all ${setIsSocialHeaderSticky ? 'sticky top-[80px] z-40 bg-white/90 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-700/50 px-4 py-3' : ''}`}>
        <h1 className="text-3xl font-bold text-black dark:text-white">{getTitleForSocialSection(socialSection)}</h1>
        <div className="w-auto ml-auto">
          <SegmentedControl
            options={socialSectionOptions as any}
            value={socialSection}
            onChange={(val: string) => setSocialSection(val as any)}
            hideLabels={true}
          />
        </div>
      </div>

      {/* Section content with swipe handlers and animation */}
      <div {...horizontalSwipeHandlers} className="relative flex-1 overflow-hidden">
        <div key={socialSection} className={`${animationClass} pt-2`}>
          {socialSection === 'community' && (
            <CommunityFeedView />
          )}

          {socialSection === 'profile' && (
            <div className="pt-2">
              <ProfileView />
            </div>
          )}

          {socialSection === 'challenges' && (
            <div className="pt-2">
              <ChallengesView />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialView;
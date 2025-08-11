import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Film, RefreshCw, ImageIcon, Camera } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../context/AppContext';
import RollsControls from './RollsControls';
import DevelopedRollCard from './DevelopedRollCard';
import DevelopingRollCard from './DevelopingRollCard';
import { isRollDeveloped, isRollDeveloping } from '../utils/rollUtils';
import TimelineScrubber from './TimelineScrubber';

const RollsView: React.FC = () => {
  const { profile, activeRoll, completedRolls, developRoll, setCurrentView, setSelectedRoll, setShowFilmModal, setRollToName } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'developed' | 'developing'>('developed');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedFilm, setSelectedFilm] = useState('all');

  const { developedRolls, developingRolls, filmTypes } = useMemo(() => {
    const allCompleted = completedRolls || [];
    const developed = allCompleted.filter(roll => isRollDeveloped(roll) && roll.title);
    const developing = allCompleted.filter(isRollDeveloping);
    const films = [...new Set(developed.map(r => r.film_type))];
    
    return { developedRolls: developed, developingRolls: developing, filmTypes: films };
  }, [completedRolls]);

  const filteredAndSortedRolls = useMemo(() => {
    return developedRolls
      .filter(roll => {
        const matchesSearch = (roll.title || roll.film_type).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilm = selectedFilm === 'all' || roll.film_type === selectedFilm;
        return matchesSearch && matchesFilm;
      })
      .sort((a, b) => {
        switch (sortOrder) {
          case 'oldest':
            return new Date(a.developed_at || a.completed_at!).getTime() - new Date(b.developed_at || b.completed_at!).getTime();
          case 'title_asc':
            return (a.title || a.film_type).localeCompare(b.title || b.film_type);
          case 'title_desc':
            return (b.title || b.film_type).localeCompare(a.title || a.film_type);
          case 'newest':
          default:
            return new Date(b.developed_at || b.completed_at!).getTime() - new Date(a.developed_at || a.completed_at!).getTime();
        }
      });
  }, [developedRolls, searchTerm, selectedFilm, sortOrder]);

  const groupedRolls = useMemo(() => {
    const groups: { [key: string]: Roll[] } = {};
    filteredAndSortedRolls.forEach(roll => {
      const date = new Date(roll.developed_at || roll.completed_at!);
      const groupKey = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(roll);
    });
    return groups;
  }, [filteredAndSortedRolls]);

  const groupHeaderRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [visibleYear, setVisibleYear] = useState<string | null>(null);
  const isScrollingRef = useRef<NodeJS.Timeout | null>(null);

  const years = useMemo(() => {
    const yearSet = new Set<string>();
    Object.keys(groupedRolls).forEach(groupTitle => {
        yearSet.add(groupTitle.split(' ')[1]);
    });
    return Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a));
  }, [groupedRolls]);

  const handleScroll = () => {
      if (isScrollingRef.current) return;

      const topOffset = 100; // Approx height of TopBar + some margin
      let currentVisibleYear = years[0] || null;

      const sortedGroupKeys = Object.keys(groupedRolls).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      for (const groupTitle of sortedGroupKeys) {
          const headerEl = groupHeaderRefs.current[groupTitle];
          if (headerEl && headerEl.getBoundingClientRect().top < topOffset) {
              currentVisibleYear = groupTitle.split(' ')[1];
              break;
          }
      }
      setVisibleYear(currentVisibleYear);
  };

  const scrollToYear = (year: string) => {
      const firstGroupForYear = Object.keys(groupedRolls).find(g => g.endsWith(year));
      if (firstGroupForYear) {
          const headerEl = groupHeaderRefs.current[firstGroupForYear];
          if (headerEl) {
              if (isScrollingRef.current) clearTimeout(isScrollingRef.current);
              
              const top = headerEl.getBoundingClientRect().top + window.scrollY - 80; // 80px for sticky header
              window.scrollTo({ top, behavior: 'smooth' });

              isScrollingRef.current = setTimeout(() => {
                  isScrollingRef.current = null;
              }, 1000);
          }
      }
  };

  useEffect(() => {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
  }, [groupedRolls, years]);

  const handleCurrentRollClick = () => {
    if (activeRoll) {
      setCurrentView('camera');
    } else {
      setShowFilmModal(true);
    }
  };

  const TabButton: React.FC<{
    label: string;
    count: number;
    isActive: boolean;
    onClick: () => void;
  }> = ({ label, count, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 px-4 rounded-md text-sm font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
        isActive
          ? 'bg-amber-500 text-gray-900 shadow-lg shadow-amber-500/20'
          : 'text-gray-300 hover:bg-gray-700/50'
      }`}
    >
      <span>{label}</span>
      <span
        className={`px-2 py-0.5 rounded-full text-xs transition-colors ${
          isActive ? 'bg-black/10 text-gray-800' : 'bg-gray-700 text-gray-300'
        }`}
      >
        {count}
      </span>
    </button>
  );

  return (
    <div className="flex flex-col w-full space-y-6">
      <div onClick={handleCurrentRollClick} className="relative bg-gray-800 rounded-2xl p-6 text-white shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer overflow-hidden border border-gray-700/50">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-recoleta text-amber-400">Current Roll</h2>
            {activeRoll && (
              <button onClick={(e) => { e.stopPropagation(); setShowFilmModal(true); }} className="bg-gray-700/50 hover:bg-gray-700 text-white text-xs font-semibold py-1.5 px-3 rounded-full flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" />
                <span>Change</span>
              </button>
            )}
          </div>
          <div className="mt-4">
            {activeRoll ? (
              <div>
                <p className="font-semibold text-lg">{activeRoll.film_type}</p>
                <div className="mt-3 space-y-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${(activeRoll.shots_used / activeRoll.capacity) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{activeRoll.shots_used} shots taken</span>
                    <span>{activeRoll.capacity} total</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-4">No active roll. Time to load up!</p>
                <button onClick={(e) => { e.stopPropagation(); setShowFilmModal(true); }} className="bg-amber-500 hover:bg-amber-600 text-gray-900 px-5 py-2.5 rounded-lg flex items-center space-x-2 font-bold text-sm mx-auto">
                  <Film className="w-5 h-5" />
                  <span>Load New Film</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-2xl p-4 sm:p-6">
        <div className="bg-gray-800 rounded-xl p-1 flex space-x-1">
          <TabButton
            label="Developed"
            count={developedRolls.length}
            isActive={activeTab === 'developed'}
            onClick={() => setActiveTab('developed')}
          />
          <TabButton
            label="Developing"
            count={developingRolls.length}
            isActive={activeTab === 'developing'}
            onClick={() => setActiveTab('developing')}
          />
        </div>

        <div className="mt-6">
          {activeTab === 'developed' && (
            <div>
              <RollsControls
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                filmTypes={filmTypes}
                selectedFilm={selectedFilm}
                setSelectedFilm={setSelectedFilm}
              />
              {filteredAndSortedRolls.length > 0 ? (
                <div className="space-y-8">
                  {Object.entries(groupedRolls).map(([groupTitle, rollsInGroup]) => (
                    <div key={groupTitle}>
                      <h3 ref={el => groupHeaderRefs.current[groupTitle] = el} className="sticky top-20 bg-gray-900/80 backdrop-blur-sm py-2 text-lg font-bold text-white mb-4 font-recoleta z-10">{groupTitle}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {rollsInGroup.map(roll => (
                          <DevelopedRollCard
                            key={roll.id}
                            roll={roll}
                            onSelect={() => { setSelectedRoll(roll); setCurrentView('rollDetail'); }}
                            onRename={() => setRollToName(roll)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4">
                  <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2 font-recoleta text-white">{searchTerm || selectedFilm !== 'all' ? 'No Rolls Found' : 'No Developed Rolls'}</h3>
                  <p className="text-gray-400 max-w-md mx-auto">{searchTerm || selectedFilm !== 'all' ? "Try adjusting your search or filter to find what you're looking for." : "Finish a roll and develop it to see your photos here."}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'developing' && (
            <div className="max-w-2xl mx-auto space-y-4">
              {developingRolls.length > 0 ? developingRolls.map(roll => <DevelopingRollCard key={roll.id} roll={roll} profile={profile} onDevelop={developRoll} />) : (
                <div className="text-center py-16 px-4">
                  <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2 font-recoleta text-white">Nothing in the Darkroom</h3>
                  <p className="text-gray-400 max-w-md mx-auto">When you finish a roll of film, it will show up here to be developed.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {activeTab === 'developed' && years.length > 1 && (
        <div className="fixed top-1/2 -translate-y-1/2 right-1 md:right-3 h-1/2 w-16 z-20 hidden md:block">
            <TimelineScrubber 
                years={years}
                activeYear={visibleYear}
                onSelectYear={scrollToYear}
            />
        </div>
      )}
    </div>
  );
};

export default RollsView;
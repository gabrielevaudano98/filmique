import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';
import { isRollDeveloped } from '../utils/rollUtils';
import DevelopingRollCard from './DevelopingRollCard';
import AlbumCard from './AlbumCard';
import RollCard from './RollCard';
import SegmentedControl from './SegmentedControl';
import { Clock, Library as LibraryIcon, Printer, PlusCircle } from 'lucide-react';
import CreateAlbumModal from './CreateAlbumModal';

const EmptyState: React.FC<{ icon: React.ElementType; title: string; message: string }> = ({ icon: Icon, title, message }) => (
  <div className="text-center py-24 text-neutral-500">
    <Icon className="w-16 h-16 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white">{title}</h3>
    <p className="mt-2">{message}</p>
  </div>
);

const LibraryView: React.FC = () => {
  const { 
    developingRolls, completedRolls, albums, 
    setCurrentView, setSelectedAlbum 
  } = useAppContext();
  const [activeTab, setActiveTab] = useState<'developing' | 'albums' | 'printed'>('developing');
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);

  const { printedRolls, uncategorizedRolls } = useMemo(() => {
    const developed = completedRolls.filter(r => isRollDeveloped(r));
    return {
      printedRolls: developed.filter(r => r.is_printed),
      uncategorizedRolls: developed.filter(r => !r.album_id),
    };
  }, [completedRolls]);

  const tabOptions = [
    { label: 'Developing', value: 'developing' },
    { label: 'Albums', value: 'albums' },
    { label: 'Printed', value: 'printed' },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Library</h1>
      </div>
      <SegmentedControl options={tabOptions} value={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'developing' && (
          developingRolls.length > 0 ? (
            <div className="space-y-3">
              {developingRolls.map(roll => <DevelopingRollCard key={roll.id} roll={roll} />)}
            </div>
          ) : (
            <EmptyState icon={Clock} title="Darkroom is Empty" message="When you finish a roll, it will appear here to be developed." />
          )
        )}

        {activeTab === 'albums' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button onClick={() => setShowCreateAlbumModal(true)} className="flex items-center gap-2 text-brand-amber-start font-semibold px-4 py-2 rounded-lg hover:bg-brand-amber-start/10">
                <PlusCircle className="w-5 h-5" />
                <span>New Album</span>
              </button>
            </div>
            {uncategorizedRolls.length > 0 && (
              <button onClick={() => setCurrentView('uncategorizedRolls')} className="w-full p-4 bg-neutral-800 rounded-xl text-left hover:bg-neutral-700/50 transition-colors">
                <h3 className="font-bold text-lg text-white">Uncategorized Rolls</h3>
                <p className="text-sm text-gray-400">{uncategorizedRolls.length} rolls not in any album.</p>
              </button>
            )}
            {albums.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {albums.map(album => (
                  <AlbumCard 
                    key={album.id} 
                    album={album} 
                    onClick={() => {
                      setSelectedAlbum(album);
                      setCurrentView('albumDetail');
                    }} 
                  />
                ))}
              </div>
            ) : (
              uncategorizedRolls.length === 0 && <EmptyState icon={LibraryIcon} title="No Albums Yet" message="Create an album to organize your developed rolls." />
            )}
          </div>
        )}

        {activeTab === 'printed' && (
          printedRolls.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {printedRolls.map(roll => <RollCard key={roll.id} roll={roll} />)}
            </div>
          ) : (
            <EmptyState icon={Printer} title="No Printed Rolls" message="Rolls you choose to print will appear here once developed." />
          )
        )}
      </div>
      {showCreateAlbumModal && <CreateAlbumModal onClose={() => setShowCreateAlbumModal(false)} />}
    </div>
  );
};

export default LibraryView;
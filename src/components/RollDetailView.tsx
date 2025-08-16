import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Download, Trash2, Archive, ArchiveRestore, Tag } from 'lucide-react';
import PhotoDetailModal from './PhotoDetailModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { Photo } from '../context/AppContext';
import PhotoInfoModal from './PhotoInfoModal';
import Image from './Image';
import TagInput from './TagInput';
import { useDebounce } from '../hooks/useDebounce';

const RollDetailView: React.FC = () => {
  const { 
    selectedRoll, 
    setCurrentView, 
    setSelectedRoll, 
    downloadRoll, 
    deleteRoll, 
    archiveRoll, 
    updateRollTags,
    setHeaderAction,
    setIsTopBarVisible,
    setRollsViewSection
  } = useAppContext();
  
  const [photoToView, setPhotoToView] = useState<Photo | null>(null);
  const [photoToShowInfo, setPhotoToShowInfo] = useState<Photo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tags, setTags] = useState<string[]>(selectedRoll?.tags || []);
  const debouncedTags = useDebounce(tags, 1000);
  const [isSticky, setIsSticky] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    setSelectedRoll(null);
    setRollsViewSection('shelf');
    setCurrentView('rolls');
  };

  useEffect(() => {
    setHeaderAction({ icon: ArrowLeft, action: handleBack });
    setIsTopBarVisible(true);
    
    return () => {
      setHeaderAction(null);
      setIsTopBarVisible(true);
    };
  }, [setHeaderAction, setIsTopBarVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const shouldBeSticky = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        if (isSticky !== shouldBeSticky) {
          setIsSticky(shouldBeSticky);
          setIsTopBarVisible(!shouldBeSticky);
        }
      },
      { threshold: 0, rootMargin: "-65px 0px 0px 0px" }
    );

    const currentHeroRef = heroRef.current;
    if (currentHeroRef) observer.observe(currentHeroRef);
    return () => {
      if (currentHeroRef) observer.unobserve(currentHeroRef);
    };
  }, [isSticky, setIsTopBarVisible]);

  useEffect(() => {
    if (selectedRoll && JSON.stringify(debouncedTags) !== JSON.stringify(selectedRoll.tags || [])) {
      updateRollTags(selectedRoll.id, debouncedTags);
    }
  }, [debouncedTags, selectedRoll, updateRollTags]);

  if (!selectedRoll) {
    setCurrentView('rolls');
    return null;
  }

  const developedDate = selectedRoll.developed_at 
    ? new Date(selectedRoll.developed_at)
    : new Date(new Date(selectedRoll.completed_at!).getTime() + 7 * 24 * 60 * 60 * 1000);

  const cacheBuster = selectedRoll.developed_at ? `?t=${new Date(selectedRoll.developed_at).getTime()}` : '';

  const actionButtons = (
    <>
      <button onClick={() => downloadRoll(selectedRoll)} className="p-2 text-gray-300 hover:text-white transition-colors rounded-full"><Download className="w-5 h-5" /></button>
      <button onClick={() => archiveRoll(selectedRoll.id, !selectedRoll.is_archived)} className="p-2 text-gray-300 hover:text-white transition-colors rounded-full">
        {selectedRoll.is_archived ? <ArchiveRestore className="w-5 h-5" /> : <Archive className="w-5 h-5" />}
      </button>
      <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-red-500 hover:text-red-400 transition-colors rounded-full"><Trash2 className="w-5 h-5" /></button>
    </>
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Sticky Header */}
      <header 
        className={`sticky top-0 z-40 bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-700/50 transition-opacity duration-300 ${isSticky ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-between h-16 px-4">
          <button onClick={handleBack} className="p-2 text-gray-300 hover:text-white transition-colors -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white truncate">{selectedRoll.title || selectedRoll.film_type}</h1>
          <div className="flex items-center space-x-2">{actionButtons}</div>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Hero Section */}
        <div ref={heroRef} className="p-4 pt-6">
          <h1 className="text-4xl font-bold text-white mb-2">{selectedRoll.title || selectedRoll.film_type}</h1>
          <p className="text-gray-400">Developed on {developedDate.toLocaleDateString()}</p>
        </div>

        <div className="p-4">
          {/* Info & Tags Section */}
          <div className="mb-8 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-bold text-white">{selectedRoll.film_type}</p>
                <p className="text-xs text-gray-400">{selectedRoll.shots_used} Photos</p>
              </div>
              <div className="flex items-center space-x-2 -mr-2">
                {actionButtons}
              </div>
            </div>
            <div className="h-px bg-neutral-700/50 my-4"></div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2"><Tag className="w-4 h-4" /> Tags</h3>
            <TagInput tags={tags} onTagsChange={setTags} />
          </div>

          {/* Film Strip */}
          <div className="film-strip-bg max-w-md mx-auto">
            <div className="space-y-2">
              {selectedRoll.photos?.map((photo, index) => (
                <div key={photo.id} className="w-full aspect-square bg-black p-1" onClick={() => setPhotoToView(photo)}>
                  <Image 
                    src={`${photo.url}${cacheBuster}`} 
                    alt={`Photo ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {photoToView && (
        <PhotoDetailModal 
          photo={photoToView} 
          onClose={() => setPhotoToView(null)}
          onShowInfo={() => { setPhotoToShowInfo(photoToView); setPhotoToView(null); }}
        />
      )}
      {photoToShowInfo && (
        <PhotoInfoModal 
          photo={photoToShowInfo} 
          roll={selectedRoll} 
          onClose={() => setPhotoToShowInfo(null)} 
        />
      )}
      {showDeleteConfirm && (
        <ConfirmDeleteModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={() => { deleteRoll(selectedRoll.id); setShowDeleteConfirm(false); handleBack(); }}
          title="Delete Roll"
          message={`Are you sure you want to permanently delete "${selectedRoll.title || selectedRoll.film_type}"? All photos and related posts will be lost forever.`}
          confirmText="Delete"
        />
      )}
    </div>
  );
};

export default RollDetailView;
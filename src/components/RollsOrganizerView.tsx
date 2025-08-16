import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Album, Roll } from '../types';
import { Folder, PlusCircle } from 'lucide-react';
import BoxListItem from './BoxListItem';
import RollOrganizerItem from './RollOrganizerItem';
import CreateBoxModal from './CreateBoxModal';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core';

const Draggable: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(1.05)`, zIndex: 100 } : {};
  return <div ref={setNodeRef} style={style} {...listeners} {...attributes}>{children}</div>;
};

const DroppableBox: React.FC<{ album: Album; onClick: () => void; children: React.ReactNode }> = ({ album, onClick, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id: album.id });
  return <div ref={setNodeRef}><BoxListItem album={album} onClick={onClick} isOver={isOver} /></div>;
};

const RollsOrganizerView: React.FC = () => {
  const { albums, completedRolls, setCurrentView, setSelectedRoll, addRollsToAlbum, moveAlbum } = useAppContext();
  const [breadcrumbs, setBreadcrumbs] = useState<Album[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState<Album | Roll | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const currentAlbumId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null;
  const currentAlbum = currentAlbumId ? albums.find(a => a.id === currentAlbumId) : null;

  const { items, uncategorizedRolls } = useMemo(() => {
    const childAlbums = albums.filter(a => a.parent_album_id === currentAlbumId);
    const rollsInAlbum = completedRolls.filter(r => r.album_id === currentAlbumId && !r.is_archived);
    const uncategorized = completedRolls.filter(r => !r.album_id && !r.is_archived);
    
    const combined: (Album | Roll)[] = [...childAlbums, ...rollsInAlbum];
    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return { items: combined, uncategorizedRolls: uncategorized };
  }, [albums, completedRolls, currentAlbumId]);

  const navigateToAlbum = (album: Album) => setBreadcrumbs([...breadcrumbs, album]);
  const navigateToCrumb = (index: number) => setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  const navigateToRoot = () => setBreadcrumbs([]);
  const handleRollClick = (roll: Roll) => { setSelectedRoll(roll); setCurrentView('rollDetail'); };

  const handleDragStart = (event: any) => {
    const allItems = [...items, ...uncategorizedRolls];
    const item = allItems.find(i => i.id === event.active.id);
    if (item) setActiveDragItem(item);
  };

  const handleDragEnd = (event: any) => {
    setActiveDragItem(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const allItems = [...items, ...uncategorizedRolls];
    const draggedItem = allItems.find(i => i.id === active.id);
    if (!draggedItem) return;

    if ('shots_used' in draggedItem) { // Dragged a Roll
      addRollsToAlbum(over.id, [draggedItem.id]);
    } else { // Dragged an Album
      if (draggedItem.id !== over.id) { // Prevent dropping album on itself
        moveAlbum(draggedItem.id, over.id);
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-400">
            <button onClick={navigateToRoot} className="hover:text-white">Organizer</button>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                <span className="mx-2">/</span>
                <button onClick={() => navigateToCrumb(index)} className="hover:text-white truncate max-w-24" title={crumb.title}>{crumb.title}</button>
              </React.Fragment>
            ))}
          </div>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 text-amber-400 font-semibold text-sm p-2 hover:bg-amber-500/10 rounded-lg">
            <PlusCircle className="w-4 h-4" />
            <span>New Box</span>
          </button>
        </div>
        <h2 className="text-2xl font-bold text-white">{currentAlbum?.title || 'Organizer'}</h2>
        
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map(item => {
              const isDragging = activeDragItem?.id === item.id;
              if ('shots_used' in item) { // It's a Roll
                return <Draggable key={item.id} id={item.id}><RollOrganizerItem roll={item} onClick={() => handleRollClick(item)} isDragging={isDragging} /></Draggable>;
              } else { // It's an Album
                return <Draggable key={item.id} id={item.id}><DroppableBox album={item} onClick={() => navigateToAlbum(item)}><div /></DroppableBox></Draggable>;
              }
            })}
          </div>
        ) : (
          !currentAlbumId && uncategorizedRolls.length === 0 && <div className="text-center py-16 text-gray-500"><Folder className="w-12 h-12 mx-auto mb-4" /><p>This box is empty.</p></div>
        )}

        {currentAlbumId === null && uncategorizedRolls.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-3">Uncategorized Rolls</h3>
            <div className="space-y-2">
              {uncategorizedRolls.map(roll => {
                const isDragging = activeDragItem?.id === roll.id;
                return <Draggable key={roll.id} id={roll.id}><RollOrganizerItem roll={roll} onClick={() => handleRollClick(roll)} isDragging={isDragging} /></Draggable>;
              })}
            </div>
          </div>
        )}

        {showCreateModal && <CreateBoxModal onClose={() => setShowCreateModal(false)} parentAlbumId={currentAlbumId} />}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeDragItem ? (
          'shots_used' in activeDragItem ? 
            <RollOrganizerItem roll={activeDragItem} onClick={() => {}} /> : 
            <BoxListItem album={activeDragItem} onClick={() => {}} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default RollsOrganizerView;
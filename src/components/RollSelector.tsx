import React, { useMemo, useState } from 'react';
import { Search, Folder, Image as ImageIcon, Grid, Check } from 'lucide-react';
import { Roll, Album, Photo } from '../context/AppContext';
import AvatarRing from './AvatarRing';

interface RollSelectorProps {
  rolls: Roll[]; // list of developed rolls (with photos)
  albums?: Album[]; // optional list of albums for filtering
  onSelect: (roll: Roll) => void;
  onCreateAlbum?: () => void;
  onClose: () => void;
}

const formatDate = (r: Roll) => {
  const d = new Date(r.developed_at || r.completed_at || r.created_at);
  return d.toLocaleDateString();
};

const thumbnailFor = (roll: Roll): string => {
  const url = roll.photos?.[0]?.thumbnail_url || '';
  return url;
};

const RollCard: React.FC<{ roll: Roll; onSelect: () => void; selected?: boolean }> = ({ roll, onSelect, selected }) => {
  const thumb = thumbnailFor(roll);
  return (
    <button onClick={onSelect} className={`w-full flex items-center p-3 rounded-xl transition-all ${selected ? 'ring-2 ring-amber-400 bg-amber-400/6' : 'hover:bg-gray-800/40'}`}>
      <div className="w-16 h-16 rounded-md bg-gray-700 overflow-hidden flex-shrink-0 mr-4">
        {thumb ? <img src={thumb} alt={roll.title || roll.film_type} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-gray-500 m-auto" />}
      </div>
      <div className="text-left flex-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white truncate">{roll.title || roll.film_type}</p>
            <p className="text-xs text-gray-400">{roll.shots_used} photos • {formatDate(roll)}</p>
          </div>
          {selected && <Check className="w-5 h-5 text-amber-400 ml-3" />}
        </div>
      </div>
    </button>
  );
};

const RollSelector: React.FC<RollSelectorProps> = ({ rolls, albums = [], onSelect, onCreateAlbum, onClose }) => {
  const [query, setQuery] = useState('');
  const [albumFilter, setAlbumFilter] = useState<string>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'shots_desc' | 'shots_asc'>('newest');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const albumMap = useMemo(() => {
    const map = new Map<string, string[]>();
    albums.forEach(a => {
      (a.album_rolls || []).forEach((ar: any) => {
        if (!map.has(a.id)) map.set(a.id, []);
        map.get(a.id)!.push(ar.roll_id);
      });
    });
    return map;
  }, [albums]);

  const filtered = useMemo(() => {
    let list = rolls.filter(r => !!r.photos && r.photos.length > 0);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(r => (r.title || r.film_type).toLowerCase().includes(q));
    }
    if (albumFilter !== 'all') {
      const rollIds = new Set(albumMap.get(albumFilter) || []);
      list = list.filter(r => rollIds.has(r.id));
    }
    switch (sort) {
      case 'newest':
        return list.sort((a, b) => new Date(b.developed_at || b.completed_at || b.created_at).getTime() - new Date(a.developed_at || a.completed_at || a.created_at).getTime());
      case 'oldest':
        return list.sort((a, b) => new Date(a.developed_at || a.completed_at || a.created_at).getTime() - new Date(b.developed_at || b.completed_at || b.created_at).getTime());
      case 'shots_desc':
        return list.sort((a, b) => (b.shots_used || 0) - (a.shots_used || 0));
      case 'shots_asc':
        return list.sort((a, b) => (a.shots_used || 0) - (b.shots_used || 0));
      default:
        return list;
    }
  }, [rolls, query, albumFilter, sort, albumMap]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-end sm:items-center justify-center z-60 p-4">
      <div className="bg-gray-900 w-full sm:max-w-2xl rounded-2xl max-h-[88vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rolls by title, film or date..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-white focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">Close</button>
        </div>

        <div className="p-3 flex items-center gap-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-gray-400" />
            <select value={albumFilter} onChange={(e) => setAlbumFilter(e.target.value)} className="bg-transparent text-sm text-white">
              <option value="all">All Albums & Rolls</option>
              {albums.map(a => <option key={a.id} value={a.id}>{a.title} ({a.photoCount || 0})</option>)}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2 text-sm text-gray-400">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="bg-transparent text-sm text-white">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="shots_desc">Most Photos</option>
              <option value="shots_asc">Fewest Photos</option>
            </select>
          </div>
        </div>

        <div className="overflow-y-auto no-scrollbar p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">
              <ImageIcon className="w-12 h-12 mx-auto mb-3" />
              <p>No rolls match your search.</p>
              <div className="mt-4 flex justify-center">
                <button onClick={onCreateAlbum} className="px-4 py-2 bg-amber-500 rounded-lg text-sm font-semibold text-gray-900">Create Album</button>
              </div>
            </div>
          ) : filtered.map(roll => (
            <RollCard
              key={roll.id}
              roll={roll}
              onSelect={() => { setSelectedId(roll.id); onSelect(roll); }}
              selected={selectedId === roll.id}
            />
          ))}
        </div>

        <div className="p-4 border-t border-gray-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default RollSelector;
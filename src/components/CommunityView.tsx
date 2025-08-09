import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Users, Loader } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useDebounce } from '../hooks/useDebounce';
import CreatePostModal from './CreatePostModal';
import PostView from './PostView';
import UserSearchResultCard from './UserSearchResultCard';
import { UserProfile } from '../context/AppContext';
import { isRollDeveloped } from '../utils/rollUtils';

const CommunityView: React.FC = () => {
  const { profile, feed, completedRolls, searchUsers, handleFollow } = useAppContext();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const followedFeed = useMemo(() => {
    return feed.filter(post => post.isFollowed || post.user_id === profile?.id);
  }, [feed, profile]);

  const followingIds = useMemo(() => {
    return new Set(feed.filter(p => p.isFollowed).map(p => p.user_id));
  }, [feed]);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery) {
        setIsSearching(true);
        const results = await searchUsers(debouncedSearchQuery);
        setSearchResults(results || []);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    };
    performSearch();
  }, [debouncedSearchQuery, searchUsers]);

  const postedRollIds = useMemo(() => new Set(feed.map(p => p.roll_id)), [feed]);
  
  const unpostedDevelopedRolls = useMemo(() => {
    return completedRolls.filter(roll => 
      isRollDeveloped(roll) && !postedRollIds.has(roll.id)
    );
  }, [completedRolls, postedRollIds]);

  if (!profile) return null;

  const renderContent = () => {
    if (debouncedSearchQuery) {
      if (isSearching) {
        return <div className="flex justify-center items-center py-16"><Loader className="w-8 h-8 animate-spin text-amber-400" /></div>;
      }
      if (searchResults.length > 0) {
        return (
          <div className="space-y-3">
            {searchResults.filter(u => u.id !== profile.id).map(user => (
              <UserSearchResultCard key={user.id} user={user} isFollowing={followingIds.has(user.id)} />
            ))}
          </div>
        );
      }
      return <div className="text-center py-16 text-gray-400">No users found for "{debouncedSearchQuery}".</div>;
    }

    if (followedFeed.length === 0) {
      return (
        <div className="text-center py-16 px-4 col-span-full bg-gray-800/50 rounded-lg">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2 font-recoleta text-white">Your Feed is Quiet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Follow other photographers to see their work here. Use the search bar to find people!
          </p>
        </div>
      );
    }

    return followedFeed.map(post => <PostView key={post.id} post={post} />);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold font-recoleta text-white">Community</h1>
        <button onClick={() => setShowCreatePostModal(true)} className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Create Post</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for users..."
          className="w-full bg-gray-800 border border-gray-700 rounded-full pl-11 pr-4 py-2.5 text-white focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      <div className="space-y-8">
        {renderContent()}
      </div>

      {showCreatePostModal && (
        <CreatePostModal
          onClose={() => setShowCreatePostModal(false)}
          unpostedRolls={unpostedDevelopedRolls}
        />
      )}
    </div>
  );
};

export default CommunityView;
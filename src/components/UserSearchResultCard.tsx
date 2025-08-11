import React from 'react';
import { UserPlus, Check } from 'lucide-react';
import { UserProfile } from '../context/AppContext';
import { useAppContext } from '../context/AppContext';

interface UserSearchResultCardProps {
  user: UserProfile;
  isFollowing: boolean;
}

const UserSearchResultCard: React.FC<UserSearchResultCardProps> = ({ user, isFollowing }) => {
  const { handleFollow } = useAppContext();

  return (
    <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800 shadow-lg">
      <div className="flex items-center space-x-4">
        <img
          src={user.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`}
          alt={user.username}
          className="w-12 h-12 rounded-full bg-gray-700 object-cover"
        />
        <div>
          <p className="font-bold text-white">{user.username}</p>
          <p className="text-sm text-gray-400">{user.first_name} {user.last_name}</p>
        </div>
      </div>
      <button
        onClick={() => handleFollow(user.id, isFollowing)}
        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center space-x-2 min-w-[110px] justify-center ${
          isFollowing
            ? 'bg-gray-700 text-white'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        {isFollowing ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
        <span>{isFollowing ? 'Following' : 'Follow'}</span>
      </button>
    </div>
  );
};

export default UserSearchResultCard;
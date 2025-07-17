import React from 'react';
import { Heart, MessageCircle, Share, Clock, Zap, Star, Camera } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const HomeView: React.FC = () => {
  const { feed, user, activeRoll, setCurrentView } = useAppContext();

  const handleLike = (postId: string) => {
    // Handle like functionality
    console.log('Liked post:', postId);
  };

  const handleComment = (postId: string) => {
    // Handle comment functionality
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: string) => {
    // Handle share functionality
    console.log('Share post:', postId);
  };

  return (
    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6 pb-safe">
      {/* Current Roll Status */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 sm:p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold mb-2 font-recoleta">Current Roll</h2>
            {activeRoll ? (
              <>
                <p className="text-amber-100 text-sm sm:text-base">{activeRoll.filmType}</p>
                <p className="text-sm text-amber-100">
                  {activeRoll.shotsUsed}/{activeRoll.capacity} shots used
                </p>
              </>
            ) : (
              <>
                <p className="text-amber-100 text-sm sm:text-base">No active roll</p>
                <button 
                  onClick={() => setCurrentView('camera')}
                  className="mt-3 bg-amber-600 hover:bg-amber-700 text-white shadow-md px-4 py-3 rounded-lg transition-colors flex items-center space-x-2 min-h-[44px] font-semibold"
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Start shooting</span>
                </button>
              </>
            )}
          </div>
          <div className="text-right">
            {activeRoll && (
              <div className="bg-white bg-opacity-30 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shadow-lg">
                <span className="text-lg sm:text-2xl font-bold">
                  {Math.round((activeRoll.shotsUsed / activeRoll.capacity) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Streak */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-orange-500 rounded-full p-2 sm:p-3">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base font-recoleta">Daily Streak</h3>
            <p className="text-gray-400 text-sm">{user.streak} days in a row!</p>
          </div>
          <div className="ml-auto text-xl sm:text-2xl font-bold text-orange-400">
            🔥
          </div>
        </div>
      </div>

      {/* Community Feed */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold px-1 font-recoleta">Community Feed</h2>
        
        {feed.map((post) => (
          <div key={post.id} className="bg-gray-800 rounded-xl overflow-hidden">
            {/* Post Header */}
            <div className="p-3 sm:p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">
                    {post.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base font-recoleta">{post.username}</h3>
                  <p className="text-gray-400 text-sm flex items-center">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {post.timestamp.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-0.5 sm:gap-1">
              {post.photos.slice(0, 12).map((photo, index) => (
                <div key={photo.id} className="aspect-square bg-gray-700 overflow-hidden">
                  <img
                    src={photo.thumbnail}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ))}
              {post.photos.length > 12 && (
                <div className="aspect-square bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400 text-xs sm:text-sm">
                    +{post.photos.length - 12}
                  </span>
                </div>
              )}
            </div>

            {/* Post Caption */}
            <div className="p-3 sm:p-4">
              <p className="text-gray-300 mb-3 text-sm sm:text-base leading-relaxed">{post.caption}</p>
              
              {/* Post Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 transition-colors ${
                      post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                    } min-h-[44px] px-2 py-1`}
                  >
                    <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm sm:text-base">{post.likes}</span>
                  </button>
                  <button
                    onClick={() => handleComment(post.id)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors min-h-[44px] px-2 py-1"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm sm:text-base">{post.comments}</span>
                  </button>
                  <button
                    onClick={() => handleShare(post.id)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors min-h-[44px] px-2 py-1"
                  >
                    <Share className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-400 text-xs sm:text-sm">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeView;

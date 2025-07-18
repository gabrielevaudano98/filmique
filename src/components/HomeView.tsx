import React from 'react';
import { Heart, MessageCircle, Share, Clock, Zap, Star, Camera, Film } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const HomeView: React.FC = () => {
  const { feed, user, activeRoll, setCurrentView, setShowFilmModal } = useAppContext();

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

  const handleCurrentRollClick = () => {
    if (activeRoll) {
      setCurrentView('camera');
    } else {
      setShowFilmModal(true);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-safe w-full">
      {/* Current Roll Status */}
      <div 
        onClick={handleCurrentRollClick}
        className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-5 sm:p-7 text-white shadow-xl transform transition-all duration-300 hover:scale-[1.01] cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 font-recoleta">Current Roll</h2>
            {activeRoll ? (
              <>
                <p className="text-amber-100 text-sm sm:text-base font-medium">{activeRoll.filmType}</p>
                <p className="text-sm text-amber-100 mt-1">
                  {activeRoll.shotsUsed}/{activeRoll.capacity} shots used
                </p>
                <div className="w-full bg-amber-700 rounded-full h-2.5 mt-3">
                  <div
                    className="bg-white h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(activeRoll.shotsUsed / activeRoll.capacity) * 100}%` }}
                  ></div>
                </div>
              </>
            ) : (
              <>
                <p className="text-amber-100 text-sm sm:text-base mb-4">No active roll. Time to load up!</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the parent div's onClick from firing
                    setShowFilmModal(true);
                  }}
                  className="mt-3 bg-amber-700 hover:bg-amber-800 text-white shadow-md px-5 py-3 rounded-xl transition-colors flex items-center space-x-2 min-h-[48px] font-semibold text-base"
                >
                  <Film className="w-5 h-5" />
                  <span>Load New Film</span>
                </button>
              </>
            )}
          </div>
          {activeRoll && (
            <div className="text-right flex-shrink-0 ml-4">
              <div className="bg-white bg-opacity-30 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-lg">
                <span className="text-xl sm:text-3xl font-bold">
                  {Math.round((activeRoll.shotsUsed / activeRoll.capacity) * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Streak */}
      <div className="bg-gray-800 rounded-2xl p-5 sm:p-7 shadow-lg flex items-center justify-between transition-all duration-300 hover:scale-[1.01] cursor-pointer">
        <div className="flex items-center space-x-4">
          <div className="bg-orange-500 rounded-full p-3 sm:p-4 flex-shrink-0">
            <Star className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg sm:text-xl font-recoleta">Daily Streak</h3>
            <p className="text-gray-400 text-sm sm:text-base mt-1">
              You've kept it up for <span className="font-bold text-orange-400">{user.streak} days</span> in a row!
            </p>
          </div>
        </div>
        <div className="ml-auto text-3xl sm:text-4xl font-bold text-orange-400 animate-pulse">
          🔥
        </div>
      </div>

      {/* Community Feed */}
      <div className="space-y-8">
        <h2 className="text-2xl sm:text-3xl font-bold font-recoleta text-white">Community Feed</h2>
        
        {feed.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl p-8 text-center text-gray-400">
            <p className="text-lg mb-4">No posts yet. Be the first to share!</p>
            <button 
              onClick={() => setCurrentView('camera')}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Start Shooting
            </button>
          </div>
        ) : (
          feed.map((post) => (
            <div key={post.id} className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-[1.005]">
              {/* Post Header */}
              <div className="p-4 sm:p-5 border-b border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-base sm:text-lg">
                      {post.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg font-recoleta">{post.username}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm flex items-center mt-0.5">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-500" />
                      {post.timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-0.5 sm:gap-1 bg-gray-700">
                {post.photos.slice(0, 12).map((photo, index) => (
                  <div key={photo.id} className="aspect-square bg-gray-700 overflow-hidden">
                    <img
                      src={photo.thumbnail}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                    />
                  </div>
                ))}
                {post.photos.length > 12 && (
                  <div className="aspect-square bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400 text-sm sm:text-base font-medium">
                      +{post.photos.length - 12}
                    </span>
                  </div>
                )}
              </div>

              {/* Post Caption */}
              <div className="p-4 sm:p-5">
                <p className="text-gray-300 mb-4 text-sm sm:text-base leading-relaxed">{post.caption}</p>
                
                {/* Post Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 transition-colors min-h-[44px] px-2 py-1 rounded-lg ${
                        post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm sm:text-base">{post.likes}</span>
                    </button>
                    <button
                      onClick={() => handleComment(post.id)}
                      className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors min-h-[44px] px-2 py-1 rounded-lg"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm sm:text-base">{post.comments}</span>
                    </button>
                    <button
                      onClick={() => handleShare(post.id)}
                      className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors min-h-[44px] px-2 py-1 rounded-lg"
                    >
                      <Share className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-400 text-xs sm:text-sm">
                    <Camera className="w-4 h-4" />
                    <span className="font-medium">Shot on {post.rollId === '1' ? 'Kodak Gold 200' : 'Film'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomeView;

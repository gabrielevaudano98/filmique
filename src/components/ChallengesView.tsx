import React, { useState } from 'react';
import { Trophy, Target, Clock, Zap, Star, Calendar, Gift, CheckCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ChallengesView: React.FC = () => {
  const { challenges, setChallenges, user } = useAppContext();
  const [activeTab, setActiveTab] = useState('active');

  const handleClaimReward = (challengeId: string) => {
    setChallenges(challenges.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, isCompleted: true }
        : challenge
    ));
  };

  const getTimeRemaining = (expiresAt?: Date) => {
    if (!expiresAt) return null;
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  };

  const activeChallenges = challenges.filter(c => !c.isCompleted && (!c.expiresAt || c.expiresAt > new Date()));
  const completedChallenges = challenges.filter(c => c.isCompleted);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 font-recoleta">Challenges</h1>
            <p className="text-purple-100">Complete challenges to earn XP, credits, and badges</p>
          </div>
          <Trophy className="w-12 h-12 text-yellow-300" />
        </div>
      </div>

      {/* Challenge Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <Target className="w-6 h-6 mx-auto mb-2 text-green-400" />
          <div className="text-2xl font-bold">{completedChallenges.length}</div>
          <div className="text-sm text-gray-400">Completed</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-orange-400" />
          <div className="text-2xl font-bold">{activeChallenges.length}</div>
          <div className="text-sm text-gray-400">Active</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
          <div className="text-2xl font-bold">
            {challenges.reduce((sum, c) => sum + (c.isCompleted ? c.reward.credits : 0), 0)}
          </div>
          <div className="text-sm text-gray-400">Credits Earned</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <Star className="w-6 h-6 mx-auto mb-2 text-purple-400" />
          <div className="text-2xl font-bold">
            {challenges.reduce((sum, c) => sum + (c.isCompleted ? c.reward.xp : 0), 0)}
          </div>
          <div className="text-sm text-gray-400">XP Earned</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {['active', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'active' ? 'Active Challenges' : 'Completed'}
          </button>
        ))}
      </div>

      {/* Challenges List */}
      <div className="space-y-4">
        {activeTab === 'active' && (
          <>
            {activeChallenges.map((challenge) => {
              const timeRemaining = getTimeRemaining(challenge.expiresAt);
              const progress = Math.min((challenge.progress / challenge.target) * 100, 100);
              const isComplete = challenge.progress >= challenge.target;

              return (
                <div key={challenge.id} className={`bg-gray-800 rounded-xl p-6 ${
                  isComplete ? 'border border-green-400' : ''
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold font-recoleta">{challenge.title}</h3>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          challenge.type === 'daily' 
                            ? 'bg-blue-500 bg-opacity-20 text-blue-400'
                            : challenge.type === 'weekly'
                            ? 'bg-purple-500 bg-opacity-20 text-purple-400'
                            : 'bg-amber-500 bg-opacity-20 text-amber-400'
                        }`}>
                          {challenge.type}
                        </div>
                      </div>
                      <p className="text-gray-400 mb-3">{challenge.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{challenge.progress}/{challenge.target}</span>
                        </div>
                        <div className="bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isComplete ? 'bg-green-400' : 'bg-purple-400'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Rewards */}
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-purple-400" />
                          <span>{challenge.reward.xp} XP</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span>{challenge.reward.credits} credits</span>
                        </div>
                        {challenge.reward.badge && (
                          <div className="flex items-center space-x-1">
                            <Trophy className="w-4 h-4 text-orange-400" />
                            <span>{challenge.reward.badge}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {timeRemaining && (
                        <div className="text-sm text-gray-400 mb-2">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {timeRemaining.hours}h {timeRemaining.minutes}m
                        </div>
                      )}
                      {isComplete && (
                        <button
                          onClick={() => handleClaimReward(challenge.id)}
                          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                        >
                          <Gift className="w-4 h-4" />
                          <span>Claim</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {activeChallenges.length === 0 && (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 font-recoleta">No active challenges</h3>
                <p className="text-gray-400">New challenges will appear soon!</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'completed' && (
          <>
            {completedChallenges.map((challenge) => (
              <div key={challenge.id} className="bg-gray-800 rounded-xl p-6 opacity-75">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div>
                      <h3 className="font-semibold font-recoleta">{challenge.title}</h3>
                      <p className="text-gray-400 text-sm">{challenge.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4" />
                        <span>{challenge.reward.xp}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4" />
                        <span>{challenge.reward.credits}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {completedChallenges.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 font-recoleta">No completed challenges</h3>
                <p className="text-gray-400">Complete challenges to see them here!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChallengesView;

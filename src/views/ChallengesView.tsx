import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Award, Target, Zap, CheckCircle } from 'lucide-react';

const ChallengesView: React.FC = () => {
  const { challenges, setChallenges, user } = useAppContext();

  const handleCompleteChallenge = (challengeId: string) => {
    setChallenges(prevChallenges =>
      prevChallenges.map(challenge =>
        challenge.id === challengeId
          ? { ...challenge, isCompleted: true }
          : challenge
      )
    );
    // In a real app, you'd also update user credits/xp/badges here
    // For now, just mark as completed
  };

  const activeChallenges = challenges.filter(c => !c.isCompleted);
  const completedChallenges = challenges.filter(c => c.isCompleted);

  return (
    <div className="flex flex-col w-full p-4">
      <h2 className="text-3xl font-bold font-recoleta mb-6 text-center">Challenges</h2>

      {activeChallenges.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4 mb-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 font-recoleta flex items-center">
            <Target className="w-6 h-6 mr-2 text-blue-400" /> Active Challenges
          </h3>
          <div className="space-y-4">
            {activeChallenges.map(challenge => (
              <div key={challenge.id} className="bg-gray-700 p-4 rounded-lg shadow-md">
                <h4 className="text-lg font-semibold mb-1">{challenge.title}</h4>
                <p className="text-gray-400 text-sm mb-2">{challenge.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                  <span>Progress: {challenge.progress}/{challenge.target}</span>
                  <span className="flex items-center">
                    <Zap className="w-4 h-4 mr-1 text-yellow-400" /> {challenge.reward.credits} Credits
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                  ></div>
                </div>
                {challenge.progress >= challenge.target && !challenge.isCompleted && (
                  <button
                    onClick={() => handleCompleteChallenge(challenge.id)}
                    className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium transition-colors flex items-center justify-center"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" /> Claim Reward
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {completedChallenges.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 font-recoleta flex items-center">
            <Award className="w-6 h-6 mr-2 text-green-400" /> Completed Challenges
          </h3>
          <div className="space-y-4">
            {completedChallenges.map(challenge => (
              <div key={challenge.id} className="bg-gray-700 p-4 rounded-lg shadow-md opacity-70">
                <h4 className="text-lg font-semibold mb-1">{challenge.title}</h4>
                <p className="text-gray-400 text-sm mb-2">{challenge.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span>Completed!</span>
                  <span className="flex items-center">
                    <Zap className="w-4 h-4 mr-1 text-yellow-400" /> {challenge.reward.credits} Credits
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeChallenges.length === 0 && completedChallenges.length === 0 && (
        <div className="text-center py-12 bg-gray-800 rounded-xl shadow-lg">
          <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 font-recoleta">No Challenges Yet!</h3>
          <p className="text-gray-400">Check back later for new ways to earn rewards.</p>
        </div>
      )}
    </div>
  );
};

export default ChallengesView;

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Film, Mail, ArrowRight, Camera, Sparkles, Users } from 'lucide-react';

const LoginView: React.FC = () => {
  const { handleLogin, isLoading } = useAppContext();
  const [email, setEmail] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    handleLogin(email);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-900 p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%231f2937%22%20fill-opacity%3D%220.4%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22/%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/80 to-gray-900"></div>

      <div className="w-full max-w-md mx-auto flex flex-col justify-center z-10">
        <div className="mb-10 text-center">
          <div className="inline-block p-4 bg-amber-400/10 rounded-full mb-4 border border-amber-400/20">
            <Film className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-5xl font-bold font-recoleta text-white">
            Welcome to <span className="text-amber-400">Filmique</span>
          </h1>
          <p className="text-gray-400 mt-4 text-lg">Rediscover the magic of film photography.</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Sign in with email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-11 pr-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-bold text-gray-900 bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                <span>{isLoading ? 'Sending...' : 'Send Magic Link'}</span>
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-10 text-center space-y-4">
            <h2 className="text-gray-400 font-semibold uppercase tracking-wider text-sm">Join a vibrant community</h2>
            <div className="flex justify-center items-center space-x-6">
                <div className="flex items-center space-x-2 text-gray-300">
                    <Camera className="w-5 h-5 text-amber-400/80" />
                    <span>Shoot</span>
                </div>
                 <div className="flex items-center space-x-2 text-gray-300">
                    <Sparkles className="w-5 h-5 text-amber-400/80" />
                    <span>Develop</span>
                </div>
                 <div className="flex items-center space-x-2 text-gray-300">
                    <Users className="w-5 h-5 text-amber-400/80" />
                    <span>Share</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
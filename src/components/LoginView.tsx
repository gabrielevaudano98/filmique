import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Mail, ArrowRight, Camera, Sparkles, Users } from 'lucide-react';

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
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%234b5563%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      <div className="absolute inset-[-200px] bg-[radial-gradient(circle_at_center,_rgba(252,211,77,0.08),_transparent_40%)]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/0 via-gray-900 to-gray-900"></div>

      <div className="w-full max-w-md mx-auto flex flex-col justify-center z-10">
        <div className="mb-10 text-center">
          <h1 className="text-6xl font-bold font-recoleta text-amber-400">
            Filmique
          </h1>
          <p className="text-gray-400 mt-3 text-lg">Rediscover the magic of film photography.</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Sign in with your email
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
                <span>{isLoading ? 'Sending...' : 'Continue with Email'}</span>
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-12 text-center space-y-4">
            <h2 className="text-gray-400 font-semibold uppercase tracking-wider text-sm">A complete film photography experience</h2>
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
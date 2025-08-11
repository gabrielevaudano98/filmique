import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Mail, ArrowRight, Film } from 'lucide-react';

const LoginView: React.FC = () => {
  const { handleLogin, isLoading } = useAppContext();
  const [email, setEmail] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    handleLogin(email);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%239ca3af%22%20fill-opacity%3D%220.05%22%20fill-rule%3D%22evenodd%22%3E%3Ccircle%20cx%3D%223%22%20cy%3D%223%22%20r%3D%223%22/%3E%3Ccircle%20cx%3D%2213%22%20cy%3D%2213%22%20r%3D%223%22/%3E%3C/g%3E%3C/svg%3E')]"></div>
      <div className="absolute -bottom-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(252,211,77,0.1),_transparent_30%)] animate-[spin_20s_linear_infinite]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/0 via-gray-900 to-gray-900"></div>

      <div className="w-full max-w-md mx-auto flex flex-col justify-center z-10 text-center">
        <div className="mb-12">
          <div className="inline-block p-4 bg-gray-800/50 border border-gray-700/50 rounded-full mb-5 shadow-lg">
            <Film className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Filmique
          </h1>
          <p className="text-gray-400 mt-4 text-lg max-w-xs mx-auto">
            Shoot, develop, and share digital photos with the timeless soul of film.
          </p>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-1">Get Started</h2>
          <p className="text-gray-400 mb-6">Enter your email to sign in or create an account.</p>
          <form onSubmit={onSubmit} className="space-y-4">
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
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-lg shadow-amber-500/10 text-base font-bold text-gray-900 bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-100"
              >
                <span>{isLoading ? 'Sending...' : 'Continue with Email'}</span>
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
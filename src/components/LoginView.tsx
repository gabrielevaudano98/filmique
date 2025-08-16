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
      <div className="absolute -bottom-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(246,174,85,0.08),_transparent_30%)] animate-[spin_20s_linear_infinite]"></div>

      <div className="w-full max-w-md mx-auto flex flex-col justify-center z-10 text-center">
        <div className="mb-12">
          <div className="inline-block p-4 bg-warm-800/50 border border-warm-700/50 rounded-full mb-5 shadow-lg">
            <Film className="w-10 h-10 text-brand-amber-start" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Filmique
          </h1>
          <p className="text-warm-300 mt-4 text-lg max-w-xs mx-auto">
            Shoot, develop, and share digital photos with the timeless soul of film.
          </p>
        </div>

        <div className="bg-warm-800/60 backdrop-blur-lg border border-warm-700/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-1">Get Started</h2>
          <p className="text-warm-400 mb-6">Enter your email to sign in or create an account.</p>
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
                className="w-full bg-warm-700/50 border border-warm-600 rounded-lg pl-11 pr-4 py-3 text-white focus:ring-2 focus:ring-brand-amber-start focus:border-brand-amber-start transition-all"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-lg shadow-brand-amber-start/20 text-base font-bold text-white bg-gradient-to-r from-brand-amber-start to-brand-amber-end hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-warm-900 focus:ring-brand-amber-start disabled:bg-neutral-600 disabled:opacity-70 disabled:shadow-none transition-all transform hover:scale-105 active:scale-100"
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
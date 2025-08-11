import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Mail, ArrowRight, Film } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginView: React.FC = () => {
  const { handleLogin, isLoading } = useAppContext();
  const [email, setEmail] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    handleLogin(email);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto flex flex-col justify-center z-10 text-center"
      >
        <div className="mb-12">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="inline-block p-4 bg-white rounded-full mb-5 shadow-lg border"
          >
            <Film className="w-10 h-10 text-red-500" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-semibold text-gray-900">
            Filmique
          </h1>
          <p className="text-gray-500 mt-4 text-lg max-w-xs mx-auto">
            Shoot, develop, and share digital photos with the timeless soul of film.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200/80">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Get Started</h2>
          <p className="text-gray-500 mb-6">Enter your email to sign in or create an account.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-gray-100 border border-gray-300 rounded-lg pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>
            <div>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98, y: 0 }}
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-lg shadow-red-500/20 text-base font-bold text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
              >
                <span>{isLoading ? 'Sending...' : 'Continue with Email'}</span>
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginView;
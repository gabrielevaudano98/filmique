import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const LoginView: React.FC = () => {
  const { handleLogin, isLoading } = useAppContext();
  const [email, setEmail] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    handleLogin(email);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-center p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-recoleta text-amber-400">Filmique</h1>
        <p className="text-gray-400 mt-2">Enter your email to sign in or register</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-400">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-gray-900 bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-600"
          >
            {isLoading ? 'Sending...' : 'Send Magic Code'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginView;
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft } from 'lucide-react';

const OtpView: React.FC = () => {
  const { verificationEmail, handleVerifyOtp, handleLogin, setAuthStep, isLoading } = useAppContext();
  const [token, setToken] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = () => {
    if (resendCooldown === 0) {
      handleLogin(verificationEmail);
      setResendCooldown(30);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyOtp(token);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-center p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-recoleta text-amber-400">Check your email</h1>
        <p className="text-gray-400 mt-2">
          We sent a 6-digit code to <br />
          <span className="font-semibold text-white">{verificationEmail}</span>
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-400 text-center tracking-wider">
            Enter Code
          </label>
          <div className="mt-1">
            <input
              id="otp"
              name="otp"
              type="text"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-[0.5em] focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading || token.length !== 6}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-gray-900 bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-600"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>
      <div className="mt-6 text-center text-sm">
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="font-medium text-amber-400 hover:text-amber-500 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
        </button>
      </div>
      <div className="mt-4 text-center">
        <button onClick={() => setAuthStep('login')} className="text-gray-400 hover:text-white flex items-center justify-center w-full space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to login</span>
        </button>
      </div>
    </div>
  );
};

export default OtpView;
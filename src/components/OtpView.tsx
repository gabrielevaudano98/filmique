import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, MailCheck } from 'lucide-react';

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
    <div className="w-full min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute -bottom-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(246,174,85,0.08),_transparent_30%)] animate-[spin_20s_linear_infinite]"></div>

      <div className="w-full max-w-md mx-auto flex flex-col justify-center z-10 text-center">
        <div className="bg-warm-800/60 backdrop-blur-lg border border-warm-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="inline-block p-3 bg-warm-700/50 rounded-full mb-5">
            <MailCheck className="w-8 h-8 text-brand-amber-start" />
          </div>
          <h1 className="text-3xl font-bold text-white">Check your email</h1>
          <p className="text-warm-300 mt-2 mb-8">
            We sent a 6-digit code to <br />
            <span className="font-semibold text-white">{verificationEmail}</span>
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="sr-only">Enter Code</label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))}
                required
                className="w-full bg-warm-900/50 border-2 border-warm-700 rounded-lg px-2 py-4 text-white text-center text-4xl font-mono tracking-[0.5em] focus:ring-brand-amber-start focus:border-brand-amber-start transition-all"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading || token.length !== 6}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-bold text-white bg-gradient-to-r from-brand-amber-start to-brand-amber-end hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-warm-900 focus:ring-brand-amber-start disabled:bg-neutral-600 disabled:opacity-70 disabled:shadow-none transition-all transform hover:scale-105 active:scale-100"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
          <div className="mt-6 text-sm">
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="font-medium text-brand-amber-start hover:text-brand-amber-mid disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
            </button>
          </div>
        </div>
        <div className="mt-8 text-center">
          <button onClick={() => setAuthStep('login')} className="text-gray-400 hover:text-white flex items-center justify-center w-full space-x-2 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to login</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpView;
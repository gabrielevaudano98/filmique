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
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%239ca3af%22%20fill-opacity%3D%220.05%22%20fill-rule%3D%22evenodd%22%3E%3Ccircle%20cx%3D%223%22%20cy%3D%223%22%20r%3D%223%22/%3E%3Ccircle%20cx%3D%2213%22%20cy%3D%2213%22%20r%3D%223%22/%3E%3C/g%3E%3C/svg%3E')]"></div>
      <div className="absolute -bottom-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(252,211,77,0.1),_transparent_30%)] animate-[spin_20s_linear_infinite]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/0 via-gray-900 to-gray-900"></div>

      <div className="w-full max-w-md mx-auto flex flex-col justify-center z-10 text-center">
        <div className="bg-gray-800/60 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="inline-block p-3 bg-gray-700/50 rounded-full mb-5">
            <MailCheck className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Check your email</h1>
          <p className="text-gray-400 mt-2 mb-8">
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
                className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg px-2 py-4 text-white text-center text-4xl font-mono tracking-[0.5em] focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading || token.length !== 6}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-bold text-gray-900 bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-100"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
          <div className="mt-6 text-sm">
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="font-medium text-amber-400 hover:text-amber-500 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
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
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import * as api from '../services/api';
import { UserProfile } from '../types';
import { showErrorToast, showSuccessToast } from '../utils/toasts';
import { isNonEmptyString, isEmail } from '../utils/validators';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authStep, setAuthStep] = useState<'login' | 'otp'>('login');
  const [verificationEmail, setVerificationEmail] = useState('');

  const refreshProfile = useCallback(async () => {
    const { data: sessionData } = await api.getSession();
    const currentSession = sessionData.session;
    setSession(currentSession);

    if (currentSession?.user) {
      const { data: profileData, error } = await api.getProfile(currentSession.user.id);
      if (error) console.error('refreshProfile: failed to fetch profile', error);
      else setProfile(profileData as UserProfile);
    } else {
      setProfile(null);
    }
    return currentSession?.user || null;
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      await refreshProfile();
      setIsLoading(false);
    };
    initializeAuth();

    const { data: authListener } = api.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        setProfile(null);
        setAuthStep('login');
      } else if (newSession && !profile) {
        refreshProfile();
      }
    });

    return () => authListener?.subscription.unsubscribe();
  }, [refreshProfile, profile]);

  const handleLogin = async (email: string) => {
    if (!isNonEmptyString(email) || !isEmail(email)) {
      showErrorToast('Please provide a valid email address.');
      return;
    }
    setIsLoading(true);
    const { error } = await api.signInWithOtp(email);
    if (error) showErrorToast(error.message);
    else {
      setVerificationEmail(email);
      setAuthStep('otp');
      showSuccessToast('Check your email for the sign-in code.');
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (token: string) => {
    if (!isNonEmptyString(token) || token.length < 4) {
      showErrorToast('Please enter the code sent to your email.');
      return;
    }
    setIsLoading(true);
    const { error } = await api.verifyOtp(verificationEmail, token);
    if (error) showErrorToast(error.message);
    else {
      showSuccessToast('Signed in successfully.');
      await refreshProfile();
    }
    setIsLoading(false);
  };

  return {
    session,
    profile,
    isLoading,
    authStep,
    setAuthStep,
    verificationEmail,
    handleLogin,
    handleVerifyOtp,
    refreshProfile,
  };
};
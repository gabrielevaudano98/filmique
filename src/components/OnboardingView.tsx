import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAppContext } from '../context/AppContext';
import { User, Shield, Image as ImageIcon, ArrowRight, Check } from 'lucide-react';

const OnboardingView: React.FC = () => {
  const { profile, refreshProfile } = useAppContext();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    avatarFile: null as File | null,
    privacyConsent: false,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, avatarFile: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!profile || !formData.privacyConsent) return;
    setIsSubmitting(true);

    let avatarUrl = profile.avatar_url;

    if (formData.avatarFile) {
      setIsUploading(true);
      const fileExt = formData.avatarFile.name.split('.').pop();
      const filePath = `${profile.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, formData.avatarFile);

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        setIsSubmitting(false);
        setIsUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      avatarUrl = urlData.publicUrl;
      setIsUploading(false);
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: formData.username,
        first_name: formData.firstName,
        last_name: formData.lastName,
        avatar_url: avatarUrl,
        has_completed_onboarding: true,
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
    } else {
      await refreshProfile(); // Refresh context to exit onboarding
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold font-recoleta text-red-500 mb-4">Welcome to Filmique!</h1>
            <p className="text-gray-300 mb-8">Let's get your profile set up so you can start your photography journey.</p>
            <button onClick={handleNextStep} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold font-recoleta mb-6">Tell us about yourself</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <img src={avatarPreview || `https://api.dicebear.com/8.x/initials/svg?seed=${profile?.username}`} alt="Avatar" className="w-20 h-20 rounded-full bg-gray-700 object-cover" />
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
                <div className="flex-grow space-y-4">
                  <input type="text" placeholder="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-red-600 focus:border-red-600" />
                  <input type="text" placeholder="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-red-600 focus:border-red-600" />
                  <input type="text" placeholder="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-red-600 focus:border-red-600" />
                </div>
              </div>
            </div>
            <button onClick={handleNextStep} disabled={!formData.username || !formData.firstName || !formData.lastName} className="w-full mt-8 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
              <span>Next</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold font-recoleta mb-4">Privacy & Consent</h2>
            <p className="text-gray-300 mb-6">We value your privacy. Please review and accept our terms to continue.</p>
            <div className="space-y-4 text-gray-400 text-sm">
              <p>By using Filmique, you agree that your photos may be visible to the community if you choose to share them.</p>
              <p>Your personal data is stored securely and will not be shared with third parties without your consent.</p>
            </div>
            <label className="flex items-center mt-6 cursor-pointer">
              <input type="checkbox" checked={formData.privacyConsent} onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })} className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-red-600 focus:ring-red-600" />
              <span className="ml-3 text-white">I have read and agree to the terms and privacy policy.</span>
            </label>
            <button onClick={handleSubmit} disabled={!formData.privacyConsent || isSubmitting} className="w-full mt-8 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
              {isSubmitting ? (
                <span>Finishing up...</span>
              ) : (
                <>
                  <span>Complete Setup</span>
                  <Check className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingView;
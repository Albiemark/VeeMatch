'use client';

import React from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader } from 'lucide-react';

// Define OAuth providers supported by Clerk
type OAuthProvider = 'oauth_google' | 'oauth_facebook' | 'oauth_apple';

interface SocialLoginButtonProps {
  provider: OAuthProvider;
  label: string;
  icon: React.ReactNode;
  iconBgColor: string;
  redirectUrl?: string;
}

const SocialLoginButton = ({
  provider,
  label,
  icon,
  iconBgColor,
  redirectUrl = '/dashboard',
}: SocialLoginButtonProps) => {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSocialSignIn = async () => {
    if (!signIn) return;
    
    try {
      setIsLoading(true);
      
      // Start the OAuth flow with the selected provider
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: window.location.origin + '/sso-callback',
        redirectUrlComplete: redirectUrl,
      });
      
      // Note: The above function will redirect the user to the provider's login page
      // The user will be redirected back to the redirectUrl after authentication
    } catch (error) {
      console.error('Social sign-in error:', error);
      setIsLoading(false);
    }
  };

  // Demo mode functionality - simulates a successful login without actual OAuth
  const handleDemoSignIn = () => {
    setIsLoading(true);
    // Simulate a network delay
    setTimeout(() => {
      router.push(redirectUrl);
    }, 1500);
  };

  if (!isLoaded) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200 opacity-70"
      >
        <div className="flex items-center">
          <div className={`${iconBgColor} p-2 rounded-full mr-3`}>
            {icon}
          </div>
          <span className="font-medium">{label}</span>
        </div>
        <Loader size={20} className="text-gray-400 animate-spin" />
      </button>
    );
  }

  return (
    <button
      onClick={handleSocialSignIn}
      disabled={isLoading}
      className="w-full flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow disabled:opacity-70"
    >
      <div className="flex items-center">
        <div className={`${iconBgColor} p-2 rounded-full mr-3`}>
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </div>
      
      {isLoading ? (
        <Loader size={20} className="text-gray-400 animate-spin" />
      ) : (
        <ArrowRight size={20} className="text-gray-400" />
      )}
    </button>
  );
};

export default SocialLoginButton;

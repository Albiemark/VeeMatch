'use client';

import React, { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Apple, ChevronLeft, Eye, EyeOff, Loader } from 'lucide-react';
import SocialLoginButton from '@/components/features/social-login/SocialLoginButton';

// Type guard to verify that signIn has a callable create method.
function hasCreate(si: any): si is {
  create: (params: { identifier: string; password: string }) => Promise<{ status: string; createdSessionId: string }>
} {
  return typeof si.create === 'function';
}

const LoginForm = () => {
  const { signIn, setActive } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log('Login form submitted', { email });

    // Validate empty fields
    if (!email || !password) {
      setError('Email and password are required');
      setIsLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== 'dummy@example.com' && !emailRegex.test(normalizedEmail)) {
      setError('Invalid email format');
      setIsLoading(false);
      return;
    }

    // Bypass Clerk sign-in for dummy credentials
    if (normalizedEmail === 'dummy@example.com') {
      console.log('Using dummy credentials');
      if (setActive) {
        console.log('Setting active session for dummy user');
        try {
          await setActive({ session: 'dummy-session' });
          console.log('Session set successfully');
        } catch (error) {
          console.error('Error setting active session:', error);
        }
      }
      console.log('Redirecting to dashboard');
      router.push('/dashboard');
      return;
    }

    console.log('Checking Clerk signIn availability');
    if (!signIn || !hasCreate(signIn)) {
      console.error('Authentication system not available', { signIn });
      setError('Authentication system not available');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Attempting to sign in with Clerk');
      const result = await signIn.create({
        identifier: normalizedEmail,
        password: password,
      }) as { status: string; createdSessionId: string };

      console.log('Sign in result:', result);

      if (result.status === 'complete') {
        console.log('Sign in complete, setting active session');
        if (setActive) {
          await setActive({ session: result.createdSessionId });
          console.log('Active session set successfully');
        }
        console.log('Redirecting to dashboard after successful login');
        router.push('/dashboard');
      } else {
        console.error('Unexpected sign in status', result.status);
        setError('Unexpected sign in status');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.errors && Array.isArray(err.errors)) {
        const clerkError = err.errors[0];
        const message = clerkError.longMessage || clerkError.message;
        setError(message);
      } else {
        setError('Sign in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* App Header */}
      <div className="w-full flex items-center justify-between p-4">
        <button 
          className="text-gray-600 hover:text-gray-800 transition-colors" 
          onClick={() => router.push('/')}
          aria-label="Go back"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      
      {/* App Logo */}
      <div className="py-8 px-6 text-center">
        <h1 className="text-4xl font-bold text-pink-500 mb-2">VeeMatch</h1>
        <p className="text-gray-500">Find your perfect match</p>
      </div>

      <div className="w-full max-w-md px-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-500 text-center rounded-lg animate-fade-in">
            {error}
          </div>
        )}
        
        {/* Login Options */}
        <div className="space-y-3">
          <SocialLoginButton 
            provider="oauth_google"
            label="Continue with Google"
            iconBgColor="bg-red-100"
            icon={
              <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 11v2h2.19l-1 4h2l1-4h2v-2h-6.19zm-7-6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2zm16 0v14H7V5h14z" />
              </svg>
            }
          />
          
          <SocialLoginButton 
            provider="oauth_apple"
            label="Continue with Apple"
            iconBgColor="bg-gray-100"
            icon={<Apple size={20} className="text-gray-900" />}
          />
          
          <SocialLoginButton 
            provider="oauth_facebook"
            label="Continue with Facebook"
            iconBgColor="bg-blue-100"
            icon={
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
              </svg>
            }
          />
        </div>

        {/* Email Login Form */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gradient-to-b from-pink-100 to-white text-gray-500">
              or login with email
            </span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Link href="/forgot-password" className="text-sm text-pink-500 hover:text-pink-600 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-pink-500 text-white p-3 rounded-xl hover:bg-pink-600 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader size={20} className="animate-spin mr-2" />
                Logging in...
              </>
            ) : (
              'Log in'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/sign-up" className="text-pink-500 font-semibold hover:text-pink-600 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
        
        {/* Dev tools - to be removed in production */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
            <p className="mb-2">Development mode: dummy@example.com / password</p>
            <button
              type="button"
              onClick={() => { setEmail("dummy@example.com"); setPassword("password"); }}
              className="text-xs p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              Use Dummy Credentials
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default LoginForm; 
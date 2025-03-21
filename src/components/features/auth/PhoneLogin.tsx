'use client';

import React, { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, Loader } from 'lucide-react';

const PhoneLogin = () => {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!phoneNumber) {
      setError('Phone number is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const normalizedPhone = phoneNumber.replace(/\D/g, '');
      
      // For development/demo purposes
      if (normalizedPhone === '1234567890') {
        setVerifying(true);
        setIsSubmitting(false);
        return;
      }

      if (!signIn) {
        setError('Authentication system not available');
        setIsSubmitting(false);
        return;
      }

      // Create a phone code attempt
      await signIn.create({
        strategy: 'phone_code',
        identifier: normalizedPhone,
      });
      
      setVerifying(true);
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors)) {
        const clerkError = err.errors[0];
        const message = clerkError.longMessage || clerkError.message;
        setError(message);
      } else {
        setError('Failed to send verification code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!verificationCode) {
      setError('Verification code is required');
      setIsSubmitting(false);
      return;
    }

    try {
      // For development/demo purposes
      if (phoneNumber.replace(/\D/g, '') === '1234567890' && verificationCode === '123456') {
        router.push('/dashboard');
        return;
      }

      if (!signIn) {
        setError('Authentication system not available');
        setIsSubmitting(false);
        return;
      }

      // Attempt verification
      const result = await signIn.attemptFirstFactor({
        strategy: 'phone_code',
        code: verificationCode,
      });

      if (result.status === 'complete') {
        router.push('/dashboard');
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors)) {
        const clerkError = err.errors[0];
        const message = clerkError.longMessage || clerkError.message;
        setError(message);
      } else {
        setError('Failed to verify code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Only allow digits
    const cleaned = value.replace(/\D/g, '');
    
    // Format US phone number (XXX) XXX-XXXX
    if (cleaned.length > 0) {
      if (cleaned.length <= 3) {
        return `(${cleaned}`;
      } else if (cleaned.length <= 6) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      } else {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      }
    }
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };

  // If Clerk is not loaded, show loading state
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader className="animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-500 text-center rounded-lg">
          {error}
        </div>
      )}

      {!verifying ? (
        <form onSubmit={handleSendCode} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input
                id="phone"
                type="tel"
                placeholder="(123) 456-7890"
                className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500"
                value={phoneNumber}
                onChange={handlePhoneChange}
                maxLength={14} // (XXX) XXX-XXXX
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              We'll send you a verification code via SMS
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center bg-pink-500 text-white p-3 rounded-xl hover:bg-pink-600 transition-colors"
          >
            {isSubmitting ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div>
            <div className="flex justify-between">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <button
                type="button"
                onClick={() => setVerifying(false)}
                className="text-sm text-pink-500"
              >
                Change number
              </button>
            </div>
            <input
              id="code"
              type="text"
              placeholder="123456"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
            />
            <p className="mt-2 text-xs text-gray-500">
              Enter the 6-digit code sent to {phoneNumber}
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center bg-pink-500 text-white p-3 rounded-xl hover:bg-pink-600 transition-colors"
          >
            {isSubmitting ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              'Verify'
            )}
          </button>
        </form>
      )}
      
      {/* Development helper */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-8 border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500 text-center">Development mode: Use phone 1234567890 and code 123456</p>
        </div>
      )}
    </div>
  );
};

export default PhoneLogin;

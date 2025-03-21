'use client';

import React from 'react';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { ClerkProvider } from '@clerk/nextjs';

// Safely handle service worker registration
if (typeof window !== 'undefined') {
  // Only run on client side
  if ('serviceWorker' in navigator) {
    // Use a simple script tag instead of useEffect for service worker
    const registerServiceWorker = () => {
      try {
        navigator.serviceWorker.register('/service-worker.js')
          .catch(error => {
            console.error('Service worker registration failed:', error);
          });
      } catch (e) {
        console.error('Service worker error:', e);
      }
    };
    
    // Register the service worker when the window has loaded
    window.addEventListener('load', registerServiceWorker);
  }
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ProfileProvider>
        {children}
      </ProfileProvider>
    </ClerkProvider>
  );
}

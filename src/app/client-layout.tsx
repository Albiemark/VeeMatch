'use client';

import React, { useEffect } from 'react';
import { ProfileProvider } from '@/contexts/ProfileContext';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js');
      });
    }
  }, []);

  return (
    <ProfileProvider>
      {children}
    </ProfileProvider>
  );
}

'use client';

import React from 'react';
import { Compass, Heart, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavigationBar = () => {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  return (
    <nav className="bg-white py-4 shadow-md fixed bottom-0 left-0 right-0 z-10">
      <div className="container mx-auto flex justify-around">
        <Link href="/discover" className={`flex flex-col items-center ${isActive('/discover') ? 'text-pink-500' : 'text-gray-500 hover:text-gray-700'}`}>
          <Compass size={24} />
          <span className="text-xs mt-1">Discover</span>
        </Link>
        
        <Link href="/matches" className={`flex flex-col items-center ${isActive('/matches') ? 'text-pink-500' : 'text-gray-500 hover:text-gray-700'}`}>
          <Heart size={24} />
          <span className="text-xs mt-1">Matches</span>
        </Link>
        
        <Link href="/messages" className={`flex flex-col items-center ${isActive('/messages') ? 'text-pink-500' : 'text-gray-500 hover:text-gray-700'}`}>
          <MessageSquare size={24} />
          <span className="text-xs mt-1">Messages</span>
        </Link>
        
        <Link href="/profile" className={`flex flex-col items-center ${isActive('/profile') ? 'text-pink-500' : 'text-gray-500 hover:text-gray-700'}`}>
          <User size={24} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default NavigationBar;

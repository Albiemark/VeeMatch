'use client';

import React from 'react';
import { Compass, Heart, MessageSquare } from 'lucide-react';

const NavigationBar = () => {
  return (
    <nav className="bg-white py-4 shadow-md">
      <div className="container mx-auto flex justify-around">
        <button className="text-gray-500 hover:text-gray-700">
          <Compass size={32} />
          <span className="text-sm">Discover</span>
        </button>
        <button className="text-gray-500 hover:text-gray-700">
          <Heart size={32} />
          <span className="text-sm">Matches</span>
        </button>
        <button className="text-gray-500 hover:text-gray-700">
          <MessageSquare size={32} />
          <span className="text-sm">Messages</span>
        </button>
      </div>
    </nav>
  );
};

export default NavigationBar;

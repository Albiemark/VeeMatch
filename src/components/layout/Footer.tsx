'use client';

import React from 'react';

const Footer = () => {
  return (
    <footer className="flex items-center justify-center h-12 bg-white border-t border-gray-200">
      <div className="flex items-center space-x-4">
        <a href="/terms" className="text-gray-500 hover:text-gray-700">Terms</a>
        <a href="/privacy" className="text-gray-500 hover:text-gray-700">Privacy</a>
      </div>
    </footer>
  );
};

export default Footer;

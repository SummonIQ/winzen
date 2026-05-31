'use client';

import { useState } from 'react';

export function DevPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700"
      >
        Dev Tools
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Developer Panel</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Next.js version: 16.0.1-canary.2
            </div>
            <div className="text-sm text-gray-600">
              Environment: {process.env.NODE_ENV}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

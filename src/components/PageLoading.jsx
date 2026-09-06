import React, { useEffect, useState } from 'react';

export default function PageLoading() {
  const [progress, setProgress] = useState(10);

  // Animate the progress bar from 10 → 90 while loading
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 8;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      {/* Center Content */}
      <div className="flex flex-col items-center space-y-6">
        {/* Brand Logo */}
        <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center">
          <span className="text-white font-extrabold text-2xl">A</span>
        </div>

        {/* Brand Text */}
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            ACADEX
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Student Resource Hub
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

        {/* Progress Bar */}
        <div className="w-56 space-y-2">
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-[11px] font-semibold text-slate-400">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
}
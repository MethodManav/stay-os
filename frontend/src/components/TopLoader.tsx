import React, { useEffect, useState } from 'react';

export const TopLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval: number;
    let fadeOutTimeout: number;

    const handleStart = () => {
      setIsLoading(true);
      setProgress(10);
      
      // Clear any existing timeouts
      window.clearInterval(progressInterval);
      window.clearTimeout(fadeOutTimeout);

      // Simulate progress
      progressInterval = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            window.clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 300);
    };

    const handleEnd = () => {
      window.clearInterval(progressInterval);
      setProgress(100);
      
      fadeOutTimeout = window.setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => setProgress(0), 200); // Reset after fade out
      }, 400);
    };

    window.addEventListener('api-start', handleStart);
    window.addEventListener('api-end', handleEnd);

    return () => {
      window.removeEventListener('api-start', handleStart);
      window.removeEventListener('api-end', handleEnd);
      window.clearInterval(progressInterval);
      window.clearTimeout(fadeOutTimeout);
    };
  }, []);

  if (!isLoading && progress === 0) return null;

  return (
    <div 
      className={`fixed top-0 left-0 h-1 bg-brand-primary z-[9999] transition-all duration-300 ease-out`}
      style={{ 
        width: `${progress}%`,
        opacity: isLoading ? 1 : 0,
        boxShadow: '0 0 10px rgba(79, 70, 229, 0.5)'
      }}
    />
  );
};

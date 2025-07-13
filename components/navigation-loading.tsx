"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export function NavigationLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const currentPathRef = useRef(pathname);
  const navigationStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Only show loading if the pathname actually changed
    if (currentPathRef.current !== pathname) {
      // Navigation completed, hide loading
      setIsLoading(false);
      setProgress(0);
      currentPathRef.current = pathname;
      navigationStartTimeRef.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    const handleStart = () => {
      // Only start loading if we're not already loading and haven't started recently
      const now = Date.now();
      if (!isLoading && (!navigationStartTimeRef.current || now - navigationStartTimeRef.current > 1000)) {
        navigationStartTimeRef.current = now;
        setIsLoading(true);
        setProgress(0);

        // Simulate progress with a more realistic pattern
        progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 85) {
              clearInterval(progressInterval);
              return 85;
            }
            // Slower progress as it gets higher
            const increment = Math.max(1, 20 - prev * 0.2);
            return prev + increment;
          });
        }, 150);
      }
    };

    const handleComplete = () => {
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
        navigationStartTimeRef.current = null;
      }, 300);
    };

    // Use a custom event system for client-side navigation
    const handleCustomNavigationStart = () => handleStart();
    const handleCustomNavigationComplete = () => handleComplete();

    window.addEventListener('navigation-start', handleCustomNavigationStart);
    window.addEventListener('navigation-complete', handleCustomNavigationComplete);

    return () => {
      clearInterval(progressInterval);
      window.removeEventListener('navigation-start', handleCustomNavigationStart);
      window.removeEventListener('navigation-complete', handleCustomNavigationComplete);
    };
  }, [isLoading]);

  if (!isLoading) return null;

    return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div
        className="h-2 bg-primary transition-all duration-300 ease-out shadow-sm"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';

export function ActivityTracker() {
  const { updateActivity, user } = useAuth();

  useEffect(() => {
    // Only track activity when user is logged in
    if (!user) return;

    // List of events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ];

    // Throttle function to prevent excessive updates
    let lastUpdate = 0;
    const throttleDelay = 5000; // Update at most every 5 seconds

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastUpdate > throttleDelay) {
        updateActivity();
        lastUpdate = now;
      }
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [updateActivity, user]);

  return null; // This component doesn't render anything
}

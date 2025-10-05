'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes total

export function SessionWarning() {
  const { user, lastActivity, updateActivity } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!user) return;

    const checkSession = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const timeUntilTimeout = SESSION_TIMEOUT - timeSinceActivity;

      if (timeUntilTimeout <= WARNING_TIME && timeUntilTimeout > 0) {
        setShowWarning(true);
        setTimeLeft(Math.ceil(timeUntilTimeout / 1000));
      } else if (timeUntilTimeout <= 0) {
        setShowWarning(false);
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkSession();

    // Check every 30 seconds
    const interval = setInterval(checkSession, 30000);

    return () => clearInterval(interval);
  }, [user, lastActivity]);

  useEffect(() => {
    if (!showWarning) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const timeUntilTimeout = SESSION_TIMEOUT - timeSinceActivity;
      const secondsLeft = Math.ceil(timeUntilTimeout / 1000);

      if (secondsLeft <= 0) {
        setShowWarning(false);
      } else {
        setTimeLeft(secondsLeft);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [showWarning, lastActivity]);

  const handleStayLoggedIn = () => {
    updateActivity();
    setShowWarning(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning || !user) return null;

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Session Timeout Warning
          </DialogTitle>
          <DialogDescription>
            Your session will expire in {formatTime(timeLeft)} due to inactivity. 
            Click "Stay Logged In" to continue your session.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleStayLoggedIn} className="w-full">
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

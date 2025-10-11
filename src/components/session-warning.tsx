'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, LogOut, RefreshCw } from 'lucide-react';

export function SessionWarning() {
  const { user, logout, lastActivity, updateActivity } = useAuth();
  const [timeLeft, setTimeLeft] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before expiry

  useEffect(() => {
    if (!user) return;

    const updateTimer = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const timeRemaining = SESSION_TIMEOUT - timeSinceActivity;
      
      if (timeRemaining <= 0) {
        // Session expired
        logout();
        return;
      }
      
      setTimeLeft(Math.max(0, timeRemaining));
      
      // Show warning if less than 5 minutes remaining
      if (timeRemaining <= WARNING_TIME) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [user, lastActivity, logout]);

  const handleExtendSession = () => {
    updateActivity();
    setShowWarning(false);
  };

  const handleLogout = () => {
    logout();
    setShowWarning(false);
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!user || !showWarning) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription className="space-y-3">
              <div>
                <p className="font-medium text-orange-800">
                  Session Expiring Soon
                </p>
                <p className="text-sm text-orange-700">
                  Your session will expire in {formatTime(timeLeft)} due to inactivity.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleExtendSession}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Extend Session
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Logout
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
import { RiskWidget } from "@/components/RiskWidget";
import { useRiskPolling } from "@/hooks/useRiskPolling";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [sessionId, setSessionId] = useState<string>('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isAutoLoaded, setIsAutoLoaded] = useState(false);

  useEffect(() => {
    // Check for active session from Call page
    const storedSessionId = localStorage.getItem('active_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      setActiveSessionId(storedSessionId);
      setIsAutoLoaded(true);
    }
    
    // Listen for storage changes (works across tabs and same-page updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'active_session_id') {
        if (e.newValue) {
          // New session started, auto-load it
          setSessionId(e.newValue);
          setActiveSessionId(e.newValue);
          setIsAutoLoaded(true);
        } else {
          // Session was cleared, stop monitoring
          setActiveSessionId(null);
          setIsAutoLoaded(false);
        }
      }
    };
    
    // Poll localStorage for same-page updates (storage event doesn't fire in same tab)
    const pollInterval = setInterval(() => {
      const currentStoredId = localStorage.getItem('active_session_id');
      if (currentStoredId && currentStoredId !== activeSessionId) {
        // New session detected
        setSessionId(currentStoredId);
        setActiveSessionId(currentStoredId);
        setIsAutoLoaded(true);
      } else if (!currentStoredId && activeSessionId && isAutoLoaded) {
        // Session cleared
        setActiveSessionId(null);
        setIsAutoLoaded(false);
      }
    }, 500); // Check every 500ms
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [activeSessionId, isAutoLoaded]);
  
  const { riskScore, error, isSessionActive } = useRiskPolling(activeSessionId);

  const handleMonitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId.trim()) {
      setActiveSessionId(sessionId.trim());
      setIsAutoLoaded(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Risk Dashboard</h1>
        <p className="text-muted-foreground">
          Analyze risk factors and session results in real-time.
        </p>
      </div>

      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle>Session Monitor</CardTitle>
          <CardDescription>
            Enter a Session ID to monitor its risk status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMonitor} className="flex gap-4 mb-6 items-end">
            <div className="flex-1 max-w-sm space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Session ID
                </label>
                {isAutoLoaded && isSessionActive && (
                  <span className="text-xs text-green-600 font-medium animate-pulse">
                    ● Live Session Active
                  </span>
                )}
                {isAutoLoaded && !isSessionActive && (
                  <span className="text-xs text-gray-500 font-medium">
                    ○ Session Ended
                  </span>
                )}
              </div>
              <Input 
                placeholder="Enter Session ID..." 
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
              />
            </div>
            <Button type="submit">Monitor Session</Button>
          </form>

          {error && (
            <div className="text-red-500 mb-4 text-sm">
              {error}
            </div>
          )}

          <RiskWidget riskScore={riskScore} />
        </CardContent>
      </Card>
    </div>
  );
}

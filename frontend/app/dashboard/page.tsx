"use client";

import React, { useState } from 'react';
import { RiskWidget } from "@/components/RiskWidget";
import { useRiskPolling } from "@/hooks/useRiskPolling";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [sessionId, setSessionId] = useState<string>('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  const { riskScore, error } = useRiskPolling(activeSessionId);

  const handleMonitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId.trim()) {
      setActiveSessionId(sessionId.trim());
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
          <form onSubmit={handleMonitor} className="flex gap-4 mb-6">
            <Input 
              placeholder="Enter Session ID..." 
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="max-w-sm"
            />
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

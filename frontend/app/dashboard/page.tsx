"use client";

import React from 'react';
import { RiskWidget } from "@/components/RiskWidget";
import { useRiskPolling } from "@/hooks/useRiskPolling";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  // Mock session ID for now to trigger polling
  const { riskScore } = useRiskPolling('mock-session-id');

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
          <CardTitle>Session Analysis</CardTitle>
          <CardDescription>
            View detailed risk metrics for the current or past sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RiskWidget riskScore={riskScore} />
        </CardContent>
      </Card>
    </div>
  );
}

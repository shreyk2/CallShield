"use client";

import React from 'react';
import { ControlPanel } from "@/components/ControlPanel";
import { AgentDisplay } from "@/components/AgentDisplay";
import { RiskWidget } from "@/components/RiskWidget";
import { useRiskPolling } from "@/hooks/useRiskPolling";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  // Mock session ID for now to trigger polling
  const { riskScore } = useRiskPolling('mock-session-id');

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor active calls and analyze risk factors in real-time.
        </p>
      </div>

      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle>Live Session Monitor</CardTitle>
          <CardDescription>
            Manage the current call session and view real-time analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recorder" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                <TabsTrigger value="recorder">Audio Recorder</TabsTrigger>
                <TabsTrigger value="risk">Risk Dashboard</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="recorder" className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="grid gap-4 md:grid-cols-2">
                <ControlPanel />
                <AgentDisplay />
              </div>
            </TabsContent>

            <TabsContent value="risk" className="animate-in fade-in-50 duration-300">
              <RiskWidget riskScore={riskScore} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

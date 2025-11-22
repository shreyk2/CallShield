"use client";

import React from 'react';
import { useAgentAudio } from '@/hooks/useAgentAudio';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic } from "lucide-react";

export const AgentDisplay = () => {
  const { isPlaying } = useAgentAudio();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Agent Status</CardTitle>
        <Mic className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`flex items-center justify-center h-24 rounded-md transition-colors ${isPlaying ? 'bg-green-100/50 dark:bg-green-900/20' : 'bg-muted/50'}`}>
          {isPlaying ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-green-700 dark:text-green-300 font-medium">Agent Speaking...</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Agent Idle</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};


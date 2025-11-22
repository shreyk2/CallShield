"use client";

import React from 'react';
import { RiskScore } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";

interface RiskWidgetProps {
  riskScore: RiskScore | null;
}

export const RiskWidget = ({ riskScore }: RiskWidgetProps) => {
  if (!riskScore) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">Waiting for call data...</div>
        </CardContent>
      </Card>
    );
  }

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'SAFE': 
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"><ShieldCheck className="w-3 h-3 mr-1"/> Safe</Badge>;
      case 'UNCERTAIN': 
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"><ShieldQuestion className="w-3 h-3 mr-1"/> Uncertain</Badge>;
      case 'HIGH_RISK': 
        return <Badge variant="destructive"><ShieldAlert className="w-3 h-3 mr-1"/> High Risk</Badge>;
      default: 
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Live Risk Analysis</CardTitle>
        {getRiskBadge(riskScore.level)}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-muted/50 rounded-md">
            <div className="text-xs text-muted-foreground mb-1">Voice Match</div>
            <div className="text-2xl font-bold tracking-tight">{riskScore.voice_match_score.toFixed(1)}%</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <div className="text-xs text-muted-foreground mb-1">Deepfake Prob</div>
            <div className="text-2xl font-bold tracking-tight">{riskScore.deepfake_probability.toFixed(1)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


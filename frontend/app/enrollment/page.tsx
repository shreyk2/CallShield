"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

export default function EnrollmentPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Voice Enrollment</h1>
        <p className="text-muted-foreground">
          Register a new voice print for authentication.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle>New Enrollment</CardTitle>
          <CardDescription>
            Please record 3 samples of your voice to create a secure voice print.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
          <div className="p-6 bg-muted rounded-full">
            <Mic className="w-12 h-12 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-medium">Ready to record</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Click the button below and read the phrase: "My voice is my password, verify me."
            </p>
          </div>
          <Button size="lg" className="w-full max-w-xs">
            Start Recording
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

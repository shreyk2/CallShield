"use client";

import React from 'react';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, PhoneOff } from "lucide-react";

export const ControlPanel = () => {
  const { isRecording, startCapture, stopCapture } = useAudioCapture();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {!isRecording ? (
            <Button
              onClick={startCapture}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Phone className="mr-2 h-4 w-4" />
              Start Call
            </Button>
          ) : (
            <Button
              onClick={stopCapture}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              <PhoneOff className="mr-2 h-4 w-4" />
              End Call
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};


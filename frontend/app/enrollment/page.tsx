"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { useAudioCapture } from "@/hooks/useAudioCapture";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { apiService } from "@/services/api";

export default function EnrollmentPage() {
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { isRecording, audioUrl, audioBlob, startCapture, stopCapture, analyser } = useAudioCapture();

  const handleSave = async () => {
    if (!audioBlob || !fullName) {
      alert('Please complete all fields and record audio');
      return;
    }

    setIsSaving(true);
    try {
      await apiService.enrollUser(fullName, audioBlob);
      alert('Enrollment successful!');
      setFullName('');
    } catch (error) {
      console.error(error);
      alert('Enrollment failed: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Voice Enrollment</h1>
        <p className="text-muted-foreground">
          Register a new voice print for authentication.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {/* User Details Form */}
        <Card className="border-border/50 shadow-lg h-fit">
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>
              Enter the identity information for this voice print.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                placeholder="John Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recording Interface */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Voice Sample</CardTitle>
            <CardDescription>
              Record a sample of your voice. Read the phrase below clearly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 space-y-6">
            
            <div className="text-center p-4 bg-muted/50 rounded-lg border border-border/50 w-full">
              <p className="text-lg font-medium italic">"My voice is my password, verify me."</p>
            </div>

            <div className="w-full">
              <AIVoiceInput 
                isRecording={isRecording}
                analyser={analyser}
                onStart={() => {
                  if (fullName) {
                    startCapture();
                  } else {
                    alert("Please enter your details first.");
                  }
                }}
                onStop={stopCapture}
                visualizerBars={32}
              />
            </div>

            {audioUrl && (
              <div className="w-full space-y-4 animate-in fade-in slide-in-from-top-2">
                <audio src={audioUrl} controls className="w-full" />
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isSaving ? "Saving..." : "Submit Enrollment"}
                </Button>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}



import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Mic, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-20 py-10">
      
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
          v1.0 Public Preview
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent pb-2">
          Secure Your Calls with AI-Powered Authentication
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px]">
          CallShield provides real-time passive voice authentication and deepfake detection to protect banking infrastructure from fraud.
        </p>
        <div className="flex gap-4 pt-4">
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <Link href="/dashboard">Launch Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
            <Link href="/enrollment">Enroll Voice</Link>
          </Button>
        </div>
      </section>

      {/* Features Grid (Bento Style) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4">
        <Card className="md:col-span-2 bg-gradient-to-br from-card to-muted/20 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Real-time Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Process audio streams instantly to detect anomalies and verify speaker identity without interrupting the conversation flow.
            </p>
            <div className="mt-4 h-32 bg-background/50 rounded-lg border border-border/50 flex items-center justify-center">
              {/* Abstract visualization placeholder */}
              <div className="flex gap-1 items-end h-16">
                {[40, 70, 30, 80, 50, 90, 60, 40, 70, 50].map((h, i) => (
                  <div key={i} className="w-2 bg-blue-500/50 rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-500" />
              Deepfake Defense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Advanced AI models trained to distinguish between synthetic and organic speech patterns with high accuracy.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-purple-500" />
              Passive Auth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Verify users seamlessly in the background using voice biometrics, eliminating the need for security questions.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-gradient-to-br from-card to-muted/20 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              Enterprise Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Built for scale with secure WebSocket streams, encrypted data handling, and comprehensive risk scoring dashboards.
            </p>
          </CardContent>
        </Card>
      </section>

    </div>
  );
}




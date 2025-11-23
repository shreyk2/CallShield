"use client";

import React, { useState, useEffect } from 'react';
import { useRiskPolling } from "@/hooks/useRiskPolling";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ShieldCheck, 
  ShieldAlert, 
  CreditCard, 
  Activity, 
  User, 
  MapPin, 
  Calendar, 
  AlertTriangle,
  Phone,
  Clock,
  Lock,
  History,
  Search,
  MoreHorizontal,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Mic,
  BrainCircuit,
  Siren
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [sessionId, setSessionId] = useState<string>('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isAutoLoaded, setIsAutoLoaded] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

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

  const { riskScore, sessionStatus, error } = useRiskPolling(activeSessionId);

  const handleMonitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId.trim()) {
      setActiveSessionId(sessionId.trim());
      setIsAutoLoaded(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Timer for "Active Call"
  useEffect(() => {
    if (activeSessionId && sessionStatus?.start_time) {
      // Sync with server start time
      const updateTimer = () => {
        const now = Date.now() / 1000;
        const duration = Math.max(0, Math.floor(now - sessionStatus.start_time));
        setCallDuration(duration);
      };
      
      updateTimer(); // Update immediately
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else if (activeSessionId) {
      // Fallback local timer
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCallDuration(0);
    }
  }, [activeSessionId, sessionStatus?.start_time]);

  // Derived state for UI
  const isAuthenticated = riskScore?.status === 'SAFE';
  const voiceMatch = riskScore?.match_score ?? 0;
  const fraudRisk = riskScore?.fake_score ?? 0;
  
  const rawName = sessionStatus?.user_id || "Jane A. Doe";
  // Format name: remove email domain if present
  const customerName = rawName.includes('@') ? rawName.split('@')[0] : rawName;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 font-sans">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">
              A
            </div>
            <div>
              <div className="text-sm text-slate-400">Agent ID</div>
              <div className="font-mono font-bold">482</div>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <div className="text-sm text-slate-400">Active Call</div>
            <div className="font-mono font-bold text-green-400 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {formatTime(callDuration)}
            </div>
          </div>
        </div>

        {/* Session Input (Discreet) */}
        <form onSubmit={handleMonitor} className="flex items-center gap-2">
           <Input 
              placeholder="Session ID..." 
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="h-8 w-48 bg-slate-900 border-slate-700 text-xs font-mono"
            />
            {isAutoLoaded && <Badge variant="outline" className="text-green-500 border-green-500/30 text-[10px]">Linked</Badge>}
        </form>

        {/* Auth Banner */}
        <div className={cn(
          "px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors duration-500",
          isAuthenticated ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
        )}>
          {isAuthenticated ? (
            <>
              <ShieldCheck className="h-5 w-5" />
              CLIENT AUTHENTICATED (VOICE ID VERIFIED)
            </>
          ) : (
            <>
              <ShieldAlert className="h-5 w-5" />
              VERIFYING IDENTITY...
            </>
          )}
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Customer Info */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <Card className="bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-400 font-medium">Customer Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center pb-4 border-b border-slate-800">
                <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                  <User className="h-10 w-10 text-slate-500" />
                </div>
                <h2 className="text-2xl font-bold">{customerName}</h2>
                <p className="text-slate-400 text-sm">Premium Member since 2018</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-slate-500 mt-1" />
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Date of Birth</div>
                    <div className="font-medium">05/20/1985</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-slate-500 mt-1" />
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Address</div>
                    <div className="font-medium text-sm">1234 Elm Street, Apt 4B<br/>New York, NY 10001</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Activity className="h-4 w-4 text-slate-500 mt-1" />
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Risk Score</div>
                    <Badge className="mt-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 border-none">
                      2/10 (Low)
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column: Active Cards & Transactions */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          
          {/* Active Cards */}
          <Card className="bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-400" />
                Active Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Card 1 */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center text-xs font-bold italic">
                      VISA
                    </div>
                    <div>
                      <div className="font-mono font-bold text-lg">•••• 4567</div>
                      <div className="text-xs text-slate-400">Limit: $15,000</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-green-400 border-green-400/30">Active</Badge>
                    <Button variant="destructive" size="sm" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50">
                      <Lock className="h-3 w-3 mr-2" />
                      Freeze Card
                    </Button>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-16 bg-gradient-to-br from-orange-500 to-red-600 rounded flex items-center justify-center text-xs font-bold italic">
                      MC
                    </div>
                    <div>
                      <div className="font-mono font-bold text-lg">•••• 9012</div>
                      <div className="text-xs text-slate-400">Limit: $8,000</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-green-400 border-green-400/30">Active</Badge>
                    <Button variant="destructive" size="sm" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50">
                      <Lock className="h-3 w-3 mr-2" />
                      Freeze Card
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-400" />
                Recent Transactions (Visa 4567)
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                View All <ArrowDownRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {[
                  { date: "Today, 10:42 AM", merchant: "Amazon Prime", amount: "$14.99", status: "Pending", highlight: true },
                  { date: "Yesterday, 6:15 PM", merchant: "Shell Gas Station", amount: "$45.20", status: "Posted", highlight: false },
                  { date: "Nov 20, 12:30 PM", merchant: "Whole Foods Market", amount: "$124.50", status: "Posted", highlight: false },
                  { date: "Nov 19, 09:00 AM", merchant: "Starbucks Coffee", amount: "$6.45", status: "Posted", highlight: false },
                  { date: "Nov 18, 08:15 PM", merchant: "Uber Ride", amount: "$24.10", status: "Posted", highlight: false },
                ].map((tx, i) => (
                  <div key={i} className={cn(
                    "grid grid-cols-12 gap-4 p-3 rounded-md items-center text-sm",
                    tx.highlight ? "bg-blue-500/10 border border-blue-500/20" : "hover:bg-slate-800/50"
                  )}>
                    <div className="col-span-3 text-slate-400">{tx.date}</div>
                    <div className="col-span-5 font-medium">{tx.merchant}</div>
                    <div className="col-span-2 font-mono text-right">{tx.amount}</div>
                    <div className="col-span-2 text-right">
                      <Badge variant="secondary" className={cn(
                        "text-[10px]",
                        tx.status === 'Pending' ? "bg-yellow-500/10 text-yellow-500" : "bg-slate-800 text-slate-400"
                      )}>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Security & Actions */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          
          {/* Next Best Action */}
          <Card className="bg-gradient-to-br from-blue-900/50 to-slate-900 border-blue-500/30 text-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wider text-blue-400 font-bold flex items-center gap-2">
                <BrainCircuit className="h-4 w-4" />
                Next Best Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium leading-relaxed">
                Verify reason for call, then click <span className="text-red-400 font-bold">'Freeze Card'</span> on Visa 4567.
              </p>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-400" />
                Security & Auth
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Voice Accuracy Widget */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2">
                    <Mic className="h-3 w-3" /> Voice Match
                  </span>
                  <span className="text-xs text-slate-500">Last: 30s ago</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-white">{voiceMatch.toFixed(1)}%</span>
                  <span className="text-sm text-green-400 mb-1 font-medium">High Confidence</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-1000 ease-out" 
                    style={{ width: `${voiceMatch}%` }}
                  />
                </div>
              </div>

              {/* AI Fraud Score Widget */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2">
                    <Siren className="h-3 w-3" /> AI Fraud Risk
                  </span>
                  <Activity className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-white">{fraudRisk.toFixed(1)}%</span>
                  <span className="text-sm text-slate-400 mb-1 font-medium">Low Risk</span>
                </div>
                {/* Mini Bar Graph Visualization */}
                <div className="flex items-end gap-1 h-8 mt-2">
                  {[20, 35, 15, 45, 10, 5, 3].map((h, i) => (
                    <div key={i} className="flex-1 bg-slate-800 rounded-sm hover:bg-blue-500/50 transition-colors" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              {/* Auth Log */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Authentication Log</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="mt-1"><CheckCircle2 className="h-4 w-4 text-green-500" /></div>
                    <div>
                      <div className="font-medium text-slate-200">IVR Authentication Success</div>
                      <div className="text-xs text-slate-500">10:38 PM • DOB/SSN Verified</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1"><XCircle className="h-4 w-4 text-red-500" /></div>
                    <div>
                      <div className="font-medium text-slate-200">Mobile Login Failure</div>
                      <div className="text-xs text-slate-500">09:15 AM • Incorrect Password</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1"><AlertTriangle className="h-4 w-4 text-yellow-500" /></div>
                    <div>
                      <div className="font-medium text-slate-200">Large Purchase Alert</div>
                      <div className="text-xs text-slate-500">Yesterday • Overridden by User</div>
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Quick Action Bar */}
          <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 shadow-lg shadow-red-900/20">
            <AlertTriangle className="mr-2 h-5 w-5" />
            REPORT FRAUD
          </Button>

        </div>
      </div>
    </div>
  );
}

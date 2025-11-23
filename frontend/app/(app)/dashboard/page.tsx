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
  Siren,
  Mail,
  Hash
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [sessionId, setSessionId] = useState<string>('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isAutoLoaded, setIsAutoLoaded] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showAIAlert, setShowAIAlert] = useState(false);
  const [hasShownAIAlert, setHasShownAIAlert] = useState(false);
  const [hasAICheckReturned, setHasAICheckReturned] = useState(false);

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
  const voiceMatch = riskScore?.match_score ?? 0;
  const fraudRisk = riskScore?.fake_score ?? 0;

  // Show modal when fraud risk exceeds 50% (only once per session)
  useEffect(() => {
    if (fraudRisk > 50 && !hasShownAIAlert && activeSessionId) {
      setShowAIAlert(true);
      setHasShownAIAlert(true);
    }
  }, [fraudRisk, hasShownAIAlert, activeSessionId]);

  // Reset alert state when session changes
  useEffect(() => {
    setHasShownAIAlert(false);
    setShowAIAlert(false);
    setHasAICheckReturned(false);
  }, [activeSessionId]);

  // Track when first AI check returns (fraudRisk > 0 means AI detection has run)
  useEffect(() => {
    if (fraudRisk > 0 && !hasAICheckReturned) {
      setHasAICheckReturned(true);
    }
  }, [fraudRisk, hasAICheckReturned]);
  
  // Helper functions for dynamic labels
  const getVoiceConfidence = () => {
    if (voiceMatch >= 80) return { label: "High Confidence", color: "text-green-400" };
    if (voiceMatch >= 50) return { label: "Medium Confidence", color: "text-yellow-400" };
    return { label: "Low Confidence", color: "text-red-400" };
  };

  const getFraudRiskLevel = () => {
    if (fraudRisk >= 50) return { label: "High Risk", color: "text-red-400" };
    if (fraudRisk >= 20) return { label: "Medium Risk", color: "text-yellow-400" };
    return { label: "Low Risk", color: "text-green-400" };
  };

  const getAuthStatus = () => {
    // Stay yellow until AI check returns
    if (!riskScore || riskScore.status === 'INITIAL' || !hasAICheckReturned) {
      return { text: "VERIFYING IDENTITY...", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: ShieldAlert };
    }
    switch (riskScore.status) {
      case 'HIGH_RISK':
        return { text: "HIGH RISK DETECTED", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: ShieldAlert };
      case 'UNCERTAIN':
        return { text: "VERIFYING IDENTITY...", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: ShieldAlert };
      case 'SAFE':
        return { text: "CLIENT AUTHENTICATED (VOICE ID VERIFIED)", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: ShieldCheck };
      default:
        return { text: "VERIFYING IDENTITY...", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: ShieldAlert };
    }
  };
  
  const rawName = sessionStatus?.user_id || "Jane A. Doe";
  // Format name: remove email domain if present
  const customerName = rawName.includes('@') ? rawName.split('@')[0] : rawName;
  const authStatus = getAuthStatus();
  const voiceConfidence = getVoiceConfidence();
  const fraudRiskLevel = getFraudRiskLevel();



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
          "px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors duration-500 border",
          authStatus.color
        )}>
          <authStatus.icon className="h-5 w-5" />
          {authStatus.text}
        </div>
      </header>

      {/* AI Detection Alert Modal */}
      {showAIAlert && (
        <>
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300"
            onClick={() => setShowAIAlert(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full pointer-events-auto animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-10 text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="bg-red-500/20 p-6 rounded-full">
                    <AlertTriangle className="h-16 w-16 text-red-400" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-slate-100 mb-6">
                  High Priority Security Alert
                </h2>

                {/* Message */}
                <div className="space-y-6 mb-8">
                  <p className="text-2xl text-slate-200">
                    <span className="text-red-400 font-semibold">AI speech patterns detected</span>
                  </p>
                  <p className="text-lg text-slate-300">
                    Please use <span className="font-semibold">stricter identity verification</span>
                  </p>
                </div>

                {/* Button */}
                <Button
                  onClick={() => setShowAIAlert(false)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-xl"
                >
                  I Understand
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

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
                  <Mail className="h-4 w-4 text-slate-500 mt-1" />
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Email</div>
                    <div className="font-medium text-sm">jane.doe@email.com</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-slate-500 mt-1" />
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Phone</div>
                    <div className="font-medium">(555) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-slate-500 mt-1" />
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Date of Birth</div>
                    <div className="font-medium">05/20/1985</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Hash className="h-4 w-4 text-slate-500 mt-1" />
                  <div>
                    <div className="text-xs text-slate-500 uppercase">SSN (Last 4)</div>
                    <div className="font-medium">****-7890</div>
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

          {/* Report Fraud Button */}
          <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 shadow-lg shadow-red-900/20">
            <AlertTriangle className="mr-2 h-5 w-5" />
            REPORT FRAUD
          </Button>
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
                {(!riskScore || riskScore.status === 'INITIAL') ? (
                  <div className="flex items-center gap-2 py-2">
                    <span className="text-2xl font-medium text-slate-400">Calculating...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-white">{voiceMatch.toFixed(1)}%</span>
                      <span className={cn("text-sm mb-1 font-medium", voiceConfidence.color)}>{voiceConfidence.label}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000 ease-out",
                          voiceMatch >= 80 ? "bg-green-500" : voiceMatch >= 50 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${voiceMatch}%` }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* AI Fraud Score Widget */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2">
                    <Siren className="h-3 w-3" /> AI Fraud Risk
                  </span>
                  <Activity className="h-4 w-4 text-slate-600" />
                </div>
                {(!riskScore || riskScore.status === 'INITIAL') ? (
                  <div className="flex items-center gap-2 py-2">
                    <span className="text-2xl font-medium text-slate-400">Calculating...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-white">{fraudRisk.toFixed(1)}%</span>
                      <span className={cn("text-sm mb-1 font-medium", fraudRiskLevel.color)}>{fraudRiskLevel.label}</span>
                    </div>
                    {/* Mini Bar Graph Visualization */}
                    <div className="flex items-end gap-1 h-8 mt-2">
                      {[20, 35, 15, 45, 10, 5, 3].map((h, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "flex-1 rounded-sm transition-colors",
                            fraudRisk >= 50 ? "bg-red-500/50 hover:bg-red-500/70" :
                            fraudRisk >= 20 ? "bg-yellow-500/50 hover:bg-yellow-500/70" :
                            "bg-slate-800 hover:bg-blue-500/50"
                          )}
                          style={{ height: `${h}%` }} 
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Social Engineering Results */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Social Engineering Results</h4>
                  {riskScore?.se_risk_level && (
                    <Badge variant={riskScore.se_risk_level === 'SAFE' ? 'outline' : 'destructive'} className="text-[10px]">
                      {riskScore.se_risk_level}
                    </Badge>
                  )}
                </div>
                
                {!riskScore?.se_risk_level ? (
                   <div className="text-sm text-slate-500 italic py-2">Waiting for analysis...</div>
                ) : (
                  <div className="space-y-3 text-sm">
                    {/* Risk Score */}
                    <div className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800">
                       <span className="text-slate-400">Threat Score</span>
                       <span className={cn(
                         "font-mono font-bold",
                         (riskScore.se_risk_score || 0) > 50 ? "text-red-400" : "text-green-400"
                       )}>
                         {riskScore.se_risk_score || 0}/100
                       </span>
                    </div>

                    {/* Reason */}
                    {riskScore.se_reason && (
                      <div className="text-xs text-slate-400 bg-slate-950/50 p-2 rounded">
                        {riskScore.se_reason}
                      </div>
                    )}

                    {/* Flagged Phrases */}
                    {riskScore.se_flagged_phrases && riskScore.se_flagged_phrases.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-red-400 flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3" /> Suspicious Phrases Detected
                        </div>
                        <ul className="space-y-2">
                          {riskScore.se_flagged_phrases.map((phrase, i) => (
                            <li key={i} className="text-xs bg-red-500/10 text-red-200 p-2 rounded border border-red-500/20 italic">
                              "{phrase}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 p-2 rounded border border-green-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        No suspicious patterns detected
                      </div>
                    )}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

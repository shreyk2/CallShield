"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, User, LogOut, Github } from "lucide-react"; // Added Icons
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email;
      if (email?.endsWith('@callshield.local')) {
        setUserEmail(email.split('@')[0]);
      } else {
        setUserEmail(email || null);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email;
      if (email?.endsWith('@callshield.local')) {
        setUserEmail(email.split('@')[0]);
      } else {
        setUserEmail(email || null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/enrollment",
      label: "Enrollment",
      active: pathname === "/enrollment",
    },
    {
      href: "/call",
      label: "Call Simulation",
      active: pathname === "/call",
    },
    {
      href: "/dashboard",
      label: "Agent Dashboard",
      active: pathname === "/dashboard",
    },
  ];

  return (
    // UPDATED: Dark theme, glassmorphism, and sticky positioning
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/70 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-1.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <span className="hidden font-bold text-lg tracking-tight text-white sm:inline-block">
              CallShield
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "transition-colors duration-200",
                  route.active 
                    ? "text-blue-400 font-semibold" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <Button 
            asChild 
            variant="ghost" 
            size="sm" 
            className="text-slate-400 hover:text-white hover:bg-slate-800 hidden sm:flex"
          >
            <Link
              href="https://github.com/shreyk2/CallShield"
              target="_blank"
              rel="noreferrer"
              className="gap-2"
            >
              <Github className="w-4 h-4" />
              GitHub
            </Link>
          </Button>
          
          {userEmail ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-medium text-slate-300">
                  {userEmail}
                </span>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                title="Sign Out"
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
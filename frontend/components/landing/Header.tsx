"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, User, LogOut, Github, Menu, X } from "lucide-react"; 
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    };
    getUser();
  }, []);

  const routes = [
    { href: "/", label: "Home" },
    { href: "/enrollment", label: "Enrollment" },
    { href: "/call", label: "Call Simulation" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-slate-950/80 backdrop-blur-md border-slate-800 py-3" 
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        
        {/* Left: Logo & Hamburger (Mobile) */}
        <div className="flex items-center gap-4">
           {/* Mobile Menu Toggle */}
           <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-300 hover:bg-slate-800 -ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-1.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">CallShield</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6 ml-6">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-white",
                    pathname === route.href ? "text-blue-400" : "text-slate-400"
                  )}
                >
                  {route.label}
                </Link>
              ))}
            </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {userEmail ? (
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-800">
              <span className="text-xs font-medium text-slate-400">{userEmail}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-400">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 shadow-lg shadow-blue-900/20">
              <Link href="/login">Log in</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-950 border-b border-slate-800 p-4 animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-3">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 rounded-lg"
              >
                {route.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
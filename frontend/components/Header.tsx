"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, User } from "lucide-react";
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
      label: "Call",
      active: pathname === "/call",
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              CallShield
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  route.active ? "text-foreground" : "text-foreground/60"
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center">
            <Button asChild variant="ghost" size="sm">
              <Link
                href="https://github.com/shreyk2/CallShield"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </Link>
            </Button>
          </nav>
          
          {userEmail ? (
            <div className="flex items-center gap-4 pl-4 border-l border-border">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium hidden sm:inline-block">
                  {userEmail}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" className="ml-4">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { EnvVarWarning } from "@/components/env-var-warning";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { createClient } from "@/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserData {
  email?: string;
  role?: string;
}

export default function AdminAuthRow() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser({
            email: data.user.email,
            role: (data.user.user_metadata?.role as string) ?? "user",
          });
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          role: (session.user.user_metadata?.role as string) ?? "user",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  if (loading) {
    return (
      <SidebarMenuButton disabled>
        <User className="size-4" />
        <span>Loading...</span>
      </SidebarMenuButton>
    );
  }

  if (!user) {
    return (
      <SidebarMenuButton asChild>
        <Link href="/auth/login">
          <User className="size-4" />
          <span>Sign in</span>
        </Link>
      </SidebarMenuButton>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton>
          <User className="size-4" />
          <div className="flex flex-col gap-0.5 text-left text-xs group-data-[collapsible=icon]:hidden">
            <span className="font-medium truncate">{user.email}</span>
            <span className="text-muted-foreground capitalize">{user.role}</span>
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user.role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/supabase/client";
import { LogoutButton } from "./logout-button";

interface AppMetadata {
  role?: "admin" | "editor" | "user" | string;
  [key: string]: unknown;
}

interface UserClaims {
  sub: string;
  email?: string;
  role?: string;
}

// Role is read ONLY from app_metadata (signed in JWT, server-controlled).
//! user_metadata is user-modifiable and MUST NOT be used for authorization.
function readRoleFromAppMetadata(obj: unknown): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const val = (obj as AppMetadata).role;
  return typeof val === "string" ? val : undefined;
}

export function AuthButton() {
  const [userClaims, setUserClaims] = useState<UserClaims | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: claimsData } = await supabase.auth.getClaims();
        const claims = claimsData?.claims as
          | Record<string, unknown>
          | undefined;

        if (claims) {
          setUserClaims({
            sub: claims.sub ? String(claims.sub) : "",
            email:
              typeof claims.email === "string" ? claims.email : undefined,
            role: readRoleFromAppMetadata(claims.app_metadata),
          });
        } else {
          setUserClaims(null);
        }
      } catch {
        setUserClaims(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserClaims({
          sub: session.user.id,
          email: session.user.email ?? undefined,
          role: readRoleFromAppMetadata(session.user.app_metadata),
        });
      } else {
        setUserClaims(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  if (loading) {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled>
          Loading...
        </Button>
      </div>
    );
  }

  return userClaims ? (
    <div className="flex items-start gap-8  flex-col">
      Hello👋🏼 {/* <br></br> {userClaims.email} */}
      <br></br> {String(userClaims.role ?? "")}
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}

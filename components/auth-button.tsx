"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/supabase/client";
import { LogoutButton } from "./logout-button";

interface UserMetadata {
  role?: "admin" | "editor" | "viewer" | string;
  [key: string]: unknown;
}

interface UserClaims {
  sub: string;
  email?: string;
  role?: string;
  metadata?: UserMetadata;
  [key: string]: unknown;
}

export function AuthButton() {
  const [userClaims, setUserClaims] = useState<UserClaims | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Hybrid pattern: fast check with getClaims(), then fetch full user only if we need user_metadata.role
    const initAuth = async () => {
      try {
        const { data: claimsData } = await supabase.auth.getClaims();
        const claims = claimsData?.claims as
          | Record<string, unknown>
          | undefined;

        if (claims) {
          const roleFromClaims =
            typeof claims.role === "string"
              ? (claims.role as string)
              : undefined;
          const subFromClaims = claims.sub ? String(claims.sub) : "";
          const emailFromClaims =
            typeof claims.email === "string" ? String(claims.email) : undefined;

          setUserClaims({
            sub: subFromClaims || "",
            email: emailFromClaims,
            role: roleFromClaims,
            metadata: claims as UserMetadata,
          });
        }

        // If we don't have an explicit role from claims, fetch the full user which contains user_metadata
        if (!claims || typeof claims.role !== "string") {
          const { data } = await supabase.auth.getUser();
          const user = data?.user ?? null;
          if (user) {
            const userMeta = (user.user_metadata ?? {}) as UserMetadata;
            setUserClaims({
              sub: user.id,
              email: user.email ?? undefined,
              role: userMeta.role ?? undefined,
              metadata: userMeta,
            });
          } else if (!claims) {
            setUserClaims(null);
          }
        }
      } catch (err) {
        setUserClaims(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes - provides full session/user object
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Extract claims from session for consistency
      if (session?.user) {
        const meta = (session.user.user_metadata ?? {}) as UserMetadata;
        setUserClaims({
          sub: session.user.id,
          email: session.user.email ?? undefined,
          role: meta.role ?? undefined,
          metadata: meta,
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

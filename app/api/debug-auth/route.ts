/**
 * Route de diagnostic pour tester l'authentification serveur
 * Vérifie si les cookies d'auth sont présents et valides
 */
import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { HttpStatus } from "@/lib/api/helpers";

export async function GET() {
  try {
    // 1. Récupérer tous les cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // 2. Créer le client Supabase
    const supabase = await createClient();

    // 3. Tester l'authentification
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // 4. Tester une requête simple sur une table publique
    const { data: heroData, error: heroError } = await supabase
      .from("home_hero_slides")
      .select("id, title, active")
      .limit(1);

    // 5. Construire le rapport de diagnostic
    const diagnosticReport = {
      timestamp: new Date().toISOString(),

      cookies: {
        total: allCookies.length,
        authCookies: allCookies
          .filter((c) => c.name.includes("supabase") || c.name.includes("sb-"))
          .map((c) => ({
            name: c.name,
            valuePreview: c.value.substring(0, 20) + "...",
            length: c.value.length,
          })),
        allCookieNames: allCookies.map((c) => c.name),
      },

      authentication: {
        user: user
          ? {
              id: user.id,
              email: user.email,
              role: user.role,
              aud: user.aud,
              userMetadata: user.user_metadata,
            }
          : null,
        error: userError
          ? {
              message: userError.message,
              status: userError.status,
            }
          : null,
      },

      databaseAccess: {
        querySuccess: !heroError,
        rowsReturned: heroData?.length ?? 0,
        sampleData: heroData?.[0] ?? null,
        error: heroError
          ? {
              message: heroError.message,
              code: heroError.code,
              details: heroError.details,
              hint: heroError.hint,
            }
          : null,
      },

      environment: {
        supabaseUrl:
          process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
        hasPublishableKey:
          !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
        keyType: "PUBLISHABLE_OR_ANON",
      },
    };

    return NextResponse.json(diagnosticReport, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Diagnostic failed",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      }
    );
  }
}

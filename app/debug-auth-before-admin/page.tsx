/**
 * Page de diagnostic de l'authentification serveur
 * Affiche l'état complet de l'auth et des accès RLS
 */
import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";

export default async function DebugAuthPage() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const supabase = await createClient();

  // Test 1: Récupérer l'utilisateur
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Test 2: Requête sur une table publique
  const { data: heroData, error: heroError } = await supabase
    .from("home_hero_slides")
    .select("id, title, active")
    .limit(3);

  // Test 3: Requête sur profiles (nécessite auth)
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, display_name, role")
    .limit(3);

  // Test 4: Requête sur spectacles (public + admin)
  const { data: spectaclesData, error: spectaclesError } = await supabase
    .from("spectacles")
    .select("id, title")
    .limit(3);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">
        🔍 Diagnostic d&apos;Authentification Serveur
      </h1>

      {/* Section Cookies */}
      <section className="mb-8 p-6 bg-card rounded-lg border">
        <h2 className="text-2xl font-semibold mb-4">🍪 Cookies</h2>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-mono">{allCookies.length}</span>{" "}
            cookies
          </p>
          <div className="mt-4">
            <p className="font-semibold mb-2">Cookies Supabase:</p>
            <ul className="space-y-1">
              {allCookies
                .filter(
                  (c) => c.name.includes("supabase") || c.name.includes("sb-")
                )
                .map((c) => (
                  <li key={c.name} className="font-mono text-sm">
                    {c.name}{" "}
                    <span className="text-muted-foreground">
                      ({c.value.length} chars)
                    </span>
                  </li>
                ))}
              {allCookies.filter(
                (c) => c.name.includes("supabase") || c.name.includes("sb-")
              ).length === 0 && (
                <li className="text-destructive">
                  ❌ Aucun cookie d&apos;authentification trouvé
                </li>
              )}
            </ul>
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Tous les cookies ({allCookies.length})
            </summary>
            <ul className="mt-2 space-y-1 ml-4">
              {allCookies.map((c) => (
                <li
                  key={c.name}
                  className="font-mono text-xs text-muted-foreground"
                >
                  {c.name}
                </li>
              ))}
            </ul>
          </details>
        </div>
      </section>

      {/* Section Utilisateur */}
      <section className="mb-8 p-6 bg-card rounded-lg border">
        <h2 className="text-2xl font-semibold mb-4">👤 Utilisateur</h2>
        {userError ? (
          <div className="text-destructive">
            <p className="font-semibold">❌ Erreur d&apos;authentification</p>
            <p className="text-sm mt-2">{userError.message}</p>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
              {JSON.stringify(userError, null, 2)}
            </pre>
          </div>
        ) : user ? (
          <div className="space-y-2">
            <p>
              ✅ <span className="font-semibold">Utilisateur authentifié</span>
            </p>
            <dl className="grid grid-cols-2 gap-2 text-sm mt-4">
              <dt className="font-semibold">ID:</dt>
              <dd className="font-mono text-xs">{user.id}</dd>

              <dt className="font-semibold">Email:</dt>
              <dd>{user.email}</dd>

              <dt className="font-semibold">Role:</dt>
              <dd className="font-mono">{user.role}</dd>

              <dt className="font-semibold">Audience:</dt>
              <dd className="font-mono">{user.aud}</dd>
            </dl>
            {user.user_metadata &&
              Object.keys(user.user_metadata).length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    User Metadata
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(user.user_metadata, null, 2)}
                  </pre>
                </details>
              )}
          </div>
        ) : (
          <p className="text-muted-foreground">
            ⚠️ Aucun utilisateur authentifié
          </p>
        )}
      </section>

      {/* Section Tests d'accès */}
      <section className="mb-8 p-6 bg-card rounded-lg border">
        <h2 className="text-2xl font-semibold mb-4">
          🔐 Tests d&apos;Accès aux Tables
        </h2>

        {/* Test home_hero_slides */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Table: home_hero_slides</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Policy: Accessible à anon/authenticated si active=true
          </p>
          {heroError ? (
            <div className="text-destructive text-sm">
              <p>❌ Échec de la requête</p>
              <p className="font-mono mt-1">Code: {heroError.code}</p>
              <p className="mt-1">{heroError.message}</p>
              {heroError.hint && (
                <p className="text-xs mt-1">Hint: {heroError.hint}</p>
              )}
            </div>
          ) : (
            <div className="text-green-600 text-sm">
              <p>✅ Requête réussie</p>
              <p className="mt-1">
                {heroData?.length ?? 0} ligne(s) retournée(s)
              </p>
              {heroData && heroData.length > 0 && (
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(heroData, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Test profiles */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Table: profiles</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Policy: Requiert authentification
          </p>
          {profileError ? (
            <div className="text-destructive text-sm">
              <p>❌ Échec de la requête</p>
              <p className="font-mono mt-1">Code: {profileError.code}</p>
              <p className="mt-1">{profileError.message}</p>
            </div>
          ) : (
            <div className="text-green-600 text-sm">
              <p>✅ Requête réussie</p>
              <p className="mt-1">
                {profileData?.length ?? 0} ligne(s) retournée(s)
              </p>
            </div>
          )}
        </div>

        {/* Test spectacles */}
        <div>
          <h3 className="font-semibold mb-2">Table: spectacles</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Policy: Public si actif, admin peut tout voir
          </p>
          {spectaclesError ? (
            <div className="text-destructive text-sm">
              <p>❌ Échec de la requête</p>
              <p className="font-mono mt-1">Code: {spectaclesError.code}</p>
              <p className="mt-1">{spectaclesError.message}</p>
            </div>
          ) : (
            <div className="text-green-600 text-sm">
              <p>✅ Requête réussie</p>
              <p className="mt-1">
                {spectaclesData?.length ?? 0} ligne(s) retournée(s)
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Section Environnement */}
      <section className="p-6 bg-card rounded-lg border">
        <h2 className="text-2xl font-semibold mb-4">⚙️ Configuration</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="font-semibold">Supabase URL:</dt>
          <dd className="font-mono text-xs">
            {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 40)}...
          </dd>

          <dt className="font-semibold">Clé utilisée:</dt>
          <dd className="font-mono text-xs">PUBLISHABLE_OR_ANON_KEY</dd>

          <dt className="font-semibold">Mode:</dt>
          <dd>Server Component</dd>
        </dl>
      </section>
    </div>
  );
}

/**
 * Page de diagnostic admin - Authentification et accès RLS
 * ⚠️ Cette page est protégée par le layout (admin)
 */
import { createClient } from "@/supabase/server";
import { createAdminClient } from "@/supabase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDebugAuthPage() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const supabase = await createClient();

  // Vérifier que l'utilisateur est admin
  const claims = await supabase.auth.getClaims();
  if (!claims) {
    redirect("/auth/login");
  }

  // Test 1: Récupérer l'utilisateur complet
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Test 2: Vérifier le profil dans profiles
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, display_name, role")
    .eq("user_id", user?.id || "")
    .single();

  // Test 2.5: Tester la fonction is_admin() directement
  const { data: isAdminResult, error: isAdminError } = await supabase.rpc(
    "is_admin"
  );

  // Test 3: Tables publiques (devrait fonctionner)
  const { data: heroData, error: heroError } = await supabase
    .from("home_hero_slides")
    .select("id, title, active")
    .limit(3);

  // Test 4: Tables admin-only
  const { data: teamData, error: teamError } = await supabase
    .from("membres_equipe")
    .select("id, name, role, active")
    .limit(3);

  // Test 5: Requête spectacles (admin voit tout)
  const { data: spectaclesData, error: spectaclesError } = await supabase
    .from("spectacles")
    .select("id, title, status")
    .limit(5);

  // Test 6: Événements avec JOIN
  const { data: eventsData, error: eventsError } = await supabase
    .from("evenements")
    .select("id, date_debut, status, spectacles(id, title)")
    .limit(3);

  // Test 7: Vues admin-only (IMPORTANT: Utiliser adminClient avec service_role)
  const adminClient = await createAdminClient();

  const { data: dashboardData, error: dashboardError } = await adminClient
    .from("communiques_presse_dashboard")
    .select("id, title")
    .limit(3);

  const { data: analyticsData, error: analyticsError } = await adminClient
    .from("analytics_summary")
    .select("event_type, total_events")
    .limit(3);

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          🔍 Diagnostic Admin - Authentification & RLS
        </h1>
        <p className="text-muted-foreground mt-2">
          Page de diagnostic réservée aux administrateurs
        </p>
      </div>

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
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Utilisateur */}
        <section className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">👤 Utilisateur</h2>
          {userError ? (
            <div className="text-destructive">
              <p className="font-semibold">❌ Erreur d&apos;authentification</p>
              <p className="text-sm mt-2">{userError.message}</p>
            </div>
          ) : user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <span className="font-semibold">Authentifié</span>
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-semibold text-muted-foreground">ID:</dt>
                  <dd className="font-mono text-xs mt-1 break-all">
                    {user.id}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-muted-foreground">
                    Email:
                  </dt>
                  <dd className="mt-1">{user.email}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-muted-foreground">Role:</dt>
                  <dd className="mt-1 font-mono">{user.role}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="text-muted-foreground">
              ⚠️ Aucun utilisateur authentifié
            </p>
          )}
        </section>

        {/* Section Profile */}
        <section className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">👥 Profile DB</h2>
          {profileError ? (
            <div className="text-destructive text-sm">
              <p className="font-semibold">❌ Échec</p>
              <p className="mt-1">{profileError.message}</p>
            </div>
          ) : profileData ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">✅</span>
                <span className="font-semibold">Profile trouvé</span>
              </div>
              <dl className="space-y-2">
                <div>
                  <dt className="font-semibold text-muted-foreground">Nom:</dt>
                  <dd className="mt-1">{profileData.display_name || "N/A"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-muted-foreground">Role:</dt>
                  <dd className="mt-1 font-mono">
                    {profileData.role || "user"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-muted-foreground">
                    is_admin():
                  </dt>
                  <dd className="mt-1">
                    {isAdminError ? (
                      <span className="text-destructive">
                        ❌ Erreur: {isAdminError.message}
                      </span>
                    ) : (
                      <span className={isAdminResult ? "text-green-600" : "text-destructive"}>
                        {isAdminResult ? "✅ TRUE" : "❌ FALSE"}
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="text-muted-foreground">⚠️ Pas de profile trouvé</p>
          )}
        </section>
      </div>

      {/* Section Tests d'accès */}
      <section className="mt-6 p-6 bg-card rounded-lg border">
        <h2 className="text-2xl font-semibold mb-4">
          🔐 Tests d&apos;Accès Tables & Vues
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test home_hero_slides */}
          <div className="space-y-2">
            <h3 className="font-semibold">📋 home_hero_slides (public)</h3>
            <p className="text-xs text-muted-foreground">
              Accessible à tous si active=true
            </p>
            {heroError ? (
              <div className="text-destructive text-sm">
                <p>❌ {heroError.message}</p>
              </div>
            ) : (
              <div className="text-green-600 text-sm">
                <p>✅ {heroData?.length ?? 0} ligne(s)</p>
              </div>
            )}
          </div>

          {/* Test membres_equipe */}
          <div className="space-y-2">
            <h3 className="font-semibold">👥 membres_equipe (admin)</h3>
            <p className="text-xs text-muted-foreground">
              Admin CRUD uniquement
            </p>
            {teamError ? (
              <div className="text-destructive text-sm">
                <p>❌ {teamError.message}</p>
              </div>
            ) : (
              <div className="text-green-600 text-sm">
                <p>✅ {teamData?.length ?? 0} ligne(s)</p>
              </div>
            )}
          </div>

          {/* Test spectacles */}
          <div className="space-y-2">
            <h3 className="font-semibold">🎭 spectacles (mixed)</h3>
            <p className="text-xs text-muted-foreground">
              Admin voit tout, public voit actifs
            </p>
            {spectaclesError ? (
              <div className="text-destructive text-sm">
                <p>❌ {spectaclesError.message}</p>
              </div>
            ) : (
              <div className="text-green-600 text-sm">
                <p>✅ {spectaclesData?.length ?? 0} ligne(s)</p>
                {spectaclesData && spectaclesData.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs">
                      Voir détails
                    </summary>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(spectaclesData, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>

          {/* Test événements avec JOIN */}
          <div className="space-y-2">
            <h3 className="font-semibold">📅 evenements + JOIN (public)</h3>
            <p className="text-xs text-muted-foreground">
              Test relation avec spectacles
            </p>
            {eventsError ? (
              <div className="text-destructive text-sm">
                <p>❌ {eventsError.message}</p>
              </div>
            ) : (
              <div className="text-green-600 text-sm">
                <p>✅ {eventsData?.length ?? 0} ligne(s)</p>
              </div>
            )}
          </div>

          {/* Test vue dashboard */}
          <div className="space-y-2">
            <h3 className="font-semibold">
              📊 communiques_presse_dashboard (vue admin)
            </h3>
            <p className="text-xs text-muted-foreground">
              Vue admin uniquement
            </p>
            {dashboardError ? (
              <div className="text-destructive text-sm">
                <p>❌ {dashboardError.message}</p>
              </div>
            ) : (
              <div className="text-green-600 text-sm">
                <p>✅ {dashboardData?.length ?? 0} ligne(s)</p>
              </div>
            )}
          </div>

          {/* Test vue analytics */}
          <div className="space-y-2">
            <h3 className="font-semibold">📈 analytics_summary (vue admin)</h3>
            <p className="text-xs text-muted-foreground">
              Vue analytics admin
            </p>
            {analyticsError ? (
              <div className="text-destructive text-sm">
                <p>❌ {analyticsError.message}</p>
              </div>
            ) : (
              <div className="text-green-600 text-sm">
                <p>✅ {analyticsData?.length ?? 0} ligne(s)</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section Configuration */}
      <section className="mt-6 p-6 bg-card rounded-lg border">
        <h2 className="text-2xl font-semibold mb-4">⚙️ Configuration</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-semibold text-muted-foreground">
              Supabase URL:
            </dt>
            <dd className="font-mono text-xs mt-1 break-all">
              {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 40)}...
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-muted-foreground">
              Clé utilisée:
            </dt>
            <dd className="font-mono text-xs mt-1">
              PUBLISHABLE_OR_ANON_KEY
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-muted-foreground">Mode:</dt>
            <dd className="mt-1">Server Component (admin layout)</dd>
          </div>
          <div>
            <dt className="font-semibold text-muted-foreground">
              Protection:
            </dt>
            <dd className="mt-1">Layout (admin) + getClaims()</dd>
          </div>
        </dl>
      </section>

      {/* Section Aide au diagnostic */}
      {(dashboardError || analyticsError || isAdminResult === false) && (
        <section className="mt-6 p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-amber-900 dark:text-amber-100">
            ⚠️ Problèmes détectés
          </h2>
          <div className="space-y-4 text-sm">
            {isAdminResult === false && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded border border-amber-300 dark:border-amber-700">
                <h3 className="font-semibold mb-2 text-amber-900 dark:text-amber-100">
                  ❌ is_admin() retourne FALSE
                </h3>
                <p className="text-muted-foreground mb-3">
                  L&apos;utilisateur n&apos;a pas le rôle admin dans la table profiles.
                </p>
                <div className="bg-muted p-3 rounded font-mono text-xs overflow-x-auto">
                  <p className="text-muted-foreground mb-1">
                    Exécutez dans l&apos;éditeur SQL Supabase:
                  </p>
                  <code className="text-amber-600 dark:text-amber-400">
                    UPDATE profiles<br />
                    SET role = &apos;admin&apos;<br />
                    WHERE user_id = &apos;{user?.id}&apos;;
                  </code>
                </div>
              </div>
            )}

            {(dashboardError || analyticsError) && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded border border-amber-300 dark:border-amber-700">
                <h3 className="font-semibold mb-2 text-amber-900 dark:text-amber-100">
                  ❌ Accès aux vues admin bloqué
                </h3>
                <p className="text-muted-foreground mb-3">
                  Les vues admin utilisent le service_role (pas authenticated) pour la sécurité.
                  Cette erreur est NORMALE si le DAL n&apos;utilise pas createAdminClient().
                </p>
                <div className="bg-muted p-3 rounded text-xs mb-3">
                  <p className="font-semibold mb-2">Pattern correct (TASK037):</p>
                  <code className="block text-amber-600 dark:text-amber-400">
                    {`// ❌ INCORRECT
                  const supabase = await createClient();
                  await supabase.from('vue_admin').select();
                  
                  // ✅ CORRECT
                  const adminClient = await createAdminClient();
                  await adminClient.from('vue_admin').select();`}
                  </code>
                </div>
                <p className="text-muted-foreground mb-3">
                  Vérifications complémentaires :
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>L&apos;utilisateur a le rôle &apos;admin&apos; dans profiles</li>
                  <li>La fonction is_admin() est correctement définie</li>
                  <li>Les vues ont SECURITY INVOKER (pas DEFINER)</li>
                  <li>Les vues ont REVOKE ALL sur anon/authenticated</li>
                  <li>Les vues ont GRANT SELECT sur service_role uniquement</li>
                </ul>
                {dashboardError && (
                  <div className="mt-3 p-2 bg-destructive/10 rounded text-xs">
                    <p className="font-semibold">communiques_presse_dashboard:</p>
                    <p className="text-destructive">{dashboardError.message}</p>
                  </div>
                )}
                {analyticsError && (
                  <div className="mt-3 p-2 bg-destructive/10 rounded text-xs">
                    <p className="font-semibold">analytics_summary:</p>
                    <p className="text-destructive">{analyticsError.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

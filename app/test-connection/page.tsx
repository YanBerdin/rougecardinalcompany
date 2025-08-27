"use client"

//! ---------------- Warning -----------------//
//TODO: Delete before production 
import { useState, useEffect } from "react"
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
// import { cn } from "@/lib/utils"
import { SupabaseClient } from '@supabase/supabase-js'
import { CheckCircle2, XCircle, RefreshCw, Database } from "lucide-react"

// Types pour les données de test
interface Spectacle {
  id: string
  titre: string
  description: string
  date_creation: string
  statut: string
  duree: number
  categorie: string
}

interface Membre {
  id: string
  nom: string
  prenom: string
  role: string
  biographie: string
  photo_url: string
}

interface Actualite {
  id: string
  titre: string
  contenu: string
  date_publication: string
  categorie: string
  image_url: string
}

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState<"loading" | "success" | "error" | "tables-missing">("loading")
  const [spectacles, setSpectacles] = useState<Spectacle[]>([])
  const [membres, setMembres] = useState<Membre[]>([])
  const [actualites, setActualites] = useState<Actualite[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  // Fonction utilitaire pour tester la connexion de plusieurs façons
  const checkSupabaseConnection = async (client: SupabaseClient) => {
    try {
      // Méthode 1: Utiliser la fonction RPC personnalisée
      const { error: rpcError } = await client.rpc('get_current_timestamp')
      
      if (!rpcError) {
        return { connected: true }
      }
      
      // Méthode 2: Si la RPC échoue, essayer avec health check
      const { error: healthError } = await client.from('pg_stat_statements').select('query').limit(1)
      
      if (!healthError || (healthError && healthError.message.includes("permission denied"))) {
        // Si nous obtenons une erreur de permission, cela signifie que la connexion fonctionne
        // mais l'utilisateur n'a pas accès à cette table (ce qui est normal)
        return { connected: true }
      }
      
      // Méthode 3: Dernière tentative avec le système d'authentification
      const { error: authError } = await client.auth.getSession()
      
      if (!authError) {
        return { connected: true }
      }
      
      // Si toutes les méthodes échouent, retourner l'erreur la plus pertinente
      return { 
        connected: false, 
        error: rpcError?.message || healthError?.message || authError?.message 
      }
    } catch (error) {
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : "Erreur inconnue" 
      }
    }
  }

  // Fonction pour récupérer les spectacles
  const getSpectacles = async () => {
    const { data, error } = await supabase
      .from('spectacles')
      .select('*')
      .order('date_creation', { ascending: false })
      .limit(6)

    if (error) throw error
    return data || []
  }

  // Fonction pour récupérer les membres
  const getMembres = async () => {
    const { data, error } = await supabase
      .from('membres_equipe')
      .select('*')
      .order('nom')
      .limit(6)

    if (error) throw error
    return data || []
  }

  // Fonction pour récupérer les actualités
  const getActualites = async () => {
    const { data, error } = await supabase
      .from('actualites')
      .select('*')
      .order('date_publication', { ascending: false })
      .limit(6)

    if (error) throw error
    return data || []
  }

  const testConnection = async () => {
    setIsLoading(true)
    setConnectionStatus("loading")
    setErrorMessage("")

    try {
      // Test de connexion fiable
      const connectionTest = await checkSupabaseConnection(supabase)
      
      if (!connectionTest.connected) {
        throw new Error(connectionTest.error || "Impossible de se connecter à Supabase")
      }

      // Test spécifique pour vérifier si les tables du projet existent
      try {
        // Vérification de l'existence de la table spectacles
        const { error: tableError } = await supabase.from("spectacles").select("count")

        if (tableError) {
          // Si l'erreur contient "relation does not exist", les tables n'ont pas été créées
          if (tableError.message && tableError.message.includes("relation") && tableError.message.includes("does not exist")) {
            setConnectionStatus("tables-missing")
            setErrorMessage("Les tables nécessaires n'ont pas été créées dans la base de données Supabase.")
            setIsLoading(false)
            return
          } else {
            throw tableError
          }
        }

        // Si la connexion fonctionne et que les tables existent, récupérer les données
        const [spectaclesData, membresData, actualitesData] = await Promise.all([
          getSpectacles(), 
          getMembres(), 
          getActualites()
        ])

        setSpectacles(spectaclesData)
        setMembres(membresData)
        setActualites(actualitesData)
        setConnectionStatus("success")
      } catch (tableError) {
        // Vérifier si l'erreur est liée à l'absence de tables
        if (
          typeof tableError === "object" &&
          tableError !== null &&
          "message" in tableError &&
          typeof (tableError as any).message === "string" &&
          (tableError as any).message.includes("relation") &&
          (tableError as any).message.includes("does not exist")
        ) {
          setConnectionStatus("tables-missing")
          setErrorMessage("Les tables nécessaires n'ont pas été créées dans la base de données Supabase.")
        } else {
          setConnectionStatus("error")
          setErrorMessage(
            (tableError instanceof Error ? tableError.message : "Une erreur est survenue lors de l'accès aux tables")
          )
        }
      }
    } catch (error) {
      console.error("Erreur de connexion:", error)
      setConnectionStatus("error")
      setErrorMessage(
        error instanceof Error ? error.message : "Une erreur est survenue lors de la connexion à Supabase"
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <main className="py-12 px-4 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold">Test de connexion Supabase</h1>
          <Button onClick={testConnection} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Test en cours...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Tester à nouveau
              </>
            )}
          </Button>
        </div>

        {connectionStatus === "loading" && (
          <Alert className="mb-8">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertTitle>Test de connexion en cours</AlertTitle>
            <AlertDescription>Veuillez patienter pendant que nous testons la connexion à Supabase...</AlertDescription>
          </Alert>
        )}

        {connectionStatus === "success" && (
          <Alert className="mb-8 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600">Connexion réussie</AlertTitle>
            <AlertDescription>
              La connexion à Supabase fonctionne correctement. Les données ont été récupérées avec succès.
            </AlertDescription>
          </Alert>
        )}

        {connectionStatus === "tables-missing" && (
          <Alert className="mb-8 bg-amber-50 border-amber-200">
            <Database className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-600">Tables manquantes</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>
                La connexion à Supabase fonctionne, mais les tables nécessaires n&apos;ont pas été créées. Vous devez
                exécuter le script SQL pour créer les tables et insérer les données initiales.
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Connectez-vous à votre{" "}
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    tableau de bord Supabase
                  </a>
                </li>
                <li>Sélectionnez votre projet</li>
                <li>Allez dans la section &quot;SQL Editor&quot; dans le menu de gauche</li>
                <li>Créez une nouvelle requête en cliquant sur &quot;New query&quot;</li>
                <li>Copiez et collez le script SQL fourni dans le README du projet</li>
                <li>Exécutez le script en cliquant sur &quot;Run&quot;</li>
                <li>Revenez à cette page et cliquez sur &quot;Tester à nouveau&quot;</li>
              </ol>
              <div className="bg-muted p-4 rounded-md mt-4">
                <p className="font-medium mb-2">Besoin du script SQL ?</p>
                <p>
                  Si vous n&apos;avez pas le script SQL, consultez le dossier /lib/supabase/schemas/ du projet ou 
                  demandez à le recevoir à nouveau.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {connectionStatus === "error" && (
          <Alert className="mb-8 bg-amber-400 border-red-200">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="font-medium text-red-600">Erreur de connexion</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>
                {errorMessage ||
                  "Une erreur est survenue lors de la connexion à Supabase. Veuillez vérifier vos identifiants."}
              </p>
              <div className="bg-muted p-4 rounded-md mt-4">
                <p className="font-medium mb-2">Vérifiez les points suivants :</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Les variables d&apos;environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY sont
                    correctement configurées
                  </li>
                  <li>Votre projet Supabase est actif et accessible</li>
                  <li>Vous n&apos;avez pas de restrictions réseau qui bloquent les connexions à Supabase</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {connectionStatus === "success" && (
          <Tabs defaultValue="spectacles">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="spectacles">Spectacles ({spectacles.length})</TabsTrigger>
              <TabsTrigger value="membres">Membres ({membres.length})</TabsTrigger>
              <TabsTrigger value="actualites">Actualités ({actualites.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="spectacles">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spectacles.map((spectacle) => (
                  <Card key={spectacle.id}>
                    <CardHeader>
                      <CardTitle>{spectacle.titre}</CardTitle>
                      <CardDescription>{spectacle.categorie}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Statut:</span> {spectacle.statut}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {
                            new Date(spectacle.date_creation).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          }
                        </div>
                        <div>
                          <span className="font-medium">Durée:</span> {spectacle.duree} min
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{spectacle.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="membres">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {membres.map((membre) => (
                  <Card key={membre.id}>
                    <CardHeader>
                      <CardTitle>{membre.prenom} {membre.nom}</CardTitle>
                      <CardDescription>{membre.role}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {membre.photo_url && (
                          <div className="mb-3">
                            <img 
                              src={membre.photo_url} 
                              alt={`${membre.prenom} ${membre.nom}`} 
                              className="w-full h-40 object-cover rounded-md"
                            />
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">{membre.biographie}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="actualites">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {actualites.map((actualite) => (
                  <Card key={actualite.id}>
                    <CardHeader>
                      <CardTitle>{actualite.titre}</CardTitle>
                      <CardDescription>
                        {new Date(actualite.date_publication).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
                          {actualite.categorie}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{actualite.contenu.substring(0, 150)}...</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {connectionStatus === "success" && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Informations de connexion</CardTitle>
                <CardDescription>Détails sur la connexion à Supabase</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">URL Supabase:</span>{" "}
                    <code className="bg-muted px-1 py-0.5 rounded text-sm">
                      {process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, "").split(".")[0]}...
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">Clé anonyme:</span>{" "}
                    <code className="bg-muted px-1 py-0.5 rounded text-sm">
                      {process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY?.substring(0, 5)}...
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">Spectacles récupérés:</span> {spectacles.length}
                  </div>
                  <div>
                    <span className="font-medium">Membres récupérés:</span> {membres.length}
                  </div>
                  <div>
                    <span className="font-medium">Actualités récupérées:</span> {actualites.length}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}

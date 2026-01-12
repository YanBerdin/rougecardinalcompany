# Supabase Cloud avec CLI Supabase

Voici les étapes typiques pour utiliser Supabase Cloud avec la CLI Supabase :

## 1. Connexion à Supabase Cloud

```bash
pnpm dlx supabase login
# Saisis ton token personnel (généré sur https://supabase.com/dashboard/account/tokens)
```

> [!NOTE]
> Cette commande connecte la CLI à ton compte Supabase Cloud. Le token est stocké localement.

```bash
pnpm dlx supabase@latest --version
Segmentation faultrougecardinalcompany$ supabase --version
2.48.3
rougecardinalcompany$ supabase login
Hello from Supabase! Press Enter to open browser and login automatically.

Here is your login link in case browser did not open <https://supabase.com/dashboard/cli/login?session_id=XXXXXXXXXXXXXXXXXXXXX&token_name=cli_XXXXXXXXX&public_key=XXXXXXXXXXXXXXXXXXXXXXXXXXXXX>

exec: "wslview": executable file not found in $PATH
Enter your verification code: XXXXXXXX

Token cli_XXXXXXXXX created successfully.

You are now logged in. Happy coding!
```

## 2. Lier le projet local au projet Cloud

```bash
supabase link --project-ref <project_id>
# <project_id> est l’identifiant de ton projet (ex : ....mbkyukyukofk....)

rougecardinalcompany$ supabase link --project-ref ....mbkyukyukofk....
Initialising login role...
Connecting to remote database...
Finished supabase link.
```

> [!NOTE]
> Cela permet à la CLI de cibler le projet cloud pour toutes les opérations suivantes (migrations, types, secrets…).

## 3. Appliquer les **Migrations** sur le Cloud

```bash
# avec pnpm dlx (utilisé pour Rouge Cardinal Company):
pnpm dlx supabase db push --linked
pnpm dlx supabase db push --linked --dry-run

# Ou directement avec supabase :
supabase db push --linked
# Ou avec simulation :
supabase db push --linked --dry-run
```

- Applique toutes les migrations locales (`supabase/migrations/`) sur la base cloud liée.
- Utilise `--dry-run` pour simuler sans appliquer.

> [!TIP]
> Pour vérifier l’état des migrations :

 ```bash
 pnpm dlx supabase migration list --linked
```

## 4. Synchroniser le Schéma (Cloud → Local)

```bash
pnpm dlx supabase db pull --linked
```

- Récupère le schéma du cloud et crée un fichier de migration locale.
- Utile pour synchroniser si des modifications ont été faites via le dashboard.

## 5. Générer les Types TypeScript à partir du Cloud

```bash
pnpm dlx supabase gen types typescript --linked > types/supabase.ts
```

- Génère les types à jour pour l’autocomplétion et la sécurité de type.

## 6. Gérer les Secrets pour les Edge Functions

```bash
pnpm dlx supabase secrets set NOM=VALEUR --project-ref <project_id>
pnpm dlx supabase secrets list --project-ref <project_id>
```

- Permet de stocker des variables d’environnement sécurisées côté cloud.

## 7. Déployer une Edge Function

```bash
pnpm dlx supabase functions deploy <nom> --project-ref <project_id>
```

- Déploie la fonction sur le cloud, accessible via l’API Supabase.

## 8. Vérifier l’État du Projet Cloud

```bash
pnpm dlx supabase status --linked
```

- Affiche les URLs, clés, et l’état du projet cloud lié.

## 9. Gestion Avancée

- **Lister les projets** :  
  `pnpm dlx supabase projects list`
- **Lister les branches cloud** :  
  `pnpm dlx supabase branches list --project-ref <project_id>`
- **Lister les migrations** :  
  `pnpm dlx supabase migration list --linked`
- **Réparer l’historique des migrations** :  
  `pnpm dlx supabase migration repair <version> --status applied --linked`

## 10. Bonnes pratiques

- Toujours lier le projet avant toute opération cloud.
- Utiliser `--dry-run` pour simuler les migrations.
- Synchroniser régulièrement le schéma local et cloud.
- Protéger les secrets et ne jamais les commiter.
- Utiliser la génération de types pour éviter les erreurs de typage.

## 11. Dépannage

- Si une migration échoue, vérifier l’historique avec `migration list` et réparer si besoin.
- Pour resynchroniser complètement :  
  1. Supprimer les migrations locales en conflit  
  2. `supabase db pull --linked`  
  3. Rejouer les migrations propres

## 12. Ressources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Cloud Dashboard](https://app.supabase.com/)
- [Supabase GitHub Repository](https://github.com/supabase/cli)
- [Supabase Community](https://supabase.com/community)

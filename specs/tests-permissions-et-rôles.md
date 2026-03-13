
# Tests permissions et rôles

1. Tests auth/helpers

- `getCurrentUserRole()`
- `hasMinRole(role)`
- `requireMinRole(role)`
- `isRoleAtLeast(currentRole, minimumRole)`
- fallback app_metadata / user_metadata / profile si applicable

2. Tests intégration DAL

- editor peut créer/modifier/supprimer spectacle
- editor peut gérer presse
- editor peut gérer media
- editor ne peut pas accéder users / analytics / audit / site-config

3. Tests RLS SQL / scripts

- anon : accès public uniquement
- authenticated user : pas d’accès éditorial
- editor : accès éditorial seulement
- admin : accès complet

4. E2E

- onboarding editor
- redirection vers backoffice autorisé
- sidebar filtrée
- blocage propre sur pages admin-only

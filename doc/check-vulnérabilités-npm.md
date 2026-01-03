# 🔐 Sécurité : Vérification des vulnérabilités

## Procédure de vérification

```bash
# 1. Vérifier les vulnérabilités des dépendances npm
pnpm audit

# 2. Si des vulnérabilités sont trouvées, mettre à jour les packages
pnpm update <package-name>@<version-corrigée>

# 3. Vérifier que les vulnérabilités sont corrigées
pnpm audit
# Attendu : "No known vulnerabilities found"
```

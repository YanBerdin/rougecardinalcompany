# Plan : Dépréciation des API Routes Admin → Server Actions

**TL;DR** : Migration progressive des API Routes admin vers Server Actions + appels DAL directs en Server Components. Les API Routes sont conservées pour les clients externes mais marquées `@deprecated` pour le frontend Next.js.

---

## 📊 Tableau récapitulatif (Décembre 2025)

| API Route | Méthode | Statut | Référence |
|-----------|---------|--------|-----------|
| `/api/admin/invite-user` | POST | ✅ Déjà `@deprecated` | `app/(admin)/admin/users/invite/actions.ts` |
| `/api/admin/home/hero` | GET | ✅ `@deprecated` | DAL `fetchAllHeroSlides` |
| `/api/admin/home/hero` | POST | ✅ `@deprecated` | `createHeroSlideAction` |
| `/api/admin/home/hero/[id]` | GET | ✅ `@deprecated` | DAL `fetchHeroSlideById` |
| `/api/admin/home/hero/[id]` | PATCH | ✅ `@deprecated` | `updateHeroSlideAction` |
| `/api/admin/home/hero/[id]` | DELETE | ✅ `@deprecated` | `deleteHeroSlideAction` |
| `/api/admin/home/hero/reorder` | POST | ✅ `@deprecated` | `reorderHeroSlidesAction` |
| `/api/admin/spectacles` | GET | ✅ `@deprecated` | DAL `fetchAllSpectacles` |
| `/api/admin/spectacles` | POST | ✅ `@deprecated` | `createSpectacleAction` |
| `/api/admin/spectacles/[id]` | GET | ✅ `@deprecated` | DAL `fetchSpectacleById` |
| `/api/admin/spectacles/[id]` | PATCH | ✅ `@deprecated` | `updateSpectacleAction` |
| `/api/admin/spectacles/[id]` | DELETE | ✅ `@deprecated` | `deleteSpectacleAction` |
| `/api/admin/media/search` | GET | ✅ Intentionally kept | Recherche interactive client |

---

## 🎯 Prochaines étapes

### Phase 1 : Suppression Hero Slides API Routes ⏳

Les Server Actions sont déjà utilisées par `HeroSlidesView.tsx` (confirmé par analyse).

**Avant suppression, vérifier qu'aucun `fetch()` ne cible ces routes :**

```bash
# Rechercher les usages dans le code
grep -r "api/admin/home/hero" components/ app/
grep -r "/api/admin/home/hero" --include="*.ts" --include="*.tsx" .
```

**Fichiers à supprimer (après validation) :**
- `app/api/admin/home/hero/route.ts`
- `app/api/admin/home/hero/[id]/route.ts`
- `app/api/admin/home/hero/reorder/route.ts`

### Phase 2 : Suppression Spectacles API Routes ⏳

Vérifier que `SpectaclesManagementContainer.tsx` utilise les Server Actions :

```bash
grep -r "api/admin/spectacles" components/ app/
```

**Fichiers à supprimer (après validation) :**
- `app/api/admin/spectacles/route.ts`
- `app/api/admin/spectacles/[id]/route.ts`

### Phase 3 : Media Search — Conserver ✅

Cette route reste volontairement en place car :
- Recherche interactive avec debounce côté client
- Pagination via query params (`?q=&page=&limit=`)
- Pattern plus adapté à une API Route qu'un Server Action

---

## 📝 Modèles d'annotation

### Pour mutations (POST/PATCH/DELETE) :
```typescript
/**
 * @deprecated Prefer using [actionName]Action from
 * app/(admin)/admin/[feature]/actions.ts for frontend mutations.
 * This API Route is kept for external clients and backward compatibility.
 */
```

### Pour lectures (GET) dans pages admin :
```typescript
/**
 * @deprecated For admin UI, prefer Server Component with direct DAL call:
 * import { fetchEntity } from "@/lib/dal/entity";
 * const data = await fetchEntity();
 *
 * This API Route is kept for external clients and backward compatibility.
 */
```

### Pour routes intentionnellement conservées :
```typescript
/**
 * NOTE: This API Route is intentionally kept (not migrated to Server Action)
 * because [reason: interactive search, webhook, external API, etc.].
 */
```

---

## 📚 Références

- Pattern CRUD Server Actions : `.github/instructions/crud-server-actions-pattern.instructions.md`
- Migration Team : `.github/prompts/plan-teamMemberFormMigration.prompt.md`
- DAL SOLID Refactoring : `.github/prompts/plan.dalSolidRefactoring.prompt.md`

---

## 📅 Historique

| Date | Action |
|------|--------|
| 2025-12-04 | Annotation `@deprecated` ajoutée aux 9 méthodes Hero/Spectacles + note Media Search |
| 2025-12-02 | Suppression API Routes Team (migration complète) |
| 2025-11-27 | Annotation Spectacles POST/PATCH/DELETE |
| 2025-11-22 | Annotation invite-user |

---

**Auteur** : Généré par GitHub Copilot  
**Version** : 1.0

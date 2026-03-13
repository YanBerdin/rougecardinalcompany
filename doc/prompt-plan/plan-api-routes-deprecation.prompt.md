# Plan : Dépréciation des API Routes Admin → Server Actions

**TL;DR** : Migration progressive des API Routes admin vers Server Actions + appels DAL directs en Server Components. Les API Routes sont conservées pour les clients externes mais marquées `@deprecated` pour le frontend Next.js.

**Statut : ✅ TERMINÉ** (4 décembre 2025)

---

## 📊 Tableau récapitulatif (Décembre 2025)

| API Route | Méthode | Statut | Référence |
|-----------|---------|--------|-----------|
| `/api/admin/invite-user` | POST | 🗑️ **SUPPRIMÉ** | `app/(admin)/admin/users/actions.ts` |
| `/api/admin/home/hero` | GET | 🗑️ **SUPPRIMÉ** | DAL `fetchAllHeroSlides` |
| `/api/admin/home/hero` | POST | 🗑️ **SUPPRIMÉ** | `createHeroSlideAction` |
| `/api/admin/home/hero/[id]` | GET | 🗑️ **SUPPRIMÉ** | DAL `fetchHeroSlideById` |
| `/api/admin/home/hero/[id]` | PATCH | 🗑️ **SUPPRIMÉ** | `updateHeroSlideAction` |
| `/api/admin/home/hero/[id]` | DELETE | 🗑️ **SUPPRIMÉ** | `deleteHeroSlideAction` |
| `/api/admin/home/hero/reorder` | POST | 🗑️ **SUPPRIMÉ** | `reorderHeroSlidesAction` |
| `/api/admin/spectacles` | GET | 🗑️ **SUPPRIMÉ** | DAL `fetchAllSpectacles` |
| `/api/admin/spectacles` | POST | 🗑️ **SUPPRIMÉ** | `createSpectacleAction` |
| `/api/admin/spectacles/[id]` | GET | 🗑️ **SUPPRIMÉ** | DAL `fetchSpectacleById` |
| `/api/admin/spectacles/[id]` | PATCH | 🗑️ **SUPPRIMÉ** | `updateSpectacleAction` |
| `/api/admin/spectacles/[id]` | DELETE | 🗑️ **SUPPRIMÉ** | `deleteSpectacleAction` |
| `/api/admin/media/search` | GET | ✅ **Conservé** | Recherche interactive client |

---

## ✅ Résultat final

```
app/api/admin/
└── media/
    └── search/
        └── route.ts  ← Seule route restante (intentionnellement conservée)
```

**11 routes supprimées, 1 route conservée.**

---

## 📝 Modèles d'annotation

### Pour mutations (POST/PATCH/DELETE)

```typescript
/**
 * @deprecated Prefer using [actionName]Action from
 * app/(admin)/admin/[feature]/actions.ts for frontend mutations.
 * This API Route is kept for external clients and backward compatibility.
 */
```

### Pour lectures (GET) dans pages admin

```typescript
/**
 * @deprecated For admin UI, prefer Server Component with direct DAL call:
 * import { fetchEntity } from "@/lib/dal/entity";
 * const data = await fetchEntity();
 *
 * This API Route is kept for external clients and backward compatibility.
 */
```

### Pour routes intentionnellement conservées

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
| 2025-12-04 | ✅ **PLAN TERMINÉ** — Suppression routes hero, spectacles, invite-user + consolidation actions |
| 2025-12-04 | Annotation `@deprecated` ajoutée aux 9 méthodes Hero/Spectacles + note Media Search |
| 2025-12-02 | Suppression API Routes Team (migration complète) |
| 2025-11-27 | Annotation Spectacles POST/PATCH/DELETE |
| 2025-11-22 | Annotation invite-user |

---

**Auteur** : Généré par GitHub Copilot  
**Version** : 2.0 (Terminé)

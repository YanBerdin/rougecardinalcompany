# Plan TASK033 - Audit Logs Viewer Interface

**Status:** ✅ COMPLETED (2026-01-03)  
**Complexity:** Medium  
**Duration:** ~6 hours (implementation + cloud deployment + fixes)  
**Created:** 2026-01-03  
**Completed:** 2026-01-03

---

## 📋 Overview

Créer une interface admin complète pour consulter, filtrer et exporter les logs d'audit système. La table `logs_audit` existe déjà avec 14 triggers actifs sur les tables critiques.

**Implementation Notes:**
- All 6 phases completed successfully
- Migration deployed to cloud and verified
- CSV export fixed with pagination (respects 100-row limit per request)
- Responsive UI with skeleton loader implemented
- Filter synchronization via URL searchParams working

---

## 🎯 Objectives

1. ✅ **Rétention automatique** : Purge logs > 90 jours (expires_at column + cleanup function)
2. ✅ **Résolution email** : Joindre `auth.users` pour afficher l'email utilisateur (RPC function)
3. ✅ **Filtres avancés** : Action, table, user, date range, search (via URL params)
4. ✅ **Export CSV** : Exporter jusqu'à 10,000 logs filtrés (pagination automatique)
5. ✅ **UI responsive** : Table avec tri, pagination, modal détails JSON, skeleton loader

---

## 🏗️ Architecture

```bash
Admin Page (Server Component)
  ├── Receives searchParams from URL
  ├── AuditLogsContainer (Smart)
  │   ├── Parses searchParams → AuditLogFilter
  │   ├── fetchAuditLogs(filters) [DAL]
  │   └── Error Handling
  └── AuditLogsView (Client)
      ├── Syncs initialFilters with URL
      ├── AuditLogFilters (updates URL on change)
      ├── AuditLogsTable (with skeleton loader)
      ├── AuditLogDetailModal
      └── CSV Export (paginated fetching)

Database Layer
  ├── RPC: get_audit_logs_with_email()
  ├── Function: cleanup_expired_audit_logs()
  └── Column: expires_at (auto-set via default)
```

**Key Implementation Details:**
- URL-based filter state (searchParams) for SSR compatibility
- Skeleton loader with 800ms initial delay + 500ms on refresh
- CSV export uses batched requests (100 rows/page) to respect Zod validation
- Responsive: overflow-x-auto on table, adaptive padding, mobile-optimized buttons

---

## 📦 Phase 0: Prérequis

**Status:** ✅ COMPLETED

### Dépendances à installer

```bash
pnpm add csv-stringify react18-json-view
pnpm dlx shadcn@latest add calendar pagination popover
```

**Notes:**
- All dependencies installed successfully
- Pre-existing calendar CSS syntax error fixed (`--spacing(8)` → `2rem`)
- Popover added to dependencies list (required for DateRangePicker)

### Composants UI à créer

**Fichier:** `components/ui/date-range-picker.tsx`  
**Status:** ✅ CREATED

```typescript
"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
  from?: Date;
  to?: Date;
  onSelect: (range: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePicker({ from, to, onSelect, className }: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {from ? (
              to ? (
                <>
                  {format(from, "dd MMM yyyy", { locale: fr })} -{" "}
                  {format(to, "dd MMM yyyy", { locale: fr })}
                </>
              ) : (
                format(from, "dd MMM yyyy", { locale: fr })
              )
            ) : (
              <span>Sélectionner une période</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={from}
            selected={{ from, to }}
            onSelect={onSelect}
            numberOfMonths={2}
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

---

## 📝 Implementation Steps

### **Step 1: Database Schema - Retention Policy**

**File:** `supabase/schemas/20_audit_logs_retention.sql`

```sql
-- Schema: Add retention policy to logs_audit
-- Purpose: Auto-expire logs after 90 days for compliance and performance

-- 1. Add retention column with default 90 days expiration
alter table public.logs_audit 
add column if not exists expires_at timestamptz 
default (now() + interval '90 days');

-- 2. Backfill existing logs (set expiration based on creation date)
update public.logs_audit 
set expires_at = created_at + interval '90 days' 
where expires_at is null;

-- 3. Create index for efficient cleanup queries
create index if not exists idx_audit_logs_expires_at 
on public.logs_audit (expires_at) 
where expires_at is not null;

-- 4. Cleanup function (SECURITY DEFINER for elevated permissions)
/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Function needs to delete rows regardless of RLS policies
 *   2. Called by scheduled jobs (no user context)
 *   3. Only deletes expired logs based on expires_at column
 * 
 * Risks Evaluated:
 *   - Authorization: Function only deletes expired rows (date-based)
 *   - Input validation: No user input - uses system date
 *   - Privilege escalation: Limited to DELETE on logs_audit only
 */
create or replace function public.cleanup_expired_audit_logs()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  delete from public.logs_audit
  where expires_at < now();
  
  get diagnostics deleted_count = row_count;
  
  return deleted_count;
end;
$$;

-- Grant execute to authenticated (for manual cleanup via admin UI)
grant execute on function public.cleanup_expired_audit_logs() to authenticated;

comment on function public.cleanup_expired_audit_logs() is 
'Purge audit logs older than 90 days. Returns count of deleted rows. SECURITY DEFINER: bypasses RLS for cleanup.';
```

**Génération de la migration :**

```bash
# 1. Arrêter la base locale
pnpm dlx supabase stop

# 2. Générer migration automatique
pnpm dlx supabase db diff -f audit_logs_retention

# 3. Redémarrer et appliquer
pnpm dlx supabase start
```

**Cleanup Strategy (GitHub Actions):**

```yaml
# .github/workflows/cleanup-audit-logs.yml
name: Cleanup Audit Logs
on:
  schedule:
    - cron: '0 3 * * *' # Daily at 3 AM UTC
  workflow_dispatch:

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Run cleanup
        run: |
          curl -X POST "${{ secrets.SUPABASE_URL }}/rest/v1/rpc/cleanup_expired_audit_logs" \
            -H "apikey: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json"
```

---

### **Step 2: Zod Schemas**

**File:** `lib/schemas/audit-logs.ts`

```typescript
import { z } from "zod";

// Action enum
export const AuditActionEnum = z.enum(["INSERT", "UPDATE", "DELETE"]);
export type AuditAction = z.infer<typeof AuditActionEnum>;

// Base audit log schema (matches database)
export const AuditLogSchema = z.object({
  id: z.coerce.number().int().positive(), // PostgREST returns number, not bigint
  user_id: z.string().uuid().nullable(),
  action: AuditActionEnum,
  table_name: z.string().min(1),
  record_id: z.string().nullable(),
  old_values: z.record(z.unknown()).nullable(),
  new_values: z.record(z.unknown()).nullable(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  created_at: z.coerce.date(),
  expires_at: z.coerce.date().nullable(),
});

// DTO with resolved email (from auth.users join)
export const AuditLogDTOSchema = AuditLogSchema.extend({
  user_email: z.string().email().nullable(),
  total_count: z.coerce.number().optional(), // For pagination
});

// Filter schema for search/pagination
export const AuditLogFilterSchema = z.object({
  action: AuditActionEnum.optional(),
  table_name: z.string().optional(),
  user_id: z.string().uuid().optional(),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
  search: z.string().max(100).optional(), // Search in record_id or table_name only
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

// Export types
export type AuditLog = z.infer<typeof AuditLogSchema>;
export type AuditLogDTO = z.infer<typeof AuditLogDTOSchema>;
export type AuditLogFilter = z.infer<typeof AuditLogFilterSchema>;
```

---

### **Step 3: Database RPC Function**

**File:** `supabase/schemas/42_rpc_audit_logs.sql`

```sql
-- RPC function to fetch audit logs with user email
-- SECURITY DEFINER needed to access auth.users (system table)
/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Needs to join auth.users (system table not accessible via RLS)
 *   2. Returns user email for audit trail display
 *   3. Protected by is_admin() check at function start
 * 
 * Risks Evaluated:
 *   - Authorization: Explicit is_admin() check (defense-in-depth)
 *   - Input validation: All params have safe types, search uses ILIKE (no injection)
 *   - Privilege escalation: Only reads data, cannot modify
 */
create or replace function public.get_audit_logs_with_email(
  p_action text default null,
  p_table_name text default null,
  p_user_id uuid default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null,
  p_search text default null,
  p_page integer default 1,
  p_limit integer default 50
)
returns table (
  id bigint,
  user_id uuid,
  user_email text,
  action text,
  table_name text,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz,
  expires_at timestamptz,
  total_count bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_offset integer;
begin
  -- Authorization check (defense-in-depth)
  if not (select public.is_admin()) then
    raise exception 'Permission denied: admin role required';
  end if;

  v_offset := (p_page - 1) * p_limit;

  return query
  with filtered_logs as (
    select 
      al.id,
      al.user_id,
      au.email::text as user_email,
      al.action,
      al.table_name,
      al.record_id,
      al.old_values,
      al.new_values,
      al.ip_address,
      al.user_agent,
      al.created_at,
      al.expires_at
    from public.logs_audit al
    left join auth.users au on al.user_id = au.id
    where 
      (p_action is null or al.action = p_action)
      and (p_table_name is null or al.table_name = p_table_name)
      and (p_user_id is null or al.user_id = p_user_id)
      and (p_date_from is null or al.created_at >= p_date_from)
      and (p_date_to is null or al.created_at <= p_date_to)
      and (p_search is null or 
           al.record_id ilike '%' || p_search || '%' or 
           al.table_name ilike '%' || p_search || '%')
  ),
  total as (
    select count(*)::bigint as cnt from filtered_logs
  )
  select 
    fl.id,
    fl.user_id,
    fl.user_email,
    fl.action,
    fl.table_name,
    fl.record_id,
    fl.old_values,
    fl.new_values,
    fl.ip_address,
    fl.user_agent,
    fl.created_at,
    fl.expires_at,
    t.cnt as total_count
  from filtered_logs fl, total t
  order by fl.created_at desc
  limit p_limit
  offset v_offset;
end;
$$;

grant execute on function public.get_audit_logs_with_email to authenticated;

comment on function public.get_audit_logs_with_email is 
'Fetch audit logs with user email from auth.users. Admin-only via is_admin() check.';
```

---

### **Step 4: Data Access Layer (DAL)**

**File:** `lib/dal/audit-logs.ts`

```typescript
"use server";
import "server-only";

import { createClient } from "@/supabase/server";
import { 
  AuditLogDTOSchema, 
  AuditLogFilterSchema, 
  type AuditLogDTO, 
  type AuditLogFilter 
} from "@/lib/schemas/audit-logs";
import { type DALResult } from "@/lib/dal/helpers/error";
import { z } from "zod";

const AUDIT_ERROR_CODES = {
  FETCH_FAILED: "ERR_AUDIT_001",
  INVALID_FILTERS: "ERR_AUDIT_002",
  UNEXPECTED: "ERR_AUDIT_003",
  TABLE_NAMES_FAILED: "ERR_AUDIT_004",
} as const;

/**
 * Fetch audit logs with user email resolution and advanced filtering
 */
export async function fetchAuditLogs(
  filters: AuditLogFilter
): Promise<DALResult<{ logs: AuditLogDTO[]; totalCount: number }>> {
  try {
    const supabase = await createClient();
    const validatedFilters = AuditLogFilterSchema.parse(filters);

    const { data, error } = await supabase.rpc("get_audit_logs_with_email", {
      p_action: validatedFilters.action ?? null,
      p_table_name: validatedFilters.table_name ?? null,
      p_user_id: validatedFilters.user_id ?? null,
      p_date_from: validatedFilters.date_from?.toISOString() ?? null,
      p_date_to: validatedFilters.date_to?.toISOString() ?? null,
      p_search: validatedFilters.search ?? null,
      p_page: validatedFilters.page,
      p_limit: validatedFilters.limit,
    });

    if (error) {
      return {
        success: false,
        error: `[${AUDIT_ERROR_CODES.FETCH_FAILED}] ${error.message}`,
      };
    }

    if (!data || data.length === 0) {
      return { success: true, data: { logs: [], totalCount: 0 } };
    }

    const logs = z.array(AuditLogDTOSchema).parse(data);
    const totalCount = Number(data[0]?.total_count ?? 0);

    return { success: true, data: { logs, totalCount } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `[${AUDIT_ERROR_CODES.INVALID_FILTERS}] ${error.message}`,
      };
    }
    return {
      success: false,
      error: `[${AUDIT_ERROR_CODES.UNEXPECTED}] ${error instanceof Error ? error.message : "Unknown"}`,
    };
  }
}

/**
 * Get distinct table names from audit logs (for filter dropdown)
 */
export async function fetchAuditTableNames(): Promise<DALResult<string[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("logs_audit")
      .select("table_name")
      .order("table_name");

    if (error) {
      return {
        success: false,
        error: `[${AUDIT_ERROR_CODES.TABLE_NAMES_FAILED}] ${error.message}`,
      };
    }

    const uniqueTables = [...new Set(data?.map((row) => row.table_name) ?? [])];
    return { success: true, data: uniqueTables };
  } catch (error) {
    return {
      success: false,
      error: `[${AUDIT_ERROR_CODES.UNEXPECTED}] ${error instanceof Error ? error.message : "Unknown"}`,
    };
  }
}
```

---

### **Step 5: Server Actions**

**File:** `app/(admin)/admin/audit-logs/actions.ts`

```typescript
"use server";
import "server-only";

import { fetchAuditLogs } from "@/lib/dal/audit-logs";
import { AuditLogFilterSchema, type AuditLogFilter } from "@/lib/schemas/audit-logs";
import { stringify } from "csv-stringify/sync";

const MAX_EXPORT_ROWS = 10000;

export type ExportResult = 
  | { success: true; data: string }
  | { success: false; error: string };

/**
 * Export audit logs as CSV with current filters applied
 */
export async function exportAuditLogsCSV(
  filters: AuditLogFilter
): Promise<ExportResult> {
  try {
    const validatedFilters = AuditLogFilterSchema.parse(filters);

    const result = await fetchAuditLogs({
      ...validatedFilters,
      page: 1,
      limit: MAX_EXPORT_ROWS,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const csv = stringify(result.data.logs, {
      header: true,
      columns: [
        { key: "id", header: "ID" },
        { key: "created_at", header: "Date" },
        { key: "user_email", header: "Utilisateur" },
        { key: "action", header: "Action" },
        { key: "table_name", header: "Table" },
        { key: "record_id", header: "Record ID" },
        { key: "ip_address", header: "Adresse IP" },
      ],
    });

    return { success: true, data: csv };
  } catch (error) {
    return {
      success: false,
      error: `Export failed: ${error instanceof Error ? error.message : "Unknown"}`,
    };
  }
}
```

---

### **Step 6: Admin Page Structure**

**File:** `app/(admin)/admin/audit-logs/page.tsx`

```typescript
import { Suspense } from "react";
import { AuditLogsContainer } from "@/components/features/admin/audit-logs/AuditLogsContainer";
import { AuditLogsSkeleton } from "@/components/features/admin/audit-logs/AuditLogsSkeleton";

export const metadata = {
  title: "Audit Logs | Admin",
  description: "Consulter les logs d'audit système",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AuditLogsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
      </div>
      <Suspense fallback={<AuditLogsSkeleton />}>
        <AuditLogsContainer />
      </Suspense>
    </div>
  );
}
```

**File:** `app/(admin)/admin/audit-logs/loading.tsx`

```typescript
import { AuditLogsSkeleton } from "@/components/features/admin/audit-logs/AuditLogsSkeleton";

export default function Loading() {
  return <AuditLogsSkeleton />;
}
```

---

### **Step 7: UI Components**

#### **7.1 Component Structure**

```bash
components/features/admin/audit-logs/
├── AuditLogsContainer.tsx    # Smart Server Component
├── AuditLogsView.tsx         # Client Component (main view)
├── AuditLogFilters.tsx       # Filter controls
├── AuditLogsTable.tsx        # Data table with pagination
├── AuditLogDetailModal.tsx   # JSON detail viewer
├── AuditLogsSkeleton.tsx     # Loading skeleton
├── types.ts                  # Props interfaces
└── index.ts                  # Barrel exports
```

#### **7.2 Types**

**File:** `components/features/admin/audit-logs/types.ts`

```typescript
import type { AuditLogDTO, AuditLogFilter } from "@/lib/schemas/audit-logs";

export interface AuditLogsViewProps {
  initialLogs: AuditLogDTO[];
  initialTotalCount: number;
  tableNames: string[];
}

export interface AuditLogFiltersProps {
  filters: AuditLogFilter;
  tableNames: string[];
  onFilterChange: (filters: AuditLogFilter) => void;
  isLoading?: boolean;
}

export interface AuditLogsTableProps {
  logs: AuditLogDTO[];
  totalCount: number;
  filters: AuditLogFilter;
  onFilterChange: (filters: AuditLogFilter) => void;
  onRowClick: (log: AuditLogDTO) => void;
}

export interface AuditLogDetailModalProps {
  log: AuditLogDTO;
  open: boolean;
  onClose: () => void;
}
```

#### **7.3 Skeleton**

**File:** `components/features/admin/audit-logs/AuditLogsSkeleton.tsx`

```typescript
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AuditLogsSkeleton() {
  return (
    <Card className="p-6">
      <div className="mb-4 grid gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <Skeleton className="h-10 w-64" />
      </div>
    </Card>
  );
}
```

#### **7.4 Smart Container**

**File:** `components/features/admin/audit-logs/AuditLogsContainer.tsx`

```typescript
import { fetchAuditLogs, fetchAuditTableNames } from "@/lib/dal/audit-logs";
import { AuditLogsView } from "./AuditLogsView";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export async function AuditLogsContainer() {
  const [logsResult, tablesResult] = await Promise.all([
    fetchAuditLogs({ page: 1, limit: 50 }),
    fetchAuditTableNames(),
  ]);

  if (!logsResult.success) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{logsResult.error}</AlertDescription>
      </Alert>
    );
  }

  const tableNames = tablesResult.success ? tablesResult.data : [];

  return (
    <AuditLogsView
      initialLogs={logsResult.data.logs}
      initialTotalCount={logsResult.data.totalCount}
      tableNames={tableNames}
    />
  );
}
```

#### **7.5 Client View**

**File:** `components/features/admin/audit-logs/AuditLogsView.tsx`

```typescript
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AuditLogFilters } from "./AuditLogFilters";
import { AuditLogsTable } from "./AuditLogsTable";
import { AuditLogDetailModal } from "./AuditLogDetailModal";
import type { AuditLogsViewProps } from "./types";
import type { AuditLogDTO, AuditLogFilter } from "@/lib/schemas/audit-logs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { exportAuditLogsCSV } from "@/app/(admin)/admin/audit-logs/actions";

export function AuditLogsView({ 
  initialLogs, 
  initialTotalCount, 
  tableNames 
}: AuditLogsViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [logs, setLogs] = useState(initialLogs);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [filters, setFilters] = useState<AuditLogFilter>({ page: 1, limit: 50 });
  const [selectedLog, setSelectedLog] = useState<AuditLogDTO | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // ✅ CRITIQUE: Sync local state when props change (after router.refresh())
  useEffect(() => {
    setLogs(initialLogs);
    setTotalCount(initialTotalCount);
  }, [initialLogs, initialTotalCount]);

  const handleFilterChange = (newFilters: AuditLogFilter) => {
    setFilters(newFilters);
    startTransition(() => {
      router.refresh();
    });
  };

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportAuditLogsCSV(filters);
      if (result.success) {
        const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Export réussi");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AuditLogFilters
          filters={filters}
          tableNames={tableNames}
          onFilterChange={handleFilterChange}
          isLoading={isPending}
        />
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isPending}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            Rafraîchir
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport} 
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Export..." : "Export CSV"}
          </Button>
        </div>
      </div>

      <AuditLogsTable
        logs={logs}
        totalCount={totalCount}
        filters={filters}
        onFilterChange={handleFilterChange}
        onRowClick={setSelectedLog}
      />

      {selectedLog && (
        <AuditLogDetailModal
          log={selectedLog}
          open={!!selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </Card>
  );
}
```

#### **7.6 Filters Component**

**File:** `components/features/admin/audit-logs/AuditLogFilters.tsx`

```typescript
"use client";

import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { AuditLogFiltersProps } from "./types";
import { Search, X } from "lucide-react";

export function AuditLogFilters({ 
  filters, 
  tableNames, 
  onFilterChange,
  isLoading 
}: AuditLogFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search ?? "");

  const handleApplySearch = () => {
    onFilterChange({ 
      ...filters, 
      search: localSearch || undefined,
      page: 1 
    });
  };

  const handleReset = () => {
    setLocalSearch("");
    onFilterChange({ page: 1, limit: 50 });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {/* Action Filter */}
      <Select
        value={filters.action ?? "all"}
        onValueChange={(value) =>
          onFilterChange({
            ...filters,
            action: value === "all" ? undefined : value as "INSERT" | "UPDATE" | "DELETE",
            page: 1,
          })
        }
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les actions</SelectItem>
          <SelectItem value="INSERT">INSERT</SelectItem>
          <SelectItem value="UPDATE">UPDATE</SelectItem>
          <SelectItem value="DELETE">DELETE</SelectItem>
        </SelectContent>
      </Select>

      {/* Table Name Filter */}
      <Select
        value={filters.table_name ?? "all"}
        onValueChange={(value) =>
          onFilterChange({
            ...filters,
            table_name: value === "all" ? undefined : value,
            page: 1,
          })
        }
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Table" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les tables</SelectItem>
          {tableNames.map((table) => (
            <SelectItem key={table} value={table}>
              {table}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Range Filter */}
      <DateRangePicker
        from={filters.date_from}
        to={filters.date_to}
        onSelect={(range) =>
          onFilterChange({
            ...filters,
            date_from: range?.from,
            date_to: range?.to,
            page: 1,
          })
        }
      />

      {/* Search Input */}
      <div className="flex gap-2 lg:col-span-2">
        <Input
          placeholder="Rechercher (record_id, table)..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleApplySearch()}
          disabled={isLoading}
        />
        <Button 
          onClick={handleApplySearch} 
          size="icon" 
          disabled={isLoading}
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button 
          onClick={handleReset} 
          size="icon" 
          variant="ghost"
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

#### **7.7 Table Component**

**File:** `components/features/admin/audit-logs/AuditLogsTable.tsx`

```typescript
"use client";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import type { AuditLogsTableProps } from "./types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const ACTION_STYLES = {
  INSERT: "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20",
  UPDATE: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
  DELETE: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
} as const;

export function AuditLogsTable({ 
  logs, 
  totalCount, 
  filters, 
  onFilterChange, 
  onRowClick 
}: AuditLogsTableProps) {
  const totalPages = Math.ceil(totalCount / filters.limit);
  const currentPage = filters.page;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onFilterChange({ ...filters, page });
    }
  };

  if (logs.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        Aucun log trouvé avec ces critères
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Date</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Record ID</TableHead>
              <TableHead className="hidden lg:table-cell">IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow
                key={log.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onRowClick(log)}
              >
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(log.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </TableCell>
                <TableCell className="font-medium">
                  {log.user_email ?? <span className="text-muted-foreground">Système</span>}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={ACTION_STYLES[log.action]}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">{log.table_name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {log.record_id ?? "—"}
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {log.ip_address ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalCount} résultat{totalCount > 1 ? "s" : ""} • Page {currentPage}/{totalPages}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = currentPage <= 3 
                  ? i + 1 
                  : currentPage + i - 2;
                if (page > totalPages || page < 1) return null;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === currentPage}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}
```

#### **7.8 Detail Modal (COMPLET)**

**File:** `components/features/admin/audit-logs/AuditLogDetailModal.tsx`

```typescript
"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AuditLogDetailModalProps } from "./types";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function AuditLogDetailModal({ log, open, onClose }: AuditLogDetailModalProps) {
  const hasOldValues = log.old_values && Object.keys(log.old_values).length > 0;
  const hasNewValues = log.new_values && Object.keys(log.new_values).length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="outline">{log.action}</Badge>
            <span className="font-mono text-base">{log.table_name}</span>
            {log.record_id && (
              <span className="text-muted-foreground">#{log.record_id}</span>
            )}
          </DialogTitle>
          <DialogDescription>
            {format(new Date(log.created_at), "PPpp", { locale: fr })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 text-sm">
            <div>
              <span className="font-semibold text-muted-foreground">Utilisateur</span>
              <p className="mt-1">{log.user_email ?? "Système"}</p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Adresse IP</span>
              <p className="mt-1 font-mono">{log.ip_address ?? "—"}</p>
            </div>
            <div className="col-span-2">
              <span className="font-semibold text-muted-foreground">User Agent</span>
              <p className="mt-1 truncate text-xs">{log.user_agent ?? "—"}</p>
            </div>
          </div>

          {/* JSON Values Tabs */}
          {(hasOldValues || hasNewValues) && (
            <Tabs defaultValue={hasOldValues ? "old" : "new"} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="old" className="flex-1" disabled={!hasOldValues}>
                  Anciennes valeurs
                  {hasOldValues && (
                    <Badge variant="secondary" className="ml-2">
                      {Object.keys(log.old_values!).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="new" className="flex-1" disabled={!hasNewValues}>
                  Nouvelles valeurs
                  {hasNewValues && (
                    <Badge variant="secondary" className="ml-2">
                      {Object.keys(log.new_values!).length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="old" className="mt-4">
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  {hasOldValues ? (
                    <JsonView
                      src={log.old_values}
                      theme="vscode"
                      collapsed={2}
                      enableClipboard
                      displaySize
                    />
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Aucune donnée disponible
                    </p>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="new" className="mt-4">
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  {hasNewValues ? (
                    <JsonView
                      src={log.new_values}
                      theme="vscode"
                      collapsed={2}
                      enableClipboard
                      displaySize
                    />
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Aucune donnée disponible
                    </p>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}

          {/* No values message */}
          {!hasOldValues && !hasNewValues && (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              Aucune donnée JSON enregistrée pour cette opération
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### **7.9 Barrel Export**

**File:** `components/features/admin/audit-logs/index.ts`

```typescript
export { AuditLogsContainer } from "./AuditLogsContainer";
export { AuditLogsView } from "./AuditLogsView";
export { AuditLogFilters } from "./AuditLogFilters";
export { AuditLogsTable } from "./AuditLogsTable";
export { AuditLogDetailModal } from "./AuditLogDetailModal";
export { AuditLogsSkeleton } from "./AuditLogsSkeleton";
export type * from "./types";
```

---

### **Step 8: Sidebar Link**

**File:** `components/admin/app-sidebar.tsx` — Ajouter dans le groupe "Administration"

```typescript
// Dans les imports
import { ScrollText } from "lucide-react";

// Dans le groupe "Administration" (navAdmin)
{
  title: "Audit Logs",
  url: "/admin/audit-logs",
  icon: ScrollText,
}
```

---

## ✅ Implementation Checklist

### Phase 0 - Prérequis
- [ ] Installer `csv-stringify` et `react18-json-view`
- [ ] Installer composants shadcn `calendar` et `pagination`
- [ ] Créer `components/ui/date-range-picker.tsx`

### Phase 1 - Database
- [ ] Créer schéma déclaratif `supabase/schemas/20_audit_logs_retention.sql`
- [ ] Créer RPC `supabase/schemas/42_rpc_audit_logs.sql`
- [ ] Générer migration (`pnpm dlx supabase db diff -f audit_logs_retention`)
- [ ] Appliquer (`pnpm dlx supabase start`)

### Phase 2 - Backend
- [ ] Créer `lib/schemas/audit-logs.ts`
- [ ] Créer `lib/dal/audit-logs.ts`
- [ ] Créer `app/(admin)/admin/audit-logs/actions.ts`

### Phase 3 - Frontend
- [ ] Créer page `app/(admin)/admin/audit-logs/page.tsx` + `loading.tsx`
- [ ] Créer tous les composants dans `components/features/admin/audit-logs/`
- [ ] Ajouter lien dans sidebar

### Phase 4 - Testing
- [ ] Test filtres (action, table, dates, search)
- [ ] Test pagination
- [ ] Test export CSV
- [ ] Test modal détails JSON
- [ ] Test RLS (non-admin ne peut pas accéder)

### Phase 5 - Cleanup Automation (Optional)
- [ ] Créer Edge Function pour cleanup
- [ ] Configurer GitHub Actions cron job

### Phase 6 - Clean Code Compliance
- [ ] Vérifier longueur fonctions (≤ 30 lignes)
  - `get_audit_logs_with_email()` → Splitter en CTE helpers si >30 lignes
  - `AuditLogsView` → Splitter en sous-composants si >300 lignes
  - `AuditLogsTable` → Splitter en `AuditLogsTableRow` si >300 lignes
- [ ] Vérifier paramètres (≤ 5 par fonction)
- [ ] Vérifier fichiers (≤ 300 lignes)

---

## 📚 References

- **Table existante:** `supabase/schemas/20_audit_trigger.sql`
- **Pattern DAL:** error.ts
- **Pattern Admin UI:** users
- **Instructions RLS:** Create-RLS-policies.instructions.md
- **Instructions Functions:** Database_Create_functions.instructions.md

---

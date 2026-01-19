/**
 * @file Dashboard Schemas
 * @description Zod schemas for admin dashboard statistics
 * @module lib/schemas/dashboard
 */
import { z } from "zod";

// =============================================================================
// SCHEMAS
// =============================================================================

/**
 * Dashboard statistics schema
 */
export const DashboardStatsSchema = z.object({
  teamCount: z.number().int().nonnegative(),
  showsCount: z.number().int().nonnegative(),
  eventsCount: z.number().int().nonnegative(),
  mediaCount: z.number().int().nonnegative(),
  partnersCount: z.number().int().nonnegative(),
});

// =============================================================================
// TYPES
// =============================================================================

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

/**
 * Individual stat item for dashboard display
 * Note: icon is React.ReactNode, not validated by Zod
 */
export interface StatItem {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
}

/**
 * Quick action item for dashboard
 */
export interface QuickAction {
  label: string;
  icon: React.ReactNode;
  href: string;
}

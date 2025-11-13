import { z } from "zod";

/**
 * Dashboard statistics schema
 */
export const DashboardStatsSchema = z.object({
  teamCount: z.number().int().nonnegative(),
  showsCount: z.number().int().nonnegative(),
  eventsCount: z.number().int().nonnegative(),
  mediaCount: z.number().int().nonnegative(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

/**
 * Individual stat item
 */
export interface StatItem {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
}

/**
 * Quick action item
 */
export interface QuickAction {
  label: string;
  icon: React.ReactNode;
  href: string;
}

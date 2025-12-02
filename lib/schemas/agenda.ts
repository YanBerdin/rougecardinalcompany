/**
 * @file Agenda Schemas
 * @description Zod schemas for agenda events validation (DAL + UI)
 * @module lib/schemas/agenda
 */
import { z } from "zod";

// =============================================================================
// DATABASE/DAL SCHEMAS
// =============================================================================

/**
 * Event schema for agenda items
 * Used by DAL for data validation and type inference
 */
export const EventSchema = z.object({
    id: z.number(),
    title: z.string(),
    date: z.string(), // ISO date string yyyy-mm-dd
    time: z.string(), // HH:mm format
    venue: z.string(),
    address: z.string(),
    type: z.string(),
    status: z.string(),
    ticketUrl: z.string().nullable(),
    image: z.string(),
});/**
 * Event type filter option schema
 */
export const EventTypeSchema = z.object({
    value: z.string(),
    label: z.string(),
});

// =============================================================================
// TYPES
// =============================================================================

export type Event = z.infer<typeof EventSchema>;
export type EventType = z.infer<typeof EventTypeSchema>;

// =============================================================================
// FILTER SCHEMAS (for DAL query parameters)
// =============================================================================

export const EventFilterSchema = z.object({
    type: z.string().optional(),
    status: z.enum(["upcoming", "past", "all"]).optional().default("upcoming"),
    limit: z.number().int().positive().optional(),
    offset: z.number().int().min(0).optional(),
});

export type EventFilter = z.infer<typeof EventFilterSchema>;

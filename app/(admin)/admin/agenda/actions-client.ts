/**
 * Client-safe re-exports of Server Actions
 *
 * Ce fichier expose uniquement les fonctions Server Action,
 * sans importer de types contenant BigInt.
 * Les Client Components doivent importer depuis CE fichier.
 * 
 * ⚠️ IMPORTANT : Les Server Actions ne retournent PAS de données
 * pour éviter les problèmes de sérialisation BigInt.
 * Utiliser router.refresh() pour récupérer les nouvelles données.
 */
export {
    createEventAction,
    updateEventAction,
    deleteEventAction,
} from "./actions";

// Re-export du type ActionResult (primitifs uniquement, sans données)
export type { ActionResult } from "./actions";

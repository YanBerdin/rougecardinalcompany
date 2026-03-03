import { type ReactNode } from "react";
import { fetchDisplayToggle } from "@/lib/dal/site-config";

/**
 * Server-side helper: renders `renderFn()` only when the given display toggle
 * is enabled (or not configured). Returns `null` when the toggle is explicitly
 * set to `enabled: false`, allowing Containers to skip both the data-fetch and
 * the render in a single call.
 *
 * @example
 * const partnersSection = await withDisplayToggle(
 *   "display_toggle_partners",
 *   () => <PartnersContainer />,
 * );
 */
export async function withDisplayToggle(
    toggleKey: string,
    renderFn: () => ReactNode | Promise<ReactNode>
): Promise<ReactNode | null> {
    const result = await fetchDisplayToggle(toggleKey);

    // Default to visible when toggle is missing or fetch fails
    if (!result.success || result.data === null) {
        return renderFn();
    }

    if (result.data.value?.enabled === false) {
        return null;
    }

    return renderFn();
}

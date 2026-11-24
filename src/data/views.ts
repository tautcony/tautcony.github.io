/**
 * Typed GA4 page-view statistics map (synced into `views.json` by `scripts/content/sync-ga4-views.mjs`).
 */
import raw from "./views.json";

export interface ViewsSnapshot {
    totalViews: number;
    totalUsers: number;
    updatedAt: string;
    paths: Readonly<Record<string, number>>;
}

export const siteViews: ViewsSnapshot = raw;

export function normalizeViewPath(path: string): string {
    const clean = path.split(/[?#]/)[0] || "/";
    if (clean === "/") return "/";
    return clean.endsWith("/") ? clean : `${clean}/`;
}

export function getPathViews(path: string | undefined): number | undefined {
    if (!path) return undefined;
    const normalized = normalizeViewPath(path);
    const count = siteViews.paths[normalized] ?? siteViews.paths[normalized.replace(/\/$/, "")];
    return typeof count === "number" && count > 0 ? count : undefined;
}

export function formatViews(count: number): string {
    return count.toLocaleString("en-US");
}

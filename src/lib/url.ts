/** Absolute URL helpers for feeds, sitemap, Open Graph, and SSG seeds. */
import { site } from "../data/site";

/** Join `site.url` with a site-relative path (or pass through absolute http(s) URLs). */
export function absoluteUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    const base = site.url.replace(/\/$/, "");
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${base}${p}`;
}

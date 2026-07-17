/**
 * Off-site link detection for SSG (no `window.location`).
 * Mirrors the former client helper in `src/client/lib/dom.ts`.
 */

/**
 * @param href - Raw `href` attribute (relative, absolute, or protocol-relative)
 * @param siteOrigin - Canonical origin, e.g. `https://tautcony.xyz`
 */
export function isExternalHref(href: string, siteOrigin: string): boolean {
    if (href.length <= 1) {
        return false;
    }
    // Relative paths / same-document links are never external.
    if (href.startsWith("#") || href.startsWith("?") || href.startsWith("/")) {
        if (href.startsWith("//")) {
            // Protocol-relative absolute URL — fall through to origin compare.
        } else {
            return false;
        }
    }
    try {
        // Base must be a full URL so relative and protocol-relative hrefs resolve.
        const base = siteOrigin.endsWith("/") ? siteOrigin : `${siteOrigin}/`;
        return new URL(href, base).origin !== siteOrigin;
    } catch {
        return false;
    }
}

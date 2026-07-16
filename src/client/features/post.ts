import { isExternal } from "../lib/dom";

/**
 * Post-page enhancements: `//` comment tint, external link markers.
 * Header backgrounds (including GeoPattern fallback) are SSG-only via IntroHeader.
 * “Update on” dates are SSG-only from `src/data/lastmod.json`.
 */
export function init(): void {
    for (const p of document.querySelectorAll<HTMLParagraphElement>(".post-content p")) {
        // textContent avoids forced layout (innerText) for a simple prefix check.
        if ((p.textContent ?? "").trimStart().startsWith("//")) {
            p.style.color = "#339966";
        }
    }
    for (const a of document.querySelectorAll<HTMLAnchorElement>(".post-content a")) {
        if (isExternal(a.href)) {
            a.classList.add("external");
        }
    }
}

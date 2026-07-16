import * as GeoPattern from "../lib/geopattern";
import { isExternal } from "../lib/dom";

/**
 * Post-page enhancements: GeoPattern header fallback, `//` comment tint, external links.
 * “Update on” dates are SSG-only from `src/data/lastmod.json`.
 */
export function init() {
    const banner = document.querySelector("header.intro-header");
    if (!(banner instanceof HTMLElement)) {
        return;
    }
    const style = window.getComputedStyle(banner);
    if (style.backgroundImage === "none") {
        const pattern = GeoPattern.generate(document.location.href);
        banner.style.backgroundImage = pattern.toDataUrl();
    }

    for (const p of document.querySelectorAll<HTMLParagraphElement>(".post-content p")) {
        if (p.innerText.startsWith("//")) {
            p.style.color = "#339966";
        }
    }
    for (const a of document.querySelectorAll<HTMLAnchorElement>(".post-content a")) {
        if (isExternal(a.href)) {
            a.classList.add("external");
        }
    }
}

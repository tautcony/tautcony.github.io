import * as GeoPattern from "../lib/geopattern";
import { isExternal } from "../lib/dom";

/**
 * Post page polish. Last-modified date is rendered at build time from
 * `src/data/lastmod.json` (frozen map; see scripts/content/generate-lastmod.mjs) — no GitHub API.
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

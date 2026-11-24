import { MONSTER_COUNT, getMonsterSrc, getRandomMonsterSrc } from "../../data/monsters";
import { site } from "../../data/site";

const TRANSITION_DURATION_MS = 480;
const prefetchedUrls = new Set<string>();
const prerenderedUrls = new Set<string>();

function supportsSpeculationRules(): boolean {
    return (
        typeof HTMLScriptElement !== "undefined"
        && "supports" in HTMLScriptElement
        && typeof HTMLScriptElement.supports === "function"
        && HTMLScriptElement.supports("speculationrules")
    );
}

function resolveSameOriginUrl(href: string): string | null {
    try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) {
            return null;
        }
        return url.href;
    } catch {
        return null;
    }
}

/**
 * Warms the browser cache for `href` (on hover/pointerdown) via `<link rel="prefetch">`.
 */
function prefetchDocument(href: string): void {
    const resolved = resolveSameOriginUrl(href);
    if (!resolved || prefetchedUrls.has(resolved)) return;
    prefetchedUrls.add(resolved);

    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "document";
    link.href = resolved;
    document.head.appendChild(link);
}

/**
 * Triggers Speculation Rules prerender (Chromium) or falls back to document prefetch
 * so the target page loads concurrently during the 480ms circle zoom animation.
 */
function preloadDuringTransition(href: string): void {
    const resolved = resolveSameOriginUrl(href);
    if (!resolved) return;

    if (supportsSpeculationRules() && !prerenderedUrls.has(resolved)) {
        prerenderedUrls.add(resolved);
        const script = document.createElement("script");
        script.type = "speculationrules";
        script.textContent = JSON.stringify({
            prerender: [{ source: "list", urls: [resolved] }],
        });
        document.head.appendChild(script);
        return;
    }

    prefetchDocument(resolved);
}

/**
 * Expands a black circle from the clicked `.rand_body` to cover the viewport
 * while preloading the target page, then navigates once the animation completes.
 */
function navigateWithCircleTransition(trigger: HTMLAnchorElement): void {
    const href = trigger.getAttribute("href");
    if (!href) return;

    preloadDuringTransition(href);

    const existing = document.querySelector(".rr-transition-circle");
    if (existing) existing.remove();

    const rect = trigger.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxRadius = Math.hypot(
        Math.max(cx, window.innerWidth - cx),
        Math.max(cy, window.innerHeight - cy)
    );
    const scale = (maxRadius * 2) / rect.width + 0.5;

    trigger.classList.add("is-expanding");

    const overlay = document.createElement("div");
    overlay.className = "rr-transition-circle";
    overlay.style.left = `${cx}px`;
    overlay.style.top = `${cy}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.marginLeft = `${-rect.width / 2}px`;
    overlay.style.marginTop = `${-rect.height / 2}px`;
    document.body.appendChild(overlay);

    // Force style flush before applying the target transform.
    void overlay.offsetWidth;
    overlay.style.transform = `scale(${scale})`;

    window.setTimeout(() => {
        window.location.href = href;
    }, TRANSITION_DURATION_MS);
}

/**
 * Preloads all 24 character PNGs, animates `.rand_wrap` circles on hover,
 * prefetches target posts on hover/pointerdown, and handles fullscreen circle transitions.
 */
export function init(): void {
    const wraps = document.querySelectorAll<HTMLElement>(".rand_wrap");
    if (wraps.length === 0) return;

    const preload = (): void => {
        for (let i = 1; i <= MONSTER_COUNT; i++) {
            const img = new Image();
            img.src = getMonsterSrc(i, site.baseurl);
        }
    };

    if (document.readyState === "complete") {
        preload();
    } else {
        window.addEventListener("load", preload, { once: true });
    }

    // Clean up transition overlay when navigating back via bfcache.
    window.addEventListener("pageshow", () => {
        document.querySelector(".rr-transition-circle")?.remove();
        document.querySelectorAll(".is-expanding").forEach(el => {
            el.classList.remove("is-expanding");
        });
    });

    wraps.forEach(wrap => {
        let swapTimer: number | undefined;
        let resetTimer: number | undefined;
        const circleLink = wrap.querySelector<HTMLAnchorElement>(".js-rand-transition");
        const targetHref = circleLink?.getAttribute("href") ?? null;

        wrap.addEventListener("mouseenter", () => {
            window.clearTimeout(swapTimer);
            window.clearTimeout(resetTimer);
            wrap.classList.add("enter");
            wrap.classList.remove("leave");

            if (targetHref) {
                prefetchDocument(targetHref);
            }
        });

        wrap.addEventListener("mouseleave", () => {
            wrap.classList.remove("enter");
            wrap.classList.add("leave");

            swapTimer = window.setTimeout(() => {
                const img = wrap.querySelector<HTMLImageElement>(".rand_body .image");
                if (img) {
                    img.src = getRandomMonsterSrc(site.baseurl);
                }
            }, 200);

            resetTimer = window.setTimeout(() => {
                wrap.classList.remove("leave");
            }, 400);
        });

        if (circleLink) {
            circleLink.addEventListener("pointerdown", () => {
                if (targetHref) {
                    preloadDuringTransition(targetHref);
                }
            }, { passive: true });

            circleLink.addEventListener("click", event => {
                if (
                    event.defaultPrevented
                    || event.button !== 0
                    || event.metaKey
                    || event.ctrlKey
                    || event.shiftKey
                    || event.altKey
                ) {
                    return;
                }
                event.preventDefault();
                navigateWithCircleTransition(circleLink);
            });
        }
    });
}

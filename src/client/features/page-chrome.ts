import { el } from "../lib/dom";

function wrapTable(table: HTMLTableElement): void {
    const wrapper = el("div", { class: "table-responsive" });
    table.replaceWith(wrapper);
    wrapper.append(table);
}

function smoothScrollTo(top: number): void {
    window.scrollTo({ top, behavior: "smooth" });
}

/**
 * Resolve a heading by id.
 * Prefer getElementById: querySelector(`#${id}`) throws or fails for ids that are
 * not valid CSS identifiers (e.g. start with a digit: `0-输入是什么`, common for
 * Chinese numbered headings after rehype-slug).
 */
export function findHeadingById(id: string): HTMLElement | null {
    if (!id) {
        return null;
    }
    const byId = document.getElementById(id);
    if (byId) {
        return byId;
    }
    // Fallback for odd documents; CSS.escape handles digits / CJK safely.
    try {
        const esc = typeof CSS !== "undefined" && typeof CSS.escape === "function"
            ? CSS.escape(id)
            : id.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
        return document.querySelector(`#${esc}`);
    } catch {
        return null;
    }
}

/** Fixed navbar clearance when scrolling to in-page anchors. */
function scrollOffset(): number {
    const nav = document.querySelector(".navbar-custom");
    const h = nav instanceof HTMLElement ? nav.offsetHeight : 0;
    return h > 0 ? h + 8 : 0;
}

function scrollToHeading(id: string, behavior: ScrollBehavior = "smooth"): void {
    const target = findHeadingById(id);
    if (target === null) {
        return;
    }
    const top = target.getBoundingClientRect().top + window.scrollY - scrollOffset();
    window.scrollTo({ top: Math.max(0, top), behavior });
}

const onCatalogLinkClick = (id: string) => (event?: Event) => {
    event?.preventDefault();
    scrollToHeading(id, "smooth");
};

/**
 * Ensure every catalog heading has a non-empty id (CJK-safe).
 * Does not rewrite existing rehype-slug / author ids.
 */
export function ensureHeadingId(heading: Element, used: Set<string>): string {
    const existing = heading.id?.trim();
    if (existing) {
        used.add(existing);
        return existing;
    }

    const text = (heading.textContent ?? "").trim().replace(/\s+/g, "-");
    // Keep letters (incl. CJK), numbers, hyphen, underscore; drop other punct.
    let base = text.replace(/[^\p{L}\p{N}_-]+/gu, "-").replace(/^-+|-+$/g, "");
    if (!base) {
        base = "section";
    }
    // HTML ids may start with a digit; keep as-is (lookup uses getElementById).
    let id = base;
    let n = 2;
    while (used.has(id) || document.getElementById(id)) {
        id = `${base}-${n}`;
        n += 1;
    }
    heading.id = id;
    used.add(id);
    return id;
}

export function generateCatalog(selector: string): void {
    const postContainer = document.querySelector("div.post-container");
    if (postContainer === null) {
        return;
    }
    // Only in-article headings; skip nested chrome if any.
    const root = postContainer.querySelector(".post-content") ?? postContainer;
    const catalogs = root.querySelectorAll("h1,h2,h3,h4,h5,h6");
    const catalogContainer = document.querySelector(selector);
    if (catalogContainer === null) {
        return;
    }
    const used = new Set<string>();
    catalogContainer.replaceChildren(
        ...Array.from(catalogs, catalog => {
            const tagName = catalog.tagName.toLowerCase();
            const id = ensureHeadingId(catalog, used);
            const label = (catalog.textContent ?? "").trim() || id;
            return el(
                "li",
                { class: `${tagName}_nav` },
                el("a", {
                    href: `#${id}`,
                    on: { click: onCatalogLinkClick(id) },
                }, label)
            );
        })
    );
}

function initCatalog(): void {
    if (!document.querySelector(".catalog-body")) {
        return;
    }
    generateCatalog(".catalog-body");
    document.querySelector(".catalog-toggle")?.addEventListener("click", e => {
        e.preventDefault();
        document.querySelector(".side-catalog")?.classList.toggle("fold");
    });

    // Deep-link / refresh with hash (incl. CJK and digit-leading ids).
    const scrollHash = () => {
        const raw = location.hash.replace(/^#/, "");
        if (!raw) {
            return;
        }
        // Instant on first paint; avoid fighting the browser's default jump.
        scrollToHeading(decodeURIComponent(raw), "auto");
    };
    scrollHash();
    window.addEventListener("hashchange", scrollHash);
}

export function init(): void {
    initCatalog();

    for (const table of document.querySelectorAll("table")) {
        table.classList.add("table");
        wrapTable(table);
    }

    const gotop = document.getElementById("gotop");
    if (gotop instanceof HTMLButtonElement) {
        gotop.addEventListener("click", () => {
            smoothScrollTo(0);
        });
    }

    const MQL = 1170;
    const navbarEl = document.querySelector(".navbar-custom");
    const catalogEl = document.querySelector(".side-catalog");
    const bannerEl = document.querySelector(".intro-header .container");

    if (!(navbarEl instanceof HTMLElement) || !(bannerEl instanceof HTMLElement)) {
        return;
    }

    const navbar = navbarEl;
    const catalog = catalogEl instanceof HTMLElement ? catalogEl : null;
    const headerHeight = navbar.clientHeight;
    const bannerHeight = bannerEl.clientHeight;

    function updateBanner(currentTop: number, previousTop: number): void {
        if (gotop instanceof HTMLButtonElement) {
            gotop.disabled = currentTop < 300;
        }
        if (window.innerWidth <= MQL) {
            return;
        }

        if (currentTop - previousTop <= 0) {
            if (currentTop > 0 && navbar.classList.contains("is-fixed")) {
                navbar.classList.add("is-visible");
            } else {
                navbar.classList.remove("is-visible", "is-fixed");
            }
        } else {
            navbar.classList.remove("is-visible");
            if (currentTop > headerHeight && !navbar.classList.contains("is-fixed")) {
                navbar.classList.add("is-fixed");
            }
        }

        if (catalog === null) {
            return;
        }
        catalog.style.display = "block";
        catalog.classList.toggle("fixed", currentTop > bannerHeight);
    }

    let lastKnownScrollPosition = 0;
    let ticking = false;

    const onScrollOrResize = () => {
        if (!ticking) {
            const previousTop = lastKnownScrollPosition;
            window.requestAnimationFrame(() => {
                updateBanner(window.scrollY, previousTop);
                ticking = false;
            });
            ticking = true;
        }
        lastKnownScrollPosition = window.scrollY;
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
}

import { el } from "../lib/dom";

function wrap<K extends keyof HTMLElementTagNameMap>(
    node: HTMLElement,
    wrapperTagName: K,
    wrapperClassList: string[]
) {
    const wrapper = el(wrapperTagName, { class: wrapperClassList.join(" ") });
    node.replaceWith(wrapper);
    wrapper.append(node);
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

const scrollToHeadingId = (id: string) => (event?: Event) => {
    event?.preventDefault();
    const target = findHeadingById(id);
    if (target === null) {
        return;
    }
    const top = target.getBoundingClientRect().top + window.scrollY - scrollOffset();
    smoothScrollTo(Math.max(0, top));
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

export function generateCatalog(selector: string) {
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
                    on: { click: scrollToHeadingId(id) },
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
    const catalogToggle = document.querySelector(".catalog-toggle");
    if (catalogToggle) {
        catalogToggle.addEventListener("click", e => {
            e.preventDefault();
            document.querySelector(".side-catalog")?.classList.toggle("fold");
        });
    }

    // Deep-link / refresh with hash (incl. CJK and digit-leading ids).
    const scrollHash = () => {
        const raw = location.hash.replace(/^#/, "");
        if (!raw) {
            return;
        }
        const id = decodeURIComponent(raw);
        const target = findHeadingById(id);
        if (target) {
            const top = target.getBoundingClientRect().top + window.scrollY - scrollOffset();
            // Instant on first paint; avoid fighting the browser's default jump.
            window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
        }
    };
    scrollHash();
    window.addEventListener("hashchange", scrollHash);
}

export function init() {
    initCatalog();

    const tables = document.querySelectorAll("table");
    for (const table of Array.from(tables)) {
        table.classList.add("table");
        wrap(table, "div", ["table-responsive"]);
    }

    const gotop = document.getElementById("gotop") as HTMLButtonElement | null;
    if (gotop) {
        gotop.addEventListener("click", () => {
            smoothScrollTo(0);
        });
    }

    const MQL = 1170;
    const navbar = document.querySelector(".navbar-custom");
    const catalog = document.querySelector(".side-catalog");
    const banner = document.querySelector(".intro-header .container");

    if (navbar === null || banner == null) {
        return;
    }

    const headerHeight = navbar.clientHeight;
    const bannerHeight = banner.clientHeight;

    function updateBanner(currentTop: number, previousTop: number) {
        if (gotop) {
            gotop.disabled = currentTop < 300;
        }
        if (window.innerWidth > MQL && navbar !== null) {
            if (currentTop - previousTop <= 0) {
                if (currentTop > 0 && navbar.classList.contains("is-fixed")) {
                    navbar.classList.add("is-visible");
                } else {
                    navbar.classList.remove("is-visible");
                    navbar.classList.remove("is-fixed");
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
            (catalog as HTMLDivElement).style.display = "block";
            if (currentTop > bannerHeight) {
                catalog.classList.add("fixed");
            } else {
                catalog.classList.remove("fixed");
            }
        }
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
        }
        ticking = true;
        lastKnownScrollPosition = window.scrollY;
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
}

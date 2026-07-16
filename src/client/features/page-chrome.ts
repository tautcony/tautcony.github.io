import { el } from "../lib/dom";

/**
 * Shared page chrome: responsive tables (in post content), gotop, navbar scroll.
 * Side-catalog lives in `features/catalog.ts`.
 */

function wrapTable(table: HTMLTableElement): void {
    const wrapper = el("div", { class: "table-responsive" });
    table.replaceWith(wrapper);
    wrapper.append(table);
}

function smoothScrollTo(top: number): void {
    window.scrollTo({ top, behavior: "smooth" });
}

export function init(): void {
    // Only article tables — avoid wrapping unrelated layout tables.
    const tableRoot = document.querySelector(".post-content") ?? document.querySelector(".post-container");
    if (tableRoot) {
        for (const table of tableRoot.querySelectorAll("table")) {
            table.classList.add("table");
            wrapTable(table);
        }
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

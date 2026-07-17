/**
 * Site chrome: gotop, sticky navbar, side-catalog (fixed + fold).
 * Tables / catalog links are SSG; this module only binds interaction.
 */

const DESKTOP_MIN_WIDTH = 1170;

function bindGotop(): void {
    const gotop = document.getElementById("gotop");
    if (!(gotop instanceof HTMLButtonElement)) {
        return;
    }
    gotop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

function bindCatalogFold(catalog: HTMLElement): void {
    document.querySelector(".catalog-toggle")?.addEventListener("click", event => {
        event.preventDefault();
        catalog.classList.toggle("fold");
    });
}

function bindScrollChrome(): void {
    const navbar = document.querySelector(".navbar-custom");
    const banner = document.querySelector(".intro-header .container");
    if (!(navbar instanceof HTMLElement) || !(banner instanceof HTMLElement)) {
        return;
    }

    const catalogEl = document.querySelector(".side-catalog");
    const catalog = catalogEl instanceof HTMLElement ? catalogEl : null;
    if (catalog) {
        bindCatalogFold(catalog);
    }

    const gotop = document.getElementById("gotop");
    const headerHeight = navbar.clientHeight;
    const bannerHeight = banner.clientHeight;
    let lastScrollY = 0;
    let framePending = false;

    const paint = (scrollY: number, previousY: number): void => {
        if (gotop instanceof HTMLButtonElement) {
            gotop.disabled = scrollY < 300;
        }
        if (window.innerWidth <= DESKTOP_MIN_WIDTH) {
            return;
        }

        if (scrollY - previousY <= 0) {
            if (scrollY > 0 && navbar.classList.contains("is-fixed")) {
                navbar.classList.add("is-visible");
            } else {
                navbar.classList.remove("is-visible", "is-fixed");
            }
        } else {
            navbar.classList.remove("is-visible");
            if (scrollY > headerHeight && !navbar.classList.contains("is-fixed")) {
                navbar.classList.add("is-fixed");
            }
        }

        if (catalog === null) {
            return;
        }
        catalog.style.display = "block";
        catalog.classList.toggle("fixed", scrollY > bannerHeight);
    };

    const onScrollOrResize = (): void => {
        if (!framePending) {
            const previousY = lastScrollY;
            window.requestAnimationFrame(() => {
                paint(window.scrollY, previousY);
                framePending = false;
            });
            framePending = true;
        }
        lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
}

export function init(): void {
    bindGotop();
    bindScrollChrome();
}

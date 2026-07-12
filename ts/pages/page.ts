import { util_ui_element_creator as _ } from "../Lib/utils";

function wrap<K extends keyof HTMLElementTagNameMap>(el: HTMLElement, wrapperTagName: K, wrapperClassList: [string]) {
    const wrapper = document.createElement(wrapperTagName);
    wrapperClassList.forEach(value => {
        wrapper.classList.add(value);
    });
    if (el.parentNode !== null) {
        el.parentNode.insertBefore(wrapper, el);
    }
    wrapper.appendChild(el);
}

function smoothScrollTo(top: number): void {
    window.scrollTo({ top, behavior: "smooth" });
}

const scrollToHeading = (element: string) => {
    const elementSelector = document.querySelector(element);
    if (elementSelector === null) {
        return;
    }

    return () => {
        const top = elementSelector.getBoundingClientRect().top + window.scrollY;
        smoothScrollTo(top);
    };
};

export function generateCatalog(selector: string) {
    const postContainer = document.querySelector("div.post-container");
    if (postContainer === null) {
        return;
    }
    const catalogs = postContainer.querySelectorAll("h1,h2,h3,h4,h5,h6");
    const catalogContainer = document.querySelector(selector);
    if (catalogContainer === null) {
        return;
    }
    catalogContainer.replaceChildren();
    catalogs.forEach(catalog => {
        const tagName = catalog.tagName.toLowerCase();
        const text = catalog.textContent;
        const element = _(
            "li",
            { className: `${tagName}_nav` },
            [_("a", {
                event: {
                    click: scrollToHeading(`#${catalog.id}`),
                },
            }, text)]
        );
        catalogContainer.appendChild(element);
    });
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

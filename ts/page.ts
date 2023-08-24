import anime from "animejs/lib/anime.es";
import { util_ui_element_creator as _ } from "./Lib/utils";

function wrap<K extends keyof HTMLElementTagNameMap>(el: HTMLElement, wrapperTagName: K, wrapperClassList: [string]) {
    const wrapper = document.createElement(wrapperTagName);
    wrapperClassList.forEach(value => {
        wrapper.classList.add(value);
    });
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
}

const scrollTo = (element: string) => {
    const elementSelector = document.querySelector(element);
    const elementOffset = elementSelector.getBoundingClientRect().top;

    return () => {
        const scrollPosition = document.documentElement.scrollTop;
        const documentTop = window.pageYOffset;
        const scrollOffset = elementOffset + scrollPosition - documentTop;
        anime({
            targets: [document.documentElement, document.body],
            scrollTop: scrollOffset,
            duration: 450,
            easing: "easeInOutQuad",
        });
    };
};

export function generateCatalog(selector: string) {
    // init
    const postContainer = document.querySelector("div.post-container");
    const catalogs = postContainer.querySelectorAll("h1,h2,h3,h4,h5,h6");
    const catalogContainer = document.querySelector(selector);
    // clean
    catalogContainer.innerHTML = "";
    // appending
    catalogs.forEach(catalog => {
        const tagName = catalog.tagName.toLowerCase();
        const text = catalog.textContent;
        const element = _(
            "li",
            { className: `${tagName}_nav` },
            [_("a", {
                event: {
                    click: scrollTo(`#${catalog.id}`),
                },
            }, text)]
        );
        catalogContainer.appendChild(element);
    });
}

export function pageInit() {
    // responsive tables
    const tables = document.querySelectorAll("table");
    /* eslint-disable @typescript-eslint/prefer-for-of */
    for (let i = 0; i < tables.length; ++i) {
        const table = tables[i] as HTMLTableElement;
        table.classList.add("table");
        wrap(table, "div", ["table-responsive"]);
    }
    /* eslint-enable @typescript-eslint/prefer-for-of */

    // responsive embed videos
    // $('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>').addClass("embed-responsive-item");
    // $('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>').addClass("embed-responsive-item");

    const gotop = document.getElementById("gotop") as HTMLButtonElement;
    if (gotop) {
        gotop.addEventListener("click", () => {
            anime({
                targets: "html, body",
                scrollTop: 0,
                duration: 1000,
                easing: "linear",
            });
        });
    }

    // Navigation Scripts to Show Header on Scroll-Up
    const MQL = 1170;
    const navbar = document.querySelector(".navbar-custom");
    const catalog = document.querySelector(".side-catalog");

    const headerHeight = navbar.clientHeight;
    const bannerHeight = document.querySelector(".intro-header .container").clientHeight;

    function updateBanner(currentTop: number, previousTop: number) {
        if (gotop) { gotop.disabled = currentTop < 300; }
        // primary navigation slide-in effect
        if (window.innerWidth > MQL) {
            // check if user is scrolling up by mouse or keyborad
            // scroll with animation in ie will lead to a serial of 0
            if (currentTop - previousTop <= 0) {
                // if scrolling up...
                if (currentTop > 0 && navbar.classList.contains("is-fixed")) {
                    navbar.classList.add("is-visible");
                } else {
                    navbar.classList.remove("is-visible");
                    navbar.classList.remove("is-fixed");
                }
            } else {
                // if scrolling down...
                navbar.classList.remove("is-visible");
                if (currentTop > headerHeight && !navbar.classList.contains("is-fixed")) {
                    navbar.classList.add("is-fixed");
                }
            }

            // adjust the appearance of side-catalog
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const BannerAnimation = (e: UIEvent) => {
        if (!ticking) {
            const previousTop = lastKnownScrollPosition;
            window.requestAnimationFrame(() => {
                updateBanner(window.pageYOffset, previousTop);
                ticking = false;
            });
        }
        ticking = true;
        lastKnownScrollPosition = window.pageYOffset;
    };

    window.addEventListener("scroll", BannerAnimation);
    window.addEventListener("resize", BannerAnimation);
}

import * as anime from "animejs";

function wrap<K extends keyof HTMLElementTagNameMap>(el: HTMLElement, wrapperTagName: K, wrapperClassList: [string]) {
    const wrapper = document.createElement(wrapperTagName);
    wrapperClassList.forEach(value => {
        wrapper.classList.add(value);
    });
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
}

export default function pageInit() {
    // responsive tables
    const tables = document.querySelectorAll("table");
    /*tslint:disable: prefer-for-of*/
    for (let i = 0; i < tables.length; ++i) {
        const table = tables[i] as HTMLTableElement;
        table.classList.add("table");
        wrap(table, "div", ["table-responsive"]);
    }
    /*tslint:enable: prefer-for-of*/

    // responsive embed videos
    //$('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>').addClass("embed-responsive-item");
    //$('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>').addClass("embed-responsive-item");

    const gotop = document.getElementById("gotop");
    gotop.addEventListener("click", () => {
        anime({
            targets: "html, body",
            scrollTop: 0,
            duration: 1000,
            easing: "linear"
        });
    });

    // Navigation Scripts to Show Header on Scroll-Up
    const MQL = 1170;
    const navbar = document.querySelector(".navbar-custom");
    const catalog = document.querySelector(".side-catalog");

    const headerHeight = navbar.clientHeight;
    const bannerHeight = document.querySelector(".intro-header .container").clientHeight;

    function updateBanner(currentTop: number, previousTop: number) {
        gotop.classList.toggle("active", currentTop > 300);
        //primary navigation slide-in effect
        if (window.innerWidth > MQL) {
            //check if user is scrolling up by mouse or keyborad
            if (currentTop < previousTop) {
                //if scrolling up...
                if (currentTop > 0 && navbar.classList.contains("is-fixed")) {
                    navbar.classList.add("is-visible");
                } else {
                    navbar.classList.remove("is-visible", "is-fixed");
                }
            } else {
                //if scrolling down...
                navbar.classList.remove("is-visible");
                if (currentTop > headerHeight && !navbar.classList.contains("is-fixed")) {
                    navbar.classList.add("is-fixed");
                }
            }

            //adjust the appearance of side-catalog
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

    const BannerAnimation = (e: UIEvent) => {
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

    window.addEventListener("scroll", BannerAnimation);
    window.addEventListener("resize", BannerAnimation);
}

/** Mobile navbar (no Bootstrap JS). Open/close animation is CSS-driven. */

const CLOSE_ANIMATION_MS = 400;

export function init(): void {
    const root = document.querySelector("#blog_navbar");
    const toggle = document.querySelector(".navbar-toggle");
    const collapse = document.querySelector(".navbar-collapse");
    if (
        !(root instanceof HTMLElement)
        || !(toggle instanceof HTMLButtonElement)
        || !(collapse instanceof HTMLElement)
    ) {
        return;
    }

    const close = (): void => {
        if (!root.classList.contains("in")) {
            return;
        }
        toggle.classList.add("is-collapsed");
        toggle.setAttribute("aria-expanded", "false");
        root.classList.add("is-closing");
        root.classList.remove("in");
        window.setTimeout(() => {
            if (!root.classList.contains("in")) {
                root.classList.remove("is-closing");
                collapse.style.height = "0";
            }
        }, CLOSE_ANIMATION_MS);
    };

    const open = (): void => {
        root.classList.remove("is-closing");
        root.classList.add("in");
        toggle.classList.remove("is-collapsed");
        toggle.setAttribute("aria-expanded", "true");
        collapse.style.height = "auto";
    };

    toggle.addEventListener("click", event => {
        event.stopPropagation();
        if (root.classList.contains("in")) {
            close();
        } else {
            open();
        }
    });

    document.addEventListener("click", event => {
        const target = event.target;
        if (!(target instanceof Node)) {
            return;
        }
        if (toggle.contains(target) || root.contains(target)) {
            return;
        }
        close();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            close();
            toggle.focus();
        }
    });
}

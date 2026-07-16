// Custom mobile navbar (no Bootstrap JS). Material-style open/close animation in CSS.
export default class Nav {
    private navbar: HTMLDivElement | null;
    private toggle: HTMLButtonElement | null;
    private collapse: HTMLDivElement | null;

    public constructor() {
        this.navbar = document.querySelector("#blog_navbar");
        this.toggle = document.querySelector(".navbar-toggle");
        this.collapse = document.querySelector(".navbar-collapse");
    }

    public init() {
        if (!this.navbar || !this.toggle || !this.collapse) {
            return;
        }

        this.toggle.addEventListener("click", e => {
            e.stopPropagation();
            if (this.navbar?.classList.contains("in")) {
                this.close();
            } else {
                this.open();
            }
        });

        document.addEventListener("click", e => {
            const target = e.target as Element | null;
            if (!target || !this.toggle || !this.navbar) {
                return;
            }
            if (this.toggle.contains(target) || this.navbar.contains(target)) {
                return;
            }
            this.close();
        });

        document.addEventListener("keydown", e => {
            if (e.key === "Escape") {
                this.close();
                this.toggle?.focus();
            }
        });
    }

    public close() {
        if (!this.navbar || !this.toggle || !this.collapse) {
            return;
        }
        this.toggle.classList.add("is-collapsed");
        this.toggle.setAttribute("aria-expanded", "false");
        this.navbar.classList.remove("in");
        setTimeout(() => {
            if (this.navbar && !this.navbar.classList.contains("in") && this.collapse) {
                this.collapse.style.height = "0";
            }
        }, 400);
    }

    public open() {
        if (!this.navbar || !this.toggle || !this.collapse) {
            return;
        }
        this.navbar.classList.add("in");
        this.toggle.classList.remove("is-collapsed");
        this.toggle.setAttribute("aria-expanded", "true");
        this.collapse.style.height = "auto";
    }
}

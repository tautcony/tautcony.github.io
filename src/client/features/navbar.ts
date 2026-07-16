// Custom mobile navbar (no Bootstrap JS). Material-style open/close animation in CSS.
const CLOSE_ANIMATION_MS = 400;

class Navbar {
    private readonly root: HTMLElement | null;
    private readonly toggle: HTMLButtonElement | null;
    private readonly collapse: HTMLElement | null;

    public constructor() {
        this.root = document.querySelector("#blog_navbar");
        this.toggle = document.querySelector(".navbar-toggle");
        this.collapse = document.querySelector(".navbar-collapse");
    }

    public init(): void {
        if (!this.root || !this.toggle || !this.collapse) {
            return;
        }

        this.toggle.addEventListener("click", e => {
            e.stopPropagation();
            if (this.root?.classList.contains("in")) {
                this.close();
            } else {
                this.open();
            }
        });

        document.addEventListener("click", e => {
            const target = e.target;
            if (!(target instanceof Node) || !this.toggle || !this.root) {
                return;
            }
            if (this.toggle.contains(target) || this.root.contains(target)) {
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

    public close(): void {
        if (!this.root || !this.toggle || !this.collapse) {
            return;
        }
        this.toggle.classList.add("is-collapsed");
        this.toggle.setAttribute("aria-expanded", "false");
        this.root.classList.remove("in");
        const collapse = this.collapse;
        const root = this.root;
        window.setTimeout(() => {
            if (!root.classList.contains("in")) {
                collapse.style.height = "0";
            }
        }, CLOSE_ANIMATION_MS);
    }

    public open(): void {
        if (!this.root || !this.toggle || !this.collapse) {
            return;
        }
        this.root.classList.add("in");
        this.toggle.classList.remove("is-collapsed");
        this.toggle.setAttribute("aria-expanded", "true");
        this.collapse.style.height = "auto";
    }
}

export function init(): void {
    new Navbar().init();
}

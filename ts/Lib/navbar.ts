// Drop Bootstarp low-performance Navbar
// Use customize navbar with high-quality material design animation
// in high-perf jank-free CSS3 implementation
export default class Nav {
    private navbar: HTMLDivElement;
    private toggle: HTMLButtonElement;
    private collapse: HTMLDivElement;

    public constructor() {
        this.navbar = document.querySelector("#blog_navbar") as HTMLDivElement;
        this.toggle = document.querySelector(".navbar-toggle") as HTMLButtonElement;
        this.collapse = document.querySelector(".navbar-collapse") as HTMLDivElement;
    }

    public Init() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.toggle.addEventListener("click", e => {
            if (this.navbar.classList.contains("in")) {
                this.close();
            } else {
                this.open();
            }
        });
        /**
         * Since Fastclick is used to delegate "touchstart" globally
         * to hack 300ms delay in iOS by performing a fake "click",
         * Using "e.stopPropagation" to stop "touchstart" event from
         * $toggle/$collapse will break global delegation.
         *
         * Instead, we use a "e.target" filter to prevent handler
         * added to document close Nav.
         *
         * Also, we use "click" instead of "touchstart" as compromise
         */
        document.addEventListener("click", e => {
            if (e.target === this.toggle
                || (e.target as Element).className === "icon-bar") {
                return;
            }
            this.close();
        });
    }

    public close() {
        this.toggle.classList.add("is-collapsed");
        this.navbar.classList.remove("in");
        // wait until animation end.
        setTimeout(() => {
            // prevent frequently toggle
            if (!this.navbar.classList.contains("in")) {
                this.collapse.style.height = "0";
            }
        }, 400);
    }

    public open() {
        this.navbar.classList.add("in");
        this.toggle.classList.remove("is-collapsed");
        this.collapse.style.height = "auto";
    }
}

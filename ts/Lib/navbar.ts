namespace Lib {
// Drop Bootstarp low-performance Navbar
// Use customize navbar with high-quality material design animation
// in high-perf jank-free CSS3 implementation
export class Nav {
    private navbar: HTMLDivElement;
    private toggle: HTMLButtonElement;
    private collapse: HTMLDivElement;

    public constructor() {
        this.navbar   = document.querySelector("#blog_navbar")     as HTMLDivElement;
        this.toggle   = document.querySelector(".navbar-toggle")   as HTMLButtonElement;
        this.collapse = document.querySelector(".navbar-collapse") as HTMLDivElement;
    }

    public Init() {
        this.toggle.addEventListener("click", (e) => {
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
        document.addEventListener("click", (e) => {
            if (e.target === this.toggle ||
                (e.target as Element).className === "icon-bar") {
                return;
            }
            this.close();
        });
    }

    public flip() {
        this.navbar.classList.toggle("in");
        this.toggle.classList.toggle("is-collapsed");
    }

    public close() {
        this.flip();
        // wait until animation end.
        setTimeout(() => {
            // prevent frequently toggle
            if (!this.navbar.classList.contains("in")) {
                this.collapse.style.height = "0";
            }
        }, 400);
    }

    public open() {
        this.flip();
        this.collapse.style.height = "auto";
    }
}
}

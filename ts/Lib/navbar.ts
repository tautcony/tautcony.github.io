namespace Lib {
// Drop Bootstarp low-performance Navbar
// Use customize navbar with high-quality material design animation
// in high-perf jank-free CSS3 implementation
export class Nav {
    private navbar: HTMLDivElement;
    private toggle: HTMLDivElement;
    private collapse: HTMLDivElement;

    public constructor() {
        this.navbar   = document.querySelector("#blog_navbar")     as HTMLDivElement;
        this.toggle   = document.querySelector(".navbar-toggle")   as HTMLDivElement;
        this.collapse = document.querySelector(".navbar-collapse") as HTMLDivElement;
    }

    public Init() {
        this.toggle.addEventListener("click", (e) => {
            if (this.navbar.className.indexOf("in") > 0) {
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

    public close() {
        this.navbar.className = " ";
        // wait until animation end.
        setTimeout(() => {
            // prevent frequently toggle
            if (this.navbar.className.indexOf("in") < 0) {
                this.collapse.style.height = "0";
            }
        }, 400);
    }

    public open() {
        this.collapse.style.height = "auto";
        this.navbar.className += " in";
    }
}
}

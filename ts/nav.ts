// Drop Bootstarp low-performance Navbar
// Use customize navbar with high-quality material design animation
// in high-perf jank-free CSS3 implementation
class Nav {
    public navbar    = document.querySelector("#blog_navbar")     as HTMLDivElement;
    public toggle    = document.querySelector(".navbar-toggle")   as HTMLDivElement;
    private collapse = document.querySelector(".navbar-collapse") as HTMLDivElement;
    public close() {
        this.navbar.className = " ";
        // wait until animation end.
        setTimeout(() => {
            // prevent frequently toggle
            if (this.navbar.className.indexOf("in") < 0) {
                this.collapse.style.height = "0px";
            }
        }, 400);
    }

    public open() {
        this.collapse.style.height = "auto";
        this.navbar.className += " in";
    }
}

document.addEventListener("DOMContentLoaded", () => {
const nav = new Nav();
// Bind Event
nav.toggle.addEventListener("click", (e) => {
    if (nav.navbar.className.indexOf("in") > 0) {
        nav.close();
    } else {
        nav.open();
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
    if (e.target === nav.toggle ||
        (e.target as Element).className === "icon-bar") {
        return;
    }
    nav.close();
});
});

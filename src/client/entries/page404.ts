/**
 * Particle 404 page entry.
 */

import "../../styles/404.scss";
import * as particle404 from "../features/particle404";

function boot(): void {
    particle404.init();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}

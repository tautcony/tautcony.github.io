/**
 * Particle 404 page entry.
 */

import "../../styles/404.scss";
import { startParticle404 } from "../features/particle404";

function boot(): void {
    startParticle404();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}

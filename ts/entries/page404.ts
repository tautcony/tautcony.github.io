/**
 * Particle 404 page entry.
 */

import "../../styles/404.scss";
import { startParticle404 } from "../particle404/modern-scene";

function boot(): void {
    startParticle404();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}

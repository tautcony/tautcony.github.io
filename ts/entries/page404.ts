/**
 * Particle 404 page entry.
 *
 * THREE r56 stays a classic <script> on the page (CanvasRenderer-era API).
 * Stats / Tween are TypeScript modules; dat.GUI comes from the npm package.
 */

import "../../less/404.less";
import { startParticle404 } from "../particle404/bootstrap";

function boot(): void {
    startParticle404();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}

/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Particle 404 page entry (webpack).
 *
 * THREE r56 stays an external classic <script> (CanvasRenderer-era API).
 * Stats / Tween are TypeScript modules; dat.GUI comes from the npm package.
 */

require("../../less/404.less");

import { startParticle404 } from "../particle404/bootstrap";

function boot(): void {
    startParticle404();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}

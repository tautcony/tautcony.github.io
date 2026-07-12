/**
 * Public entry for the particle 404 experience.
 */
import { loadConfig } from "./config";
import { mousedownLsnr, objectsInit, updateObjects } from "./scene";
import { createShell } from "./shell";

function hasCanvas(): boolean {
    try {
        return !!document.createElement("canvas").getContext("2d");
    } catch {
        return false;
    }
}

function hasWebGL(): boolean {
    try {
        const canvas = document.createElement("canvas");
        return !!(
            canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl")
        );
    } catch {
        return false;
    }
}

function canRender(useWebGL: boolean): boolean {
    if (useWebGL) {
        return hasWebGL();
    }
    return hasCanvas();
}

/**
 * Start the particle 404 scene, or leave the static HTML fallback visible.
 *
 * Flags (query string):
 *   ?webGL=true  — WebGL renderer
 *   ?perf=true   — FPS panel
 *   ?gui=true    — dat.GUI tweak panel
 */
export function startParticle404(): void {
    if (typeof THREE === "undefined") {
        console.warn("[404] THREE.js (r56) is not loaded");
        return;
    }

    const config = loadConfig();
    if (!canRender(config.useWebGL)) {
        return;
    }

    const shell = createShell(config);
    shell.setHooks({
        objectsInit,
        updateObjects,
        onCanvasMouseDown: mousedownLsnr,
    });

    const fallback = document.querySelector("#container .fallback");
    if (fallback instanceof HTMLElement) {
        fallback.style.display = "none";
    }

    shell.init();
    shell.update();
}

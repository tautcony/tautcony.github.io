/**
 * Runtime flags for the particle 404 page.
 *
 * Query string (all optional):
 *   ?webGL=true   — use WebGLRenderer instead of CanvasRenderer
 *   ?perf=true    — show FPS / frame-time panel (Stats)
 *   ?gui=true     — show dat.GUI tweak panel
 *
 * Combined example: /404.html?perf=true&gui=true
 */

function readFlag(params: URLSearchParams, name: string): boolean {
    const raw = params.get(name);
    if (raw === null) {
        return false;
    }
    // bare `?perf` or `?perf=true` / `1` / empty value all count as on
    const normalized = raw.trim().toLowerCase();
    return normalized === "" || normalized === "true" || normalized === "1" || normalized === "yes";
}

export interface Particle404Config {
    /** Prefer WebGL when true (default: canvas). */
    useWebGL: boolean;
    /** Show performance overlay. */
    showPerf: boolean;
    /** Show dat.GUI controls. */
    showGui: boolean;
}

export function loadConfig(search = window.location.search): Particle404Config {
    const params = new URLSearchParams(search);
    return {
        useWebGL: readFlag(params, "webGL") || readFlag(params, "webgl"),
        showPerf: readFlag(params, "perf"),
        showGui: readFlag(params, "gui"),
    };
}

/** Asset paths used by the particle scene. */
export const ASSETS = {
    base: "/img/404/",
    /** Resolves to /img/box_bck.png via /img/404/../box_bck.png */
    boxTexture: "../box_bck.png",
    disc: "disc.png",
    particleTr: "particle_tr.png",
} as const;

export const SCENE = {
    defaultMessage: "404",
    textSize: 60,
    particleCount: 950,
    maxRadius: 150,
    ceiling: 400,
    floor: 0,
    viewAngle: 45,
    near: 0.1,
    far: 10_000,
    cameraFollow: 0.01,
} as const;

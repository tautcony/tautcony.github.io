/**
 * Renderer / camera / main loop for the particle 404 page.
 */
import { ASSETS, SCENE, type Particle404Config } from "./config";
import { StatsPanel } from "./stats-panel";
import { cubicInOut } from "./tween";

export interface FrameHooks {
    objectsInit: () => void;
    updateObjects: () => void;
    onCanvasMouseDown: () => void;
}

export class Shell404 {
    readonly config: Particle404Config;

    /** Canvas renderer by default; WebGL when `?webGL=true`. */
    readonly canvasMode: boolean;
    readonly showLights: boolean;
    readonly showPerf: boolean;
    readonly showGui: boolean;

    showPlane = true;
    showParticles = true;
    brandBackground = true;
    skybox: boolean;
    cubeBasicMaterial = false;
    smallUnshiftedCube = false;
    canvasSettings = { particlesFromImage: false };
    backgroundCubeMoving = false;
    linePattern = false;
    linesConstructShouldRotate = false;

    WIDTH = 0;
    HEIGHT = 0;
    ASPECT = 1;
    readonly VIEW_ANGLE = SCENE.viewAngle;
    readonly NEAR = SCENE.near;
    readonly FAR = SCENE.far;
    readonly maxRadius = SCENE.maxRadius;
    readonly ceiling = SCENE.ceiling;
    readonly floor = SCENE.floor;

    origin: ThreeVector3 | null = null;
    renderer: ThreeRenderer | null = null;
    scene: ThreeObject3D | null = null;
    camera: ThreeCamera | null = null;
    projector: ThreeProjector | null = null;
    stats: StatsPanel | null = null;
    clock: ThreeClock | null = null;

    time = 0;
    deltaFrame = 0;
    mouseDown = false;
    lastMouseEvent: MouseEvent | null = null;
    mouse = { x: 0, y: 0 };

    /** Spherical camera angles: current vs target (mouse-driven). */
    adaptiveCam = {
        current: { a: 0, va: Math.PI / 2 },
        target: { a: 0, va: Math.PI / 2 },
        delta: SCENE.cameraFollow,
    };

    axises: ("x" | "y" | "z")[] = ["x", "y", "z"];

    private hooks: FrameHooks = {
        objectsInit: () => undefined,
        updateObjects: () => undefined,
        onCanvasMouseDown: () => undefined,
    };

    constructor(config: Particle404Config) {
        this.config = config;
        this.canvasMode = !config.useWebGL;
        this.showLights = !this.canvasMode;
        this.skybox = this.canvasMode;
        this.showPerf = config.showPerf;
        this.showGui = config.showGui;
    }

    setHooks(hooks: Partial<FrameHooks>): void {
        this.hooks = { ...this.hooks, ...hooks };
    }

    init(): void {
        this.bindResize();
        this.createRenderer();
        this.createCameraAndScene();
        this.bindPointerEvents();
        this.mountStatsIfNeeded();

        this.projector = new THREE.Projector();
        this.hooks.objectsInit();

        this.clock = new THREE.Clock();
        this.clock.start();
    }

    private bindResize(): void {
        window.addEventListener("resize", () => {
            this.WIDTH = window.innerWidth;
            this.HEIGHT = window.innerHeight;
            this.ASPECT = this.WIDTH / this.HEIGHT;
            this.renderer?.setSize(this.WIDTH, this.HEIGHT);
            if (this.camera) {
                this.camera.aspect = this.ASPECT;
                this.camera.updateProjectionMatrix();
            }
        });
    }

    private createRenderer(): void {
        this.origin = new THREE.Vector3(0, 0, 0);
        this.renderer = this.canvasMode
            ? new THREE.CanvasRenderer()
            : new THREE.WebGLRenderer();
        this.WIDTH = window.innerWidth;
        this.HEIGHT = window.innerHeight;
        this.renderer.setSize(this.WIDTH, this.HEIGHT);

        const container = document.getElementById("container");
        container?.appendChild(this.renderer.domElement);
    }

    private createCameraAndScene(): void {
        this.ASPECT = this.WIDTH / this.HEIGHT;
        this.camera = new THREE.PerspectiveCamera(
            this.VIEW_ANGLE,
            this.ASPECT,
            this.NEAR,
            this.FAR
        );
        this.camera.a = this.adaptiveCam.current.a;
        this.camera.va = this.adaptiveCam.current.va;
        this.camera.up = new THREE.Vector3(0, 0, -1);

        this.scene = new THREE.Scene();
        this.scene.add(this.camera);
        this.applyCamAngles();
    }

    private bindPointerEvents(): void {
        const canvas = this.renderer!.domElement;

        canvas.addEventListener("mousemove", (event: MouseEvent) => {
            this.mouse.x = event.pageX;
            this.mouse.y = event.pageY;

            const nx = this.mouse.x / window.innerWidth;
            const ny = this.mouse.y / window.innerHeight;
            const easedX = cubicInOut(nx);
            const easedY = cubicInOut(ny);

            // Map pointer to a limited spherical range around the origin.
            this.adaptiveCam.target.a = easedX * Math.PI * 0.5 - Math.PI / 4;
            this.adaptiveCam.target.va = (1 - easedY) * Math.PI * 0.5 + Math.PI / 4;
            this.lastMouseEvent = event;
        });

        canvas.addEventListener("mousedown", (event: MouseEvent) => {
            event.preventDefault();
            this.hooks.onCanvasMouseDown();
            this.mouseDown = true;
        });

        canvas.addEventListener("mouseup", () => {
            this.mouseDown = false;
        });
    }

    private mountStatsIfNeeded(): void {
        if (!this.showPerf) {
            return;
        }
        this.stats = new StatsPanel();
        document.getElementById("container")?.appendChild(this.stats.dom);
    }

    applyCamAngles(): void {
        const camera = this.camera!;
        const origin = this.origin!;
        camera.position.x =
            Math.sin(camera.a) * Math.sin(camera.va) * this.ceiling;
        camera.position.y =
            Math.cos(camera.a) * Math.sin(camera.va) * this.ceiling;
        camera.position.z = Math.cos(camera.va) * this.ceiling;
        camera.lookAt(origin);
    }

    update = (): void => {
        const elapsed = this.clock!.getElapsedTime();
        this.deltaFrame = Math.round(1000 * (elapsed - this.time));
        this.time = elapsed;

        this.hooks.updateObjects();

        const camera = this.camera!;
        const { current, target, delta } = this.adaptiveCam;
        // Keep camera.a/va and adaptiveCam.current in sync for clarity.
        camera.a += (target.a - camera.a) * delta;
        camera.va += (target.va - camera.va) * delta;
        current.a = camera.a;
        current.va = camera.va;
        this.applyCamAngles();

        this.stats?.update();
        this.renderer!.render(this.scene!, camera);
        requestAnimFrame(this.update);
    };

    dRange(extent: number): number {
        return -extent + Math.random() * extent * 2;
    }

    range(min: number, max: number): number {
        return min + Math.random() * (max - min);
    }

    randNeg(): number {
        return Math.random() > 0.5 ? 1 : -1;
    }

    /** Absolute URL helper for 404 assets. */
    asset(path: string): string {
        return ASSETS.base + path;
    }
}

export const requestAnimFrame: (cb: FrameRequestCallback) => number = (() =>
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    ((callback: FrameRequestCallback) =>
        window.setTimeout(callback, 1000 / 60) as unknown as number)
)();

/** Filled by bootstrap after config is known. */
export let shell404: Shell404;

export function createShell(config: Particle404Config): Shell404 {
    shell404 = new Shell404(config);
    return shell404;
}

import {
    AdditiveBlending,
    BackSide,
    BoxGeometry,
    BufferAttribute,
    BufferGeometry,
    CanvasTexture,
    Color,
    DoubleSide,
    LinearFilter,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    Points,
    PointsMaterial,
    Raycaster,
    Scene,
    SRGBColorSpace,
    TextureLoader,
    Vector2,
    Vector3,
    WebGLRenderer,
} from "three";
import { mountGui } from "./gui";
import { StatsPanel } from "./stats-panel";
import { Tween, cubicInOut } from "./tween";

const PARTICLE_COUNT = 950;
const TEXT_SIZE = 60;
const MAX_RADIUS = 150;
const CEILING = 400;
const FLOOR = 0;
const VIEW_ANGLE = 45;
const CAMERA_FOLLOW = 0.01;
const REFERENCE_FRAME_MS = 1000 / 60;
const ORBIT_AXIS_MIN = 1;
const ORBIT_AXIS_MAX = 2.5;
const PARTICLE_SPEED = 2;
const ORBIT_DELAY_MAX_MS = 200 / PARTICLE_SPEED;
const ORBIT_DURATION_MS = 1000 / PARTICLE_SPEED;
const PARTICLE_SIZE = 4 / Math.tan((VIEW_ANGLE * Math.PI) / 360);
const PARTICLE_TEXTURE_SIZE = 64;
const EXPLOSION_MAX_POWER = 10;
const EXPLOSION_MIN_POWER = 3;
const EXPLOSION_MAX_DISTANCE = 50;
let explosionPoint: Vector3 | false = false;

interface InitialPosition {
    x: number;
    y: number;
    z: number;
}

interface ParticleState {
    position: Vector3;
    velocity: Vector3;
    color: Color;
    initial: InitialPosition;
    tween?: Tween;
}

interface MaskState {
    data: number[];
    width: number;
    height: number;
    max: number;
    halfDeltaWidth: number;
    halfDeltaHeight: number;
    halfCell: number;
}

const guiDefaults = {
    seedColor: [200, 0, 0],
    sideColor: [11, 10, 27],
    background: [30, 30, 30],
    pointColor: [153, 255, 255],
    ambientColor: [255, 153, 255],
    message: "404",
    explode: () => {
        explosionPoint = new Vector3(0, 0, 0);
    },
};

function range(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

function dRange(extent: number): number {
    return -extent + Math.random() * extent * 2;
}

function createMask(text: string): MaskState | null {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = TEXT_SIZE;
    const context = canvas.getContext("2d");
    if (!context) return null;

    const font = `${TEXT_SIZE}px arial`;
    context.font = font;
    canvas.width = Math.max(1, Math.ceil(context.measureText(text).width));
    context.font = font;
    context.textBaseline = "bottom";
    context.fillText(text, 0, TEXT_SIZE);

    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const max = Math.max(image.width, image.height);
    const data: number[] = [];
    for (let x = 0; x < image.width; x++) {
        for (let y = 0; y < image.height; y++) {
            const index = x + image.width * y;
            data[index] = image.data[index * 4 + 3];
        }
    }

    return {
        data,
        width: image.width,
        height: image.height,
        max,
        halfDeltaWidth: (max - image.width) / 2,
        halfDeltaHeight: (max - image.height) / 2,
        halfCell: (2 * MAX_RADIUS) / max / 2,
    };
}

function setParticleToRandomMaskPixel(
    particle: ParticleState,
    mask: MaskState
): void {
    let pixelIndex: number;
    do {
        pixelIndex = Math.floor(Math.random() * mask.data.length);
    } while (255 * Math.random() > mask.data[pixelIndex]);

    const row = Math.floor(pixelIndex / mask.width);
    const column = pixelIndex % mask.width;
    particle.initial.x =
        ((column + mask.halfDeltaWidth + 0.5) / mask.max) * 2 - 1;
    particle.initial.x *= MAX_RADIUS;
    particle.initial.x += range(-mask.halfCell, mask.halfCell);
    particle.initial.z =
        ((row + mask.halfDeltaHeight + 0.5) / mask.max) * 2 - 1;
    particle.initial.z *= MAX_RADIUS;
    particle.initial.z += range(-mask.halfCell, mask.halfCell);
}

function applyOrbit(particle: ParticleState, axes: { a: Vector3; b: Vector3 }, state: { ang: number }): void {
    const { position, initial } = particle;
    const cos = Math.cos(state.ang);
    const sin = Math.sin(state.ang);
    position.x = initial.x + cos * axes.a.x + sin * axes.b.x - axes.a.x;
    position.y = initial.y + cos * axes.a.y + sin * axes.b.y - axes.a.y;
    position.z = initial.z + cos * axes.a.z + sin * axes.b.z - axes.a.z;
}

function attachOrbitTween(particle: ParticleState): void {
    let orbitRadius = 30;
    const orbitAxes = { a: new Vector3(), b: new Vector3() };
    const orbitState = { ang: 0 };

    const restart = () => {
        orbitState.ang = 0;
        orbitRadius = range(ORBIT_AXIS_MIN, ORBIT_AXIS_MAX);
        for (const name of ["a", "b"] as const) {
            for (const axis of ["x", "y", "z"] as const) {
                orbitAxes[name][axis] = dRange(orbitRadius);
            }
        }
    };

    restart();
    particle.tween = Tween.get(orbitState, { loop: true })
        .wait(ORBIT_DELAY_MAX_MS * Math.random())
        .to({ ang: 2 * Math.PI }, ORBIT_DURATION_MS);
    particle.tween.addEventListener("change", () => {
        applyOrbit(particle, orbitAxes, orbitState);
    });
}

function resetParticle(particle: ParticleState): void {
    particle.position.x = particle.initial.x;
    particle.position.z = particle.initial.z;
    particle.position.y = FLOOR;
    particle.velocity.set(0, 0, 0);
    if (particle.tween) {
        particle.tween.setPaused(false);
    } else {
        attachOrbitTween(particle);
    }
}

function mixRgb(channel: number, radialNorm: number): number {
    return (
        guiDefaults.seedColor[channel] * (1 - radialNorm) +
        guiDefaults.sideColor[channel] * radialNorm
    ) / 255;
}

function createParticleTexture(): CanvasTexture | null {
    const canvas = document.createElement("canvas");
    canvas.width = PARTICLE_TEXTURE_SIZE;
    canvas.height = PARTICLE_TEXTURE_SIZE;
    const context = canvas.getContext("2d");
    if (!context) return null;

    const radius = PARTICLE_TEXTURE_SIZE / 2;
    context.fillStyle = "#fff";
    context.beginPath();
    context.arc(radius, radius, radius, 0, 2 * Math.PI);
    context.fill();

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.generateMipmaps = false;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    return texture;
}

function hasFlag(name: string): boolean {
    const value = new URLSearchParams(window.location.search).get(name);
    if (value === null) return false;
    return ["", "1", "true", "yes"].includes(value.trim().toLowerCase());
}

export function init(): void {
    const container = document.getElementById("container");
    const fallback = container?.querySelector<HTMLElement>(".fallback");
    if (!container || !fallback) return;

    let renderer: WebGLRenderer;
    try {
        renderer = new WebGLRenderer({ antialias: true });
    } catch {
        return;
    }

    renderer.setPixelRatio(window.devicePixelRatio || 1);
    const setBackgroundColor = (rgb = guiDefaults.background) => {
        renderer.setClearColor(
            (rgb[0] << 16) | (rgb[1] << 8) | rgb[2],
            1
        );
    };
    setBackgroundColor();
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(VIEW_ANGLE, 1, 0.1, 10000);
    camera.up.set(0, 0, -1);
    const origin = new Vector3();
    let width = window.innerWidth;
    let height = Math.max(1, window.innerHeight);
    let cameraAngle = 0;
    let cameraVerticalAngle = Math.PI / 2;
    let targetAngle = 0;
    let targetVerticalAngle = Math.PI / 2;

    const resize = () => {
        width = window.innerWidth;
        height = Math.max(1, window.innerHeight);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const backgroundTexture = new TextureLoader().load("/img/box_bck.png");
    backgroundTexture.colorSpace = SRGBColorSpace;
    const background = new Mesh(
        new BoxGeometry(10000, 10000, 10000),
        new MeshBasicMaterial({ map: backgroundTexture, side: BackSide })
    );
    background.position.y += CEILING;
    scene.add(background);

    let mask = createMask(guiDefaults.message);
    if (!mask) {
        renderer.dispose();
        renderer.domElement.remove();
        return;
    }

    const particles: ParticleState[] = [];
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const particle: ParticleState = {
            position: new Vector3(),
            velocity: new Vector3(),
            color: new Color(0xff0000),
            initial: { x: 0, y: 0, z: 0 },
        };
        setParticleToRandomMaskPixel(particle, mask);
        resetParticle(particle);
        particles.push(particle);
        positions[i * 3] = particle.position.x;
        positions[i * 3 + 1] = particle.position.y;
        positions[i * 3 + 2] = particle.position.z;
        colors[i * 3] = particle.color.r;
        colors[i * 3 + 1] = particle.color.g;
        colors[i * 3 + 2] = particle.color.b;
    }

    const geometry = new BufferGeometry();
    const positionAttribute = new BufferAttribute(positions, 3);
    const colorAttribute = new BufferAttribute(colors, 3);
    geometry.setAttribute("position", positionAttribute);
    geometry.setAttribute("color", colorAttribute);
    const disc = createParticleTexture();
    if (!disc) {
        geometry.dispose();
        backgroundTexture.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        return;
    }
    const material = new PointsMaterial({
        size: PARTICLE_SIZE,
        sizeAttenuation: false,
        vertexColors: true,
        blending: AdditiveBlending,
        map: disc,
        transparent: true,
        depthTest: false,
        depthWrite: false,
    });
    const pointCloud = new Points(geometry, material);
    scene.add(pointCloud);

    const stats = hasFlag("perf") ? new StatsPanel() : null;
    if (stats) container.appendChild(stats.dom);
    if (hasFlag("gui")) {
        mountGui(guiDefaults, {
            onMessageChange: message => {
                const nextMask = createMask(message);
                if (!nextMask) return;
                mask = nextMask;
                for (const particle of particles) {
                    setParticleToRandomMaskPixel(particle, mask);
                    resetParticle(particle);
                }
            },
            onPointColorChange: () => undefined,
            onAmbientColorChange: () => undefined,
            onBackgroundChange: rgb => setBackgroundColor(rgb),
        });
    }

    const ground = new Mesh(
        new PlaneGeometry(8 * MAX_RADIUS, 8 * MAX_RADIUS),
        new MeshBasicMaterial({
            color: 0x0000ff,
            transparent: true,
            opacity: 0,
            side: DoubleSide,
        })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const mouse = { x: 0, y: 0 };
    const raycaster = new Raycaster();
    const onMouseMove = (event: MouseEvent) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        const nx = mouse.x / width;
        const ny = mouse.y / height;
        const easedX = cubicInOut(nx);
        const easedY = cubicInOut(ny);
        targetAngle = easedX * Math.PI * 0.5 - Math.PI / 4;
        targetVerticalAngle = (1 - easedY) * Math.PI * 0.5 + Math.PI / 4;
    };
    const onMouseDown = (event: MouseEvent) => {
        event.preventDefault();
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        const ndc = new Vector2(
            (mouse.x / width) * 2 - 1,
            -((mouse.y / height) * 2 - 1)
        );
        raycaster.setFromCamera(ndc, camera);
        const hit = raycaster.intersectObject(ground, false)[0];
        if (hit) explosionPoint = hit.point.clone();
    };
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mousedown", onMouseDown);

    const applyCameraAngles = () => {
        camera.position.x =
            Math.sin(cameraAngle) * Math.sin(cameraVerticalAngle) * CEILING;
        camera.position.y =
            Math.cos(cameraAngle) * Math.sin(cameraVerticalAngle) * CEILING;
        camera.position.z = Math.cos(cameraVerticalAngle) * CEILING;
        camera.lookAt(origin);
    };
    applyCameraAngles();

    let animationFrame = 0;
    let previousTime = performance.now();
    const animate = (now: number) => {
        animationFrame = requestAnimationFrame(animate);
        const elapsed = (now - previousTime) / 1000;
        previousTime = now;
        const deltaFrame = Math.round(elapsed * 1000);

        for (let i = PARTICLE_COUNT - 1; i >= 0; i--) {
            const particle = particles[i];
            const { position, velocity } = particle;
            const planarDistance = Math.hypot(position.x, position.z);
            if (planarDistance > 3 * MAX_RADIUS) resetParticle(particle);

            const radialNorm = Math.hypot(
                position.x / MAX_RADIUS,
                position.z / MAX_RADIUS
            );
            position.add(velocity);

            if (explosionPoint) {
                const angle = Math.atan2(
                    position.z - explosionPoint.z,
                    position.x - explosionPoint.x
                );
                const distance = Math.hypot(
                    position.z - explosionPoint.z,
                    position.x - explosionPoint.x
                );
                if (distance < EXPLOSION_MAX_DISTANCE) {
                    const power =
                        (EXPLOSION_MAX_POWER - EXPLOSION_MIN_POWER) *
                            (1 - distance / EXPLOSION_MAX_DISTANCE) +
                        EXPLOSION_MIN_POWER;
                    velocity.x = power * Math.cos(angle);
                    velocity.z = power * Math.sin(angle);
                    particle.tween?.setPaused(true);
                }
            }
            particle.color.setRGB(
                mixRgb(0, radialNorm),
                mixRgb(1, radialNorm),
                mixRgb(2, radialNorm),
                SRGBColorSpace
            );
        }

        explosionPoint = false;
        Tween.tick(deltaFrame, false);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const particle = particles[i];
            positions[i * 3] = particle.position.x;
            positions[i * 3 + 1] = particle.position.y;
            positions[i * 3 + 2] = particle.position.z;
            colors[i * 3] = particle.color.r;
            colors[i * 3 + 1] = particle.color.g;
            colors[i * 3 + 2] = particle.color.b;
        }
        positionAttribute.needsUpdate = true;
        colorAttribute.needsUpdate = true;

        const follow = 1 - Math.pow(
            1 - CAMERA_FOLLOW,
            deltaFrame / REFERENCE_FRAME_MS
        );
        cameraAngle += (targetAngle - cameraAngle) * follow;
        cameraVerticalAngle +=
            (targetVerticalAngle - cameraVerticalAngle) * follow;
        applyCameraAngles();
        stats?.update();
        renderer.render(scene, camera);
    };

    fallback.style.display = "none";
    animate(performance.now());

    window.addEventListener("pagehide", () => {
        cancelAnimationFrame(animationFrame);
        window.removeEventListener("resize", resize);
        renderer.domElement.removeEventListener("mousemove", onMouseMove);
        renderer.domElement.removeEventListener("mousedown", onMouseDown);
        geometry.dispose();
        material.dispose();
        disc.dispose();
        backgroundTexture.dispose();
        renderer.dispose();
    }, { once: true });
}

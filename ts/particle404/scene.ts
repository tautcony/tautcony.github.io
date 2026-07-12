/**
 * Scene content: lights, particles, optional GUI, click-to-explode.
 */
import { ASSETS, SCENE } from "./config";
import { mountGui } from "./gui";
import { particlesMask } from "./mask";
import { shell404 } from "./shell";
import { Tween } from "./tween";
import type { GuiSettings, Particle, ParticleSystemState } from "./types";

let explosionPoint: ThreeVector3 | false = false;

export const guiSettings: GuiSettings = {
    seedColor: [200, 0, 0],
    sideColor: [11, 10, 27],
    message: SCENE.defaultMessage,
    background: [30, 30, 30],
    pointColor: [153, 255, 255],
    ambientColor: [255, 153, 255],
    explode() {
        explosionPoint = new THREE.Vector3(0, 0, 0);
    },
};

// ---------------------------------------------------------------------------
// Lights
// ---------------------------------------------------------------------------

function rgbToThreeColor(rgb: number[]): ThreeColor {
    return new THREE.Color().setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
}

const lights = {
    point: null as ThreeLight | null,
    ambient: null as ThreeLight | null,

    init() {
        lights.point = new THREE.PointLight(0xffffff, 1);
        lights.point.position.set(0, 400, 0);
        shell404.scene!.add(lights.point);

        lights.ambient = new THREE.AmbientLight(0xffffff);
        lights.update();
        shell404.scene!.add(lights.ambient);
    },

    update() {
        if (!lights.point || !lights.ambient) {
            return;
        }
        lights.point.color = rgbToThreeColor(guiSettings.pointColor);
        lights.ambient.color = rgbToThreeColor(guiSettings.ambientColor);
    },
};

function setBackgroundColor(rgb: number[] = guiSettings.background): void {
    const color = rgbToThreeColor(rgb);
    shell404.renderer!.setClearColorHex(color.getHex(), 1);
}

// ---------------------------------------------------------------------------
// Particle orbit tween
// ---------------------------------------------------------------------------

function attachOrbitTween(particle: Particle): void {
    let orbitRadius = 30;
    const orbitAxes = {
        a: new THREE.Vector3(),
        b: new THREE.Vector3(),
    };
    const orbitState = { ang: 0 };

    const randomizeAxes = () => {
        for (const name of ["a", "b"] as const) {
            for (const axis of shell404.axises) {
                orbitAxes[name][axis] = shell404.dRange(orbitRadius);
            }
        }
    };

    const restart = () => {
        orbitState.ang = 0;
        orbitRadius = shell404.range(1, 2.5);
        randomizeAxes();
    };

    const applyOrbit = () => {
        const { position, initial } = particle;
        const cos = Math.cos(orbitState.ang);
        const sin = Math.sin(orbitState.ang);
        position.x = initial.x + cos * orbitAxes.a.x + sin * orbitAxes.b.x - orbitAxes.a.x;
        position.y = initial.y + cos * orbitAxes.a.y + sin * orbitAxes.b.y - orbitAxes.a.y;
        position.z = initial.z + cos * orbitAxes.a.z + sin * orbitAxes.b.z - orbitAxes.a.z;
    };

    restart();
    particle.tween = Tween.get(orbitState, { loop: true })
        .wait(200 * Math.random())
        .to({ ang: 2 * Math.PI }, 1000);
    particle.tween.addEventListener("change", applyOrbit);
}

export function resetParticle(particle: Particle): void {
    particle.position.x = particle.initial.x;
    particle.position.z = particle.initial.z;
    particle.position.y = shell404.floor;
    particle.velocity.set(0, 0, 0);
    if (particle.tween) {
        particle.tween.setPaused(false);
    } else {
        attachOrbitTween(particle);
    }
}

// ---------------------------------------------------------------------------
// Ground plane + brand skybox cube
// ---------------------------------------------------------------------------

function createInvisiblePlane(): void {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(8 * shell404.maxRadius, 8 * shell404.maxRadius),
        new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            transparent: true,
            opacity: 0,
        })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.overdraw = true;
    shell404.scene!.add(mesh);
}

const brandBackground = {
    object: null as ThreeMesh | null,

    init() {
        const cubeSize = shell404.smallUnshiftedCube ? 100 : 10_000;
        const boxUrl = shell404.asset(ASSETS.boxTexture);

        if (shell404.skybox) {
            brandBackground.object = createSkyboxCube(cubeSize, boxUrl);
        } else {
            const texture = THREE.ImageUtils.loadTexture(boxUrl);
            const material = shell404.cubeBasicMaterial
                ? new THREE.MeshBasicMaterial({
                    depthWrite: true,
                    map: texture,
                    side: THREE.DoubleSide,
                })
                : new THREE.MeshPhongMaterial({
                    depthWrite: true,
                    map: texture,
                    side: THREE.DoubleSide,
                });
            brandBackground.object = new THREE.Mesh(
                new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize),
                material
            );
        }

        if (!shell404.smallUnshiftedCube) {
            brandBackground.object.position.y += shell404.ceiling;
        }
        shell404.scene!.add(brandBackground.object);
    },

    update() {
        if (!shell404.backgroundCubeMoving || !brandBackground.object) {
            return;
        }
        const t = 0.00005 * shell404.time;
        brandBackground.object.rotation.x = Math.sin(t) * Math.PI;
        brandBackground.object.rotation.y = Math.cos(t) * Math.PI;
    },
};

function createSkyboxCube(cubeSize: number, faceUrl: string): ThreeMesh {
    const placeholder = document.createElement("canvas");
    placeholder.width = 128;
    placeholder.height = 128;
    const ctx = placeholder.getContext("2d");
    if (ctx) {
        ctx.fillStyle = "rgb(200,200,200)";
        ctx.fillRect(0, 0, 128, 128);
    }

    const makeFace = (src: string): ThreeMaterial => {
        const texture = new THREE.Texture(placeholder);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            overdraw: true,
        });
        const image = new Image();
        image.onload = function onLoad(this: HTMLImageElement) {
            texture.needsUpdate = true;
            if (material.map) {
                material.map.image = this;
            }
        };
        image.src = src;
        return material;
    };

    const faces = Array.from({ length: 6 }, () => makeFace(faceUrl));
    const mesh = new THREE.Mesh(
        new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize, 7, 7, 7),
        new THREE.MeshFaceMaterial(faces)
    );
    mesh.scale.x = -1;
    return mesh;
}

// ---------------------------------------------------------------------------
// Particles
// ---------------------------------------------------------------------------

function createParticle(index: number): Particle {
    return {
        index,
        position: new THREE.Vector3(0, 0, 0),
        velocity: new THREE.Vector3(0, 0, 0),
        color: new THREE.Color(0xff0000),
        initial: { x: 0, y: 0, z: 0 },
    };
}

export const particles: ParticleSystemState = {
    count: SCENE.particleCount,
    geometry: undefined,
    mat: undefined,
    threeObject: undefined,
    plainArray: [],
    canvasMode: false, // set in init from shell
    explodeParameters: {
        max: { pow: 10, dist: 50 },
        min: { pow: 3 },
    },

    getVelocity(index) {
        return particles.geometry!.vertices[index];
    },

    getParticlePosition(index) {
        return particles.canvasMode
            ? particles.plainArray[index].position
            : particles.geometry!.vertices[index];
    },

    mixRGB(channel, t) {
        const value =
            guiSettings.seedColor[channel] * (1 - t) +
            guiSettings.sideColor[channel] * t;
        return value / 255;
    },

    init() {
        particles.canvasMode = shell404.canvasMode;
        THREE.ImageUtils.loadTexture(shell404.asset(ASSETS.particleTr));
        const discTexture = THREE.ImageUtils.loadTexture(shell404.asset(ASSETS.disc));

        particles.plainArray = new Array(particles.count);
        let imageMaterial: ThreeMaterial | undefined;
        let createCanvasMaterial: ((p: Particle) => ThreeMaterial) | undefined;

        if (particles.canvasMode) {
            imageMaterial = new THREE.ParticleBasicMaterial({
                size: 0.1,
                vertexColors: true,
                color: 0xff0000,
                blending: THREE.AdditiveBlending,
                map: discTexture,
                transparent: true,
            });

            const fullCircle = 2 * Math.PI;
            const makeProgram = (particle: Particle) =>
                (ctx: CanvasRenderingContext2D) => {
                    ctx.globalCompositeOperation = "lighter";
                    ctx.fillStyle = `rgb(${Math.floor(256 * particle.color.r)},${Math.floor(256 * particle.color.g)},${Math.floor(256 * particle.color.b)})`;
                    ctx.beginPath();
                    ctx.arc(0, 0, 2, 0, fullCircle, true);
                    ctx.closePath();
                    ctx.fill();
                };

            createCanvasMaterial = particle =>
                new THREE.ParticleCanvasMaterial({ program: makeProgram(particle) });
        } else {
            particles.geometry = new THREE.Geometry();
            particles.geometry.colors = [];
            particles.mat = new THREE.ParticleBasicMaterial({
                size: 10,
                vertexColors: true,
                blending: THREE.AdditiveBlending,
                map: discTexture,
                transparent: true,
            });
        }

        for (let i = 0; i < particles.count; i++) {
            const particle = createParticle(i);
            particles.plainArray[i] = particle;

            if (particles.canvasMode) {
                const visual = new THREE.Particle(
                    shell404.canvasSettings.particlesFromImage
                        ? imageMaterial!
                        : createCanvasMaterial!(particle)
                );
                particle.position = visual.position;
                shell404.scene!.add(visual);
                particle.color = new THREE.Color(0xff0000);
            } else {
                const vertex = new THREE.Vector3(0, 0, 0);
                particle.position = vertex;
                particles.geometry!.vertices.push(vertex);
                particle.color = particles.geometry!.colors[i] = new THREE.Color(0xff0000);
            }

            particle.velocity = new THREE.Vector3(0, 0, 0);
            particle.initial = { x: 0, y: 0, z: 0 };
            resetParticle(particle);
        }

        if (!particles.canvasMode) {
            particles.threeObject = new THREE.ParticleSystem(
                particles.geometry!,
                particles.mat!
            );
            particles.threeObject.sortParticles = true;
            shell404.scene!.add(particles.threeObject);
        }

        particlesMask.initParticlesFromString(SCENE.defaultMessage, particles);
    },

    update() {
        if (!particles.plainArray.length) {
            return;
        }

        let i = particles.count;
        while (i--) {
            const particle = particles.plainArray[i];
            const { position, velocity } = particle;

            const planarDistance = Math.hypot(position.x, position.z);
            if (planarDistance > 3 * shell404.maxRadius) {
                resetParticle(particle);
            }

            const radialNorm = Math.hypot(
                position.x / shell404.maxRadius,
                position.z / shell404.maxRadius
            );

            position.add(velocity);

            if (explosionPoint) {
                applyExplosion(particle, explosionPoint);
            }

            particle.color.setRGB(
                particles.mixRGB(0, radialNorm),
                particles.mixRGB(1, radialNorm),
                particles.mixRGB(2, radialNorm)
            );
        }

        if (!particles.canvasMode && particles.threeObject) {
            particles.threeObject.geometry.__dirtyVertices = true;
            particles.threeObject.geometry.colorsNeedUpdate = true;
        }
    },
};

function applyExplosion(particle: Particle, center: ThreeVector3): void {
    const { position, velocity } = particle;
    const angle = Math.atan2(position.z - center.z, position.x - center.x);
    const dist = Math.hypot(position.z - center.z, position.x - center.x);
    const { max, min } = particles.explodeParameters;

    if (dist >= max.dist) {
        return;
    }

    const power =
        (max.pow - min.pow) * (1 - dist / max.dist) + min.pow;
    velocity.x = power * Math.cos(angle);
    velocity.z = power * Math.sin(angle);
    particle.tween?.setPaused(true);
}

// ---------------------------------------------------------------------------
// Lifecycle hooks (wired from bootstrap → shell)
// ---------------------------------------------------------------------------

export function objectsInit(): void {
    particlesMask.setResetParticle(resetParticle);

    if (shell404.showLights) {
        lights.init();
    }

    if (shell404.showGui) {
        mountGui(guiSettings, {
            onMessageChange: message => {
                particlesMask.initParticlesFromString(message, particles);
            },
            onPointColorChange: () => lights.update(),
            onAmbientColorChange: () => lights.update(),
            onBackgroundChange: rgb => setBackgroundColor(rgb),
        });
    }

    if (shell404.showPlane) {
        createInvisiblePlane();
    }
    if (shell404.showParticles) {
        particles.init();
    }

    setBackgroundColor();

    if (shell404.brandBackground) {
        brandBackground.init();
    }
}

export function updateObjects(): void {
    particles.update();
    if (shell404.brandBackground) {
        brandBackground.update();
    }
    explosionPoint = false;
    Tween.tick(shell404.deltaFrame, false);
}

export function mousedownLsnr(): void {
    const ndcX = (shell404.mouse.x / window.innerWidth) * 2 - 1;
    const ndcY = -((shell404.mouse.y / window.innerHeight) * 2 - 1);

    const vector = new THREE.Vector3(ndcX, ndcY, 1);
    shell404.projector!.unprojectVector(vector, shell404.camera!);

    const direction = vector.sub(shell404.camera!.position).normalize();
    const raycaster = new THREE.Raycaster(shell404.camera!.position, direction);
    const hits = raycaster.intersectObjects(shell404.scene!.children);

    if (hits.length > 0) {
        explosionPoint = hits[0].point;
    }
}

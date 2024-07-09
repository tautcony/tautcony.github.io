/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-underscore-dangle */
import * as THREE from "three";
import throttle from "lodash/throttle";
import fill from "lodash/fill";
import random from "lodash/random";
import flattenDepth from "lodash/flattenDepth";

const particleUrl = "/arknights/static/particle.7ff7f9a6de6e31926ddb.png";
const fireflyUrl = "/arknights/static/firefly.5ec707a0de1eca4a0765.png";

interface FireFlyStruct {
    x: number;
    y: number;
    z: number;
    opacity: number;
    size: number;
    speed: number;
    life: number;
    aPosition: Float32Array;
    aOpacity: Float32Array;
}

interface TransformStruct {
    x: number;
    y: number;
    sc: number;
    pointSize?: number;
}

// Be
class AnimationHandler {
    private queue: ((ts: number) => void)[] = [];
    private fps: number = 61;
    private rafId: number = NaN;
    private lastUpdated: number = NaN;

    public add(handler: ((ts: number) => void)) {
        if (this.queue.indexOf(handler) < 0) {
            this.queue.push(handler);
        }
        return this;
    }
    public remove(handler: ((ts: number) => void)) {
        const e = this.queue.indexOf(handler);
        if (e >= 0) {
            this.queue.splice(e, 1);
        }
        return this;
    }
    public update(ts: number) {
        if (!this.lastUpdated || ts - this.lastUpdated > 1e3 / this.fps) {
            this.lastUpdated = ts;
            for (const handler of this.queue) {
                handler(ts);
            }
        }
        this.rafId = window.requestAnimationFrame(this.update.bind(this));
    }
    public init() {
        this.rafId = window.requestAnimationFrame(this.update.bind(this));
        return this;
    }
    public destroy() {
        window.cancelAnimationFrame(this.rafId);
    }
}
const animationHandler = new AnimationHandler();

// Ue
class ResizeHandler {
    private queue: (() => void)[] = [];
    public init() {
        window.addEventListener(
            "resize",
            throttle(() => {
                for (const handler of this.queue) {
                    handler();
                }
            })
        );
        return this;
    }
    public add(handler: () => void) {
        if (this.queue.indexOf(handler) < 0) {
            this.queue.push(handler);
        }
        return this;
    }
    public remove(handler: () => void) {
        const e = this.queue.indexOf(handler);
        if (e >= 0) {
            this.queue.splice(e, 1);
        }
        return this;
    }
}
const resizeHandler = new ResizeHandler();

// He
class ResponsiveModeHandler {
    public mode: "desktop" | "phone" = "desktop";
    private queue: ((mode?: string) => void)[] = [];
    private widthThrottle: number = 430;

    public init() {
        this.mode = window.innerWidth > this.widthThrottle ? "desktop" : "phone";
        resizeHandler.add(() => {
            const r = window.innerWidth;
            let updated = false;
            if (r > this.widthThrottle && this.mode === "phone") {
                this.mode = "desktop";
                updated = true;
            } else if (r <= this.widthThrottle && this.mode === "desktop") {
                this.mode = "phone";
                updated = true;
            }
            if (updated) {
                for (const handler of this.queue) {
                    handler(this.mode);
                }
            }
        });
        return this;
    }
    public add(handler: (mode?: string) => void) {
        if (this.queue.indexOf(handler) < 0) {
            this.queue.push(handler);
        }
        return this;
    }
    public remove(handler: (mode?: string) => void) {
        const e = this.queue.indexOf(handler);
        if (e >= 0) {
            this.queue.splice(e, 1);
        }
        return this;
    }
}
const responsiveModeHandler = new ResponsiveModeHandler();

// Li
class WebglContainer {
    private static _instance: WebglContainer;

    public canvas: HTMLCanvasElement;
    public scene: THREE.Scene = new THREE.Scene();
    public camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
    public renderer: THREE.WebGLRenderer;
    public fitViewport: () => void;
    public update: () => void;

    public constructor() {
        this.fitViewport = throttle(() => {
            if (this.canvas.width !== this.resoluteWidth || this.canvas.height !== this.resoluteHeight) {
                this.renderer.setSize(this.resoluteWidth, this.resoluteHeight, false);
                this.camera.near = 110;
                this.camera.far = 1e3;
                this.camera.aspect = this.width / this.height;
                this.camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(this.height / 2 / 160));
                this.camera.updateProjectionMatrix();
                this.camera.position.set(0, 0, 160);
                this.camera.lookAt(0, 0, 0);
            }
        });
        this.update = () => {
            this.fitViewport();
            this.renderer.render(this.scene, this.camera);
        };
        this.canvas = document.getElementById("webgl") as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error("no webgl canvas");
        }
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true,
        });
        animationHandler.add(this.update);
    }

    public static get instance() {
        if (!WebglContainer._instance) {
            WebglContainer._instance = new WebglContainer();
        }
        return WebglContainer._instance;
    }

    public get width() {
        return this.canvas.clientWidth;
    }
    public get height() {
        return this.canvas.clientHeight;
    }
    public get resoluteWidth() {
        return responsiveModeHandler.mode === "desktop"
            ? this.canvas.clientWidth
            : Math.round(this.canvas.clientWidth * window.devicePixelRatio);
    }
    public get resoluteHeight() {
        return responsiveModeHandler.mode === "desktop"
            ? this.canvas.clientHeight
            : Math.round(this.canvas.clientHeight * window.devicePixelRatio);
    }
    public stop() {
        animationHandler.remove(this.update);
    }
}

// gl
class FireFlyLoader {
    private static _instance: FireFlyLoader;
    public update: () => void;
    public points: FireFlyStruct[];
    public globalOpacity: number = 0;
    public aPosition: THREE.BufferAttribute;
    public aOpacity: THREE.BufferAttribute;

    public constructor(cnt: number = 20) {
        const randX = () => (Math.random() - 0.5) * (0.9 * WebglContainer.instance.width);
        const randY = () => (Math.random() - 2.5) * (0.2 * WebglContainer.instance.height);
        const randZ = () => random(-200, 200);
        const randLife = () => random(60, 1200);

        this.update = () => {
            for (const point of this.points) {
                if (point.life--) {
                    point.y += point.speed;
                    if (point.life < 30) {
                        point.opacity += 0.1 * (0 - point.opacity);
                    } else {
                        point.opacity += 0.1 * (this.globalOpacity - point.opacity);
                    }
                } else {
                    point.x = randX();
                    point.y = randY();
                    point.z = randZ();
                    point.life = randLife();
                    point.opacity = 0;
                }
                point.aPosition.set([point.x, point.y, point.z]);
                point.aOpacity.set([point.opacity]);
            }
            this.aPosition.needsUpdate = true;
            this.aOpacity.needsUpdate = true;
        };
        const fireFlyArray = fill(new Array(cnt), 0);
        const opacityBuffer = Float32Array.from(fireFlyArray);
        const positionBuffer = Float32Array.from(flattenDepth(fireFlyArray.map(() => [randX(), randY(), randZ()]), 1));
        this.aPosition = new THREE.BufferAttribute(positionBuffer, 3);
        this.aOpacity = new THREE.BufferAttribute(opacityBuffer, 1);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", this.aPosition);
        geo.setAttribute("opacity", this.aOpacity);
        this.points = fireFlyArray.map((_value, index) => ({
            x: positionBuffer[3 * index],
            y: positionBuffer[3 * index + 1],
            z: positionBuffer[3 * index + 2],
            opacity: opacityBuffer[index],
            size: 2,
            speed: 0.1 * random(4, 8),
            life: randLife(),
            aPosition: positionBuffer.subarray(3 * index, 3 * index + 3),
            aOpacity: opacityBuffer.subarray(index, index + 1),
        }));
        new THREE.TextureLoader().load(fireflyUrl, t => {
            const shaderMaterial = new THREE.ShaderMaterial({
                uniforms: { uTexture: new THREE.Uniform(t) },
                vertexShader: `
                attribute float opacity;
                varying float vOpacity;
                void main() {
                    vOpacity = opacity;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = 7.0;
                    gl_Position = projectionMatrix * mvPosition;
                }
                `,
                fragmentShader: `
                uniform sampler2D uTexture;
                varying float vOpacity;
                void main() {
                    vec4 texture = texture2D(uTexture, gl_PointCoord.xy);
                    gl_FragColor = vec4(texture.rgb, texture.a * vOpacity);
                }
                `,
                transparent: true,
                depthTest: false,
            });
            const points = new THREE.Points(geo, shaderMaterial);
            WebglContainer.instance.scene.add(points);
            this.fire();
        });
    }
    public static get instance() {
        if (!FireFlyLoader._instance) {
            FireFlyLoader._instance = new FireFlyLoader(20);
        }
        return FireFlyLoader._instance;
    }
    public fire() {
        animationHandler.add(this.update);
        return this;
    }
    public stop() {
        animationHandler.remove(this.update);
        return this;
    }
    public disappear() {
        this.globalOpacity = 0;
        return this;
    }
    public appear() {
        this.globalOpacity = 1;
        return this;
    }
}

// yl
class PolygonLoader {
    public static _instance: PolygonLoader;
    public width: number;
    public height: number;
    public update: () => void;
    public globalOpacity: number;
    public getUpdatedTransform: () => TransformStruct | undefined;
    public updateTransform: () => PolygonLoader;
    public geometry: THREE.BufferGeometry;
    public uOpacity: THREE.Uniform<number>;
    public uOrigin: THREE.Uniform<[number, number, number]>;

    public constructor() {
        this.width = 800;
        this.height = 800;
        this.update = () => {
            this.updateTransform();
            this.geometry.rotateX(0.004);
            this.geometry.rotateY(-0.002);
            this.geometry.rotateZ(-0.002);
            this.uOpacity.value += 0.03 * (this.globalOpacity - this.uOpacity.value);
        };
        this.globalOpacity = 0;
        this.getUpdatedTransform = () => undefined;
        this.updateTransform = () => {
            const transform = this.getUpdatedTransform() || { x: 0, y: 0, sc: 1 };
            const { x } = transform;
            const { y } = transform;
            const { sc } = transform;
            this.uOrigin.value = [x, y, sc];
            return this;
        };
        this.geometry = new THREE.IcosahedronGeometry(400, 1);
        this.uOpacity = new THREE.Uniform(this.globalOpacity);
        this.uOrigin = new THREE.Uniform([0, 0, 1]);
        new THREE.TextureLoader().loadAsync(particleUrl).then(t => {
            const color = new THREE.Uniform(new THREE.Color(0x968414));
            const texutre = new THREE.Uniform(t);
            const vertexShader = `
            uniform vec3 uOrigin;
            varying float z;
            void main() {
                z = position.z;
                vec4 mvPosition = modelViewMatrix * vec4( position.xy * uOrigin.z + uOrigin.xy, 0.0, 1.0 );
                gl_PointSize = 16.0 / uOrigin.z;
                gl_Position = projectionMatrix * mvPosition;
            }
            `;
            const fragmentShaderColor = `
            uniform vec3 uColor;
            varying float z;
            uniform float uOpacity;
            void main() {
                gl_FragColor = vec4(uColor, ((z / 400.0) + 0.5) * uOpacity);
            }
            `;
            const fragmentShaderTexture = `
            uniform vec3 uColor;
            varying float z;
            uniform sampler2D uTexture;
            uniform float uOpacity;
            void main() {
                vec4 texture = texture2D(uTexture, gl_PointCoord.xy);
                gl_FragColor = texture * vec4(uColor, ((z / 400.0) + 0.5) * uOpacity);
            }`;
            const lineSegments = new THREE.LineSegments(
                this.geometry,
                new THREE.ShaderMaterial({
                    uniforms: {
                        uColor: color,
                        uOpacity: this.uOpacity,
                        uOrigin: this.uOrigin,
                    },
                    vertexShader,
                    fragmentShader: fragmentShaderColor,
                    transparent: true,
                    depthTest: false,
                })
            );
            const points = new THREE.Points(
                this.geometry,
                new THREE.ShaderMaterial({
                    uniforms: {
                        uColor: color,
                        uTexture: texutre,
                        uOpacity: this.uOpacity,
                        uOrigin: this.uOrigin,
                    },
                    vertexShader,
                    fragmentShader: fragmentShaderTexture,
                    transparent: true,
                    depthTest: false,
                })
            );
            WebglContainer.instance.scene.add(lineSegments).add(points);
            this.fire();
        });
    }

    public static get instance() {
        if (!PolygonLoader._instance) {
            PolygonLoader._instance = new PolygonLoader();
        }
        return PolygonLoader._instance;
    }
    public fire() {
        animationHandler.add(this.update);
        return this;
    }
    public stop() {
        animationHandler.remove(this.update);
        return this;
    }
    public disappear() {
        this.globalOpacity = 0;
        return this;
    }
    public appear() {
        this.globalOpacity = 1;
        return this;
    }
    public setTransform(t: () => TransformStruct) {
        this.getUpdatedTransform = t;
        return this;
    }

    // eslint-disable-next-line class-methods-use-this
    public updatePolygonTransform(offset = 0) {
        PolygonLoader.instance.setTransform(() => {
            if (responsiveModeHandler.mode === "desktop") {
                return {
                    x: 0.1 * -WebglContainer.instance.width,
                    y: 0.5 * WebglContainer.instance.height + (0.2 * (1 - offset) + 0.3) * PolygonLoader.instance.height,
                    sc: 1,
                };
            }
            return {
                x: 0,
                y: 0.5 * WebglContainer.instance.height + (0.2 * (1 - offset) + 0.3) * PolygonLoader.instance.height * 0.6,
                sc: 0.6,
            };
        });
    }
}

export function init() {
    animationHandler.init();
    resizeHandler.init();
    responsiveModeHandler.init();
}

export function background() {
    PolygonLoader.instance.appear().updatePolygonTransform(1);
    FireFlyLoader.instance.appear();
}

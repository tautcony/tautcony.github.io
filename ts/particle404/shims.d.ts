/**
 * Ambient types for Three.js r56 (global THREE from cdnjs three.js/r56).
 */

interface ModernizrStatic {
    canvas: boolean;
    webgl: boolean;
    csstransforms?: boolean;
    csstransforms3d?: boolean;
}

/** Minimal Vector3 surface used by the 404 scene. */
interface ThreeVector3 {
    x: number;
    y: number;
    z: number;
    add(v: ThreeVector3): ThreeVector3;
    sub(v: ThreeVector3): ThreeVector3;
    normalize(): ThreeVector3;
    set(x: number, y: number, z: number): void;
    copy(v: ThreeVector3): ThreeVector3;
}

interface ThreeColor {
    r: number;
    g: number;
    b: number;
    setRGB(r: number, g: number, b: number): ThreeColor;
    setHSV(h: number, s: number, v: number): ThreeColor;
    getHex(): number;
}

interface ThreeObject3D {
    position: ThreeVector3;
    rotation: ThreeVector3;
    scale: ThreeVector3;
    children: ThreeObject3D[];
    add(obj: ThreeObject3D): void;
}

interface ThreeGeometry {
    vertices: ThreeVector3[];
    colors: ThreeColor[];
    __dirtyVertices?: boolean;
    colorsNeedUpdate?: boolean;
}

interface ThreeMaterial {
    map?: { image?: CanvasImageSource };
    [key: string]: unknown;
}

interface ThreeMesh extends ThreeObject3D {
    overdraw?: boolean;
}

interface ThreeParticleSystem extends ThreeObject3D {
    geometry: ThreeGeometry;
    sortParticles?: boolean;
}

interface ThreeLight extends ThreeObject3D {
    color: ThreeColor;
}

interface ThreeCamera extends ThreeObject3D {
    a: number;
    va: number;
    aspect: number;
    up: ThreeVector3;
    lookAt(target: ThreeVector3): void;
    updateProjectionMatrix(): void;
}

interface ThreeRenderer {
    domElement: HTMLCanvasElement;
    setSize(width: number, height: number): void;
    setClearColorHex(hex: number, alpha: number): void;
    render(scene: ThreeObject3D, camera: ThreeCamera): void;
}

interface ThreeProjector {
    unprojectVector(vector: ThreeVector3, camera: ThreeCamera): void;
}

interface ThreeRaycaster {
    intersectObjects(objects: ThreeObject3D[]): { point: ThreeVector3 }[];
}

interface ThreeClock {
    start(): void;
    getElapsedTime(): number;
}

interface ThreeTexture {
    needsUpdate: boolean;
    image?: CanvasImageSource;
}

interface ThreeNamespace {
    Vector3: new (x?: number, y?: number, z?: number) => ThreeVector3;
    Color: new (hex?: number) => ThreeColor;
    Scene: new () => ThreeObject3D;
    PerspectiveCamera: new (fov: number, aspect: number, near: number, far: number) => ThreeCamera;
    CanvasRenderer: new () => ThreeRenderer;
    WebGLRenderer: new () => ThreeRenderer;
    Clock: new () => ThreeClock;
    Projector: new () => ThreeProjector;
    Geometry: new () => ThreeGeometry;
    Line: new (geometry: ThreeGeometry, material: ThreeMaterial) => ThreeObject3D;
    LineBasicMaterial: new (params: object) => ThreeMaterial;
    Mesh: new (geometry: unknown, material: ThreeMaterial) => ThreeMesh;
    MeshBasicMaterial: new (params: object) => ThreeMaterial;
    MeshPhongMaterial: new (params: object) => ThreeMaterial;
    MeshFaceMaterial: new (materials: ThreeMaterial[]) => ThreeMaterial;
    PlaneGeometry: new (w: number, h: number) => unknown;
    CubeGeometry: new (...args: number[]) => unknown;
    PointLight: new (color: number, intensity?: number) => ThreeLight;
    AmbientLight: new (color: number) => ThreeLight;
    Particle: new (material: ThreeMaterial) => ThreeObject3D;
    ParticleSystem: new (geometry: ThreeGeometry, material: ThreeMaterial) => ThreeParticleSystem;
    ParticleBasicMaterial: new (params: object) => ThreeMaterial;
    ParticleCanvasMaterial: new (params: object) => ThreeMaterial;
    Texture: new (image?: CanvasImageSource) => ThreeTexture;
    ImageUtils: {
        loadTexture(url: string): ThreeTexture & { image: HTMLImageElement };
    };
    AdditiveBlending: number;
    DoubleSide: number;
    VertexColors: number;
    Raycaster: new (origin: ThreeVector3, direction: ThreeVector3) => ThreeRaycaster;
}

interface Window {
    THREE: ThreeNamespace;
    Modernizr?: ModernizrStatic;
    webkitRequestAnimationFrame?: typeof requestAnimationFrame;
    mozRequestAnimationFrame?: typeof requestAnimationFrame;
    oRequestAnimationFrame?: typeof requestAnimationFrame;
    msRequestAnimationFrame?: typeof requestAnimationFrame;
}

declare const THREE: ThreeNamespace;
declare const Modernizr: ModernizrStatic;

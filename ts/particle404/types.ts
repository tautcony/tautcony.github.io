import type { Tween } from "./tween";

export interface RgbColor {
    r: number;
    g: number;
    b: number;
}

export interface HsvColor {
    h: number;
    s: number;
    v: number;
}

export interface ParticleInitial {
    x: number;
    y: number;
    z: number;
}

export interface Particle {
    index: number;
    position: ThreeVector3;
    velocity: ThreeVector3;
    color: ThreeColor;
    initial: ParticleInitial;
    tween?: Tween;
}

export interface ParticleSystemState {
    count: number;
    geometry: ThreeGeometry | undefined;
    mat: ThreeMaterial | undefined;
    threeObject: ThreeParticleSystem | undefined;
    plainArray: Particle[];
    canvasMode: boolean;
    explodeParameters: {
        max: { pow: number; dist: number };
        min: { pow: number };
    };
    init(): void;
    update(): void;
    mixRGB(channel: number, t: number): number;
    getVelocity(index: number): ThreeVector3;
    getParticlePosition(index: number): ThreeVector3;
}

export interface MaskState {
    data: number[];
    w: number;
    h: number;
    dim: {
        max: number;
        halfDelta: { w: number; h: number };
        cell: number;
        halfCell?: number;
    };
}

export interface GuiSettings {
    seedColor: number[];
    sideColor: number[];
    message: string;
    background: number[];
    pointColor: number[];
    ambientColor: number[];
    explode(): void;
}

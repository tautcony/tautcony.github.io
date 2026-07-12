/**
 * Place particles according to a text / image alpha mask.
 */
import { SCENE } from "./config";
import { shell404 } from "./shell";
import type { MaskState, Particle, ParticleSystemState } from "./types";

export const mask: MaskState = {
    data: [],
    w: 0,
    h: 0,
    dim: {
        max: 0,
        halfDelta: { w: 0, h: 0 },
        cell: 0,
        halfCell: 0,
    },
};

export type ResetParticleFn = (particle: Particle) => void;

export class ParticlesMask {
    private resetParticle: ResetParticleFn = () => undefined;

    setResetParticle(fn: ResetParticleFn): void {
        this.resetParticle = fn;
    }

    initParticlesFromMask(url: string, particles: ParticleSystemState): void {
        const image = THREE.ImageUtils.loadTexture(url).image;
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                return;
            }
            ctx.drawImage(image, 0, 0);
            this.initParticlesFromImageData(
                ctx.getImageData(0, 0, image.width, image.height),
                particles
            );
        };
    }

    initParticlesFromString(text: string, particles: ParticleSystemState): void {
        const size = SCENE.textSize;
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = size;

        const font = `${size}px arial`;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }
        ctx.font = font;
        canvas.width = Math.max(1, Math.ceil(ctx.measureText(text).width));
        ctx.font = font;
        ctx.textBaseline = "bottom";
        ctx.fillText(text, 0, size);

        this.initParticlesFromImageData(
            ctx.getImageData(0, 0, canvas.width, canvas.height),
            particles
        );
    }

    initParticlesFromImageData(
        imageData: ImageData,
        particles: ParticleSystemState
    ): void {
        mask.data = [];
        mask.w = imageData.width;
        mask.h = imageData.height;
        mask.dim.max = Math.max(mask.w, mask.h);
        mask.dim.halfCell = (2 * shell404.maxRadius) / mask.dim.max / 2;
        mask.dim.halfDelta.w = (mask.dim.max - mask.w) / 2;
        mask.dim.halfDelta.h = (mask.dim.max - mask.h) / 2;

        for (let x = 0; x < mask.w; x++) {
            for (let y = 0; y < mask.h; y++) {
                const index = x + mask.w * y;
                // Alpha channel of the mask pixel.
                mask.data[index] = imageData.data[4 * index + 3];
            }
        }

        this.alignToMask(particles);
    }

    alignToMask(particles: ParticleSystemState): void {
        for (let i = 0; i < particles.count; i++) {
            this.setParticleToRandomUnmaskedPixel(particles.plainArray[i]);
            this.resetParticle(particles.plainArray[i]);
        }
    }

    /**
     * Sample a random opaque-ish pixel and map it into scene XZ space.
     */
    setParticleToRandomUnmaskedPixel(particle: Particle): void {
        let pixelIndex: number;
        do {
            pixelIndex = Math.floor(Math.random() * mask.data.length);
        } while (255 * Math.random() > mask.data[pixelIndex]);

        const row = Math.floor(pixelIndex / mask.w);
        const col = pixelIndex % mask.w;
        const halfCell = mask.dim.halfCell ?? 0;

        particle.initial.x =
            ((col + mask.dim.halfDelta.w + 0.5) / mask.dim.max) * 2 - 1;
        particle.initial.x *= shell404.maxRadius;
        particle.initial.x += shell404.range(-halfCell, halfCell);

        particle.initial.z =
            ((row + mask.dim.halfDelta.h + 0.5) / mask.dim.max) * 2 - 1;
        particle.initial.z *= shell404.maxRadius;
        particle.initial.z += shell404.range(-halfCell, halfCell);
    }
}

export const particlesMask = new ParticlesMask();

/**
 * Small, readable tween runtime (replaces createjs TweenJS for the 404 page).
 *
 * Supports the subset we actually use:
 *   - property animation with duration
 *   - initial delay
 *   - looping
 *   - pause / resume
 *   - global tick(deltaMs)
 *   - cubicInOut easing helper
 */

export type EasingFn = (t: number) => number;

/** Cubic ease-in-out, t ∈ [0, 1]. */
export function cubicInOut(t: number): number {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type NumericTarget = Record<string, number>;

interface TweenOptions {
    loop?: boolean;
}

interface TweenStep {
    kind: "wait" | "to";
    duration: number;
    props?: NumericTarget;
    easing?: EasingFn;
}

export class Tween {
    private readonly target: NumericTarget;
    private readonly loop: boolean;
    private readonly steps: TweenStep[] = [];
    private readonly initial: NumericTarget = {};
    private stepIndex = 0;
    private elapsed = 0;
    private from: NumericTarget = {};
    private paused = false;
    private started = false;
    private onChange: (() => void) | null = null;

    private constructor(target: NumericTarget, options: TweenOptions = {}) {
        this.target = target;
        this.loop = Boolean(options.loop);
    }

    static get(target: NumericTarget, options?: TweenOptions): Tween {
        const tween = new Tween(target, options);
        activeTweens.add(tween);
        return tween;
    }

    /** Advance all active tweens by `deltaMs` milliseconds. */
    static tick(deltaMs: number, globalPaused = false): void {
        if (globalPaused || deltaMs <= 0) {
            return;
        }
        for (const tween of [...activeTweens]) {
            tween.advance(deltaMs);
        }
    }

    wait(ms: number): this {
        this.steps.push({ kind: "wait", duration: Math.max(0, ms) });
        return this;
    }

    to(props: NumericTarget, duration: number, easing?: EasingFn): this {
        for (const key of Object.keys(props)) {
            if (!(key in this.initial)) {
                this.initial[key] = this.target[key] ?? 0;
            }
        }
        this.steps.push({
            kind: "to",
            duration: Math.max(0, duration),
            props: { ...props },
            easing,
        });
        return this;
    }

    addEventListener(type: string, listener: () => void): void {
        if (type === "change") {
            this.onChange = listener;
        }
    }

    setPaused(paused: boolean): void {
        this.paused = paused;
    }

    private ensureStarted(): void {
        if (this.started) {
            return;
        }
        this.started = true;
        this.beginStep(0);
    }

    private beginStep(index: number): void {
        this.stepIndex = index;
        this.elapsed = 0;
        const step = this.steps[index];
        if (!step || step.kind !== "to" || !step.props) {
            return;
        }
        this.from = {};
        for (const key of Object.keys(step.props)) {
            this.from[key] = this.target[key] ?? 0;
        }
    }

    private advance(deltaMs: number): void {
        if (this.paused || this.steps.length === 0) {
            return;
        }
        this.ensureStarted();

        let remaining = deltaMs;
        while (remaining > 0 && !this.paused) {
            const step = this.steps[this.stepIndex];
            if (!step) {
                activeTweens.delete(this);
                return;
            }

            const left = step.duration - this.elapsed;
            const slice = Math.min(remaining, left);
            this.elapsed += slice;
            remaining -= slice;

            if (step.kind === "to" && step.props) {
                const t = step.duration === 0
                    ? 1
                    : Math.min(1, this.elapsed / step.duration);
                const eased = step.easing ? step.easing(t) : t;
                for (const key of Object.keys(step.props)) {
                    const a = this.from[key] ?? 0;
                    const b = step.props[key];
                    this.target[key] = a + (b - a) * eased;
                }
                this.onChange?.();
            }

            if (this.elapsed < step.duration) {
                break;
            }

            // Snap to end state for "to" steps, then advance.
            if (step.kind === "to" && step.props) {
                for (const key of Object.keys(step.props)) {
                    this.target[key] = step.props[key];
                }
                this.onChange?.();
            }

            const next = this.stepIndex + 1;
            if (next >= this.steps.length) {
                if (this.loop) {
                    for (const key of Object.keys(this.initial)) {
                        this.target[key] = this.initial[key];
                    }
                    this.onChange?.();
                    this.beginStep(0);
                } else {
                    activeTweens.delete(this);
                    return;
                }
            } else {
                this.beginStep(next);
            }
        }
    }
}

const activeTweens = new Set<Tween>();

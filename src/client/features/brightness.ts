import { el } from "../lib/dom";

interface BrightnessConfig {
    enabled: boolean;
    /** Dim amount 0–100 (higher = darker mask). */
    dimPercent: number;
}

const STORAGE_KEY = "brightness";
const MIN_DIM_PERCENT = 5;
const MAX_DIM_PERCENT = 95;
const STEP_PERCENT = 5;
const DEFAULT_ENABLED_DIM_PERCENT = 30;

function loadConfig(): BrightnessConfig {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as Partial<BrightnessConfig> & {
                enable?: boolean;
                brightness?: number;
            };
            // Support legacy keys `enable` / `brightness` from older builds.
            return {
                enabled: parsed.enabled ?? parsed.enable ?? false,
                dimPercent: parsed.dimPercent ?? parsed.brightness ?? 0,
            };
        }
    } catch {
        // ignore corrupt storage
    }
    return {
        dimPercent: 0,
        enabled: false,
    };
}

function saveConfig(config: BrightnessConfig): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
        // ignore quota / private mode errors
    }
}

class BrightnessController {
    private readonly mask: HTMLDivElement;
    private config: BrightnessConfig;

    public constructor() {
        this.mask = el("div", {
            style: {
                position: "fixed",
                top: 0,
                left: 0,
                outline: "50000px solid",
                zIndex: 999999,
                outlineColor: "rgba(0, 0, 0, 0)",
            },
        });
        document.body.append(this.mask);
        this.config = loadConfig();
        this.apply();
    }

    public brighten(): void {
        if (!this.config.enabled) {
            return;
        }
        this.config.dimPercent = Math.max(MIN_DIM_PERCENT, this.config.dimPercent - STEP_PERCENT);
        this.apply();
    }

    public darken(): void {
        if (!this.config.enabled) {
            return;
        }
        this.config.dimPercent = Math.min(MAX_DIM_PERCENT, this.config.dimPercent + STEP_PERCENT);
        this.apply();
    }

    public toggle(): void {
        this.config.enabled = !this.config.enabled;
        this.config.dimPercent = this.config.enabled ? DEFAULT_ENABLED_DIM_PERCENT : 0;
        this.apply();
    }

    private apply(): void {
        this.mask.style.outlineColor = `rgba(0, 0, 0, ${this.config.dimPercent / 100})`;
        saveConfig(this.config);
    }
}

export function init(): void {
    const controller = new BrightnessController();
    const keyActions: Record<string, () => void> = {
        KeyZ: () => controller.toggle(),
        ArrowUp: () => controller.brighten(),
        ArrowDown: () => controller.darken(),
    };
    window.addEventListener("keydown", event => {
        if (!event.altKey) {
            return;
        }
        keyActions[event.code]?.();
    });
}

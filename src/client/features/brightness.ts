import { el } from "../lib/dom";

interface BrightnessConfig {
    enable: boolean;
    brightness: number;
}

const STORAGE_KEY = "brightness";

function loadConfig(): BrightnessConfig {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            return JSON.parse(raw) as BrightnessConfig;
        }
    } catch {
        // ignore corrupt storage
    }
    return {
        brightness: 0,
        enable: false,
    };
}

function saveConfig(config: BrightnessConfig): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
        // ignore quota / private mode errors
    }
}

class BrightnessWatcher {
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
        this.update();
    }

    public increase() {
        if (this.config.enable) {
            this.config.brightness = Math.max(5, this.config.brightness - 5);
            this.update();
        }
    }

    public decrease() {
        if (this.config.enable) {
            this.config.brightness = Math.min(95, this.config.brightness + 5);
            this.update();
        }
    }

    public toggle() {
        this.config.enable = !this.config.enable;
        this.config.brightness = this.config.enable ? 30 : 0;
        this.update();
    }

    private update() {
        this.mask.style.outlineColor = `rgba(0, 0, 0, ${this.config.brightness / 100})`;
        saveConfig(this.config);
    }
}

const brightness = new BrightnessWatcher();

export default function init() {
    const keyMapping: Record<string, () => void> = {
        KeyZ: () => brightness.toggle(),
        ArrowUp: () => brightness.increase(),
        ArrowDown: () => brightness.decrease(),
    };
    window.addEventListener("keydown", e => {
        if (!e.altKey) {
            return;
        }
        keyMapping[e.code]?.();
    });
}

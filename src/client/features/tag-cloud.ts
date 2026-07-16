export interface TagCloudConfig {
    color?: {
        start: string;
        end: string;
    };
    size?: {
        start: number;
        end: number;
        unit: string;
    };
}

type Rgb = readonly [number, number, number];

function hexToRgb(code: string): Rgb {
    let hex = code.trim();
    if (hex.startsWith("#")) {
        hex = hex.slice(1);
    }
    if (hex.length === 3) {
        hex = hex.replace(/(\w)(\w)(\w)/, "$1$1$2$2$3$3");
    }
    const match = /^(\w{2})(\w{2})(\w{2})$/.exec(hex);
    if (match === null) {
        return [0, 0, 0];
    }
    return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

function rgbToHex([r, g, b]: Rgb): string {
    const channel = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
        .toString(16)
        .padStart(2, "0");
    return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function colorIncrement(start: Rgb, end: Rgb, range: number): Rgb {
    return [
        (end[0] - start[0]) / range,
        (end[1] - start[1]) / range,
        (end[2] - start[2]) / range,
    ];
}

function tagColor(start: Rgb, increment: Rgb, weighting: number): string {
    return rgbToHex([
        start[0] + increment[0] * weighting,
        start[1] + increment[1] * weighting,
        start[2] + increment[2] * weighting,
    ]);
}

const DEFAULT_CONFIG = {
    size: { start: 14, end: 18, unit: "pt" },
    color: { start: "#999999", end: "#0085a1" },
} as const;

export function init(
    tags: ArrayLike<Element>,
    options: TagCloudConfig = {}
): void {
    const config = {
        color: options.color ?? DEFAULT_CONFIG.color,
        size: options.size ?? DEFAULT_CONFIG.size,
    };

    let lowest = Infinity;
    let highest = -Infinity;
    const weights: number[] = [];

    for (const tag of Array.from(tags)) {
        const weight = parseInt(tag.getAttribute("rel") ?? "", 10);
        weights.push(weight);
        if (Number.isNaN(weight)) {
            continue;
        }
        lowest = Math.min(lowest, weight);
        highest = Math.max(highest, weight);
    }

    if (!Number.isFinite(lowest)) {
        lowest = 0;
        highest = 0;
    }
    const range = highest === lowest ? 1 : highest - lowest;
    const fontIncrement = (config.size.end - config.size.start) / range;
    const startRgb = hexToRgb(config.color.start);
    const colorStep = colorIncrement(startRgb, hexToRgb(config.color.end), range);

    for (let index = 0; index < tags.length; index++) {
        const element = tags[index] as HTMLElement;
        const weight = weights[index];
        if (Number.isNaN(weight)) {
            continue;
        }
        const weighting = weight - lowest;
        element.style.fontSize = `${config.size.start + weighting * fontIncrement}${config.size.unit}`;
        element.style.color = tagColor(startRgb, colorStep, weighting);
    }
}

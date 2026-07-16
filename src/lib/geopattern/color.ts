export interface Rgb {
    r: number;
    g: number;
    b: number;
}

export interface Hsl {
    h: number;
    s: number;
    l: number;
}

/**
 * Converts a hex CSS color value to RGB.
 * Adapted from http://stackoverflow.com/a/5624139.
 */
export function hexToRgb(hex: string): Rgb {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (_match, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    if (!result) {
        return { r: 0, g: 0, b: 0 };
    }
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    };
}

/** Converts an RGB color value to a hex string. */
export function rgbToHex(rgb: Rgb): string {
    return `#${(["r", "g", "b"] as const)
        .map(key => (`0${rgb[key].toString(16)}`).slice(-2))
        .join("")}`;
}

/**
 * Converts an RGB color value to HSL.
 * Assumes r, g, and b are in [0, 255]; returns h, s, l in [0, 1].
 */
export function rgbToHsl(rgb: Rgb): Hsl {
    let { r, g, b } = rgb;
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s: number;
    const l = (max + min) / 2;

    if (max === min) {
        h = 0;
        s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: break;
        }
        h /= 6;
    }

    return { h, s, l };
}

/**
 * Converts an HSL color value to RGB.
 * Assumes h, s, and l are in [0, 1]; returns r, g, b in [0, 255].
 */
export function hslToRgb(hsl: Hsl): Rgb {
    function hueToRgb(p: number, q: number, t: number): number {
        let tt = t;
        if (tt < 0) {
            tt += 1;
        }
        if (tt > 1) {
            tt -= 1;
        }
        if (tt < 1 / 6) {
            return p + (q - p) * 6 * tt;
        }
        if (tt < 1 / 2) {
            return q;
        }
        if (tt < 2 / 3) {
            return p + (q - p) * (2 / 3 - tt) * 6;
        }
        return p;
    }

    const { h, s, l } = hsl;
    let r: number;
    let g: number;
    let b: number;

    if (s === 0) {
        r = l;
        g = l;
        b = l;
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hueToRgb(p, q, h + 1 / 3);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}

export function rgbToCss(rgb: Rgb): string {
    return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
}

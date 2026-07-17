/**
 * Archive tag-cloud: weight scale for count badges (角标), not label text.
 * End color = brand / selected teal (`$brand-primary`).
 */

export interface TagCloudConfig {
    /** Badge background ramp (low count → high count). */
    color: {
        start: string;
        end: string;
    };
}

/** End matches selected/focus fill (`$brand-primary` / Show All). */
export const ARCHIVE_TAG_CLOUD: TagCloudConfig = {
    color: { start: "#c5ced1", end: "#0085a1" },
};

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

function lerpRgb(start: Rgb, end: Rgb, t: number): string {
    const u = Math.max(0, Math.min(1, t));
    return rgbToHex([
        start[0] + (end[0] - start[0]) * u,
        start[1] + (end[1] - start[1]) * u,
        start[2] + (end[2] - start[2]) * u,
    ]);
}

/**
 * Map each weight to a badge background color.
 * Distinct weights are evenly spaced so mid-tier counts stay readable.
 */
export function tagBadgeColors(
    weights: readonly number[],
    config: TagCloudConfig = ARCHIVE_TAG_CLOUD
): (string | null)[] {
    const valid = weights.filter(w => !Number.isNaN(w));
    const unique = [...new Set(valid)].sort((a, b) => a - b);
    const rankOf = new Map(unique.map((w, i) => [w, i]));
    const rankMax = Math.max(unique.length - 1, 1);
    const startRgb = hexToRgb(config.color.start);
    const endRgb = hexToRgb(config.color.end);

    return weights.map(weight => {
        if (Number.isNaN(weight)) {
            return null;
        }
        const rank = rankOf.get(weight) ?? 0;
        return lerpRgb(startRgb, endRgb, rank / rankMax);
    });
}

/** Parent `style` for a tag: only sets badge token (label stays theme gray). */
export function tagBadgeStyleAttr(badgeColor: string | null | undefined): Record<string, string> | undefined {
    if (!badgeColor) {
        return undefined;
    }
    return {
        "--tc-badge-color": badgeColor,
    };
}

import Preset from "./preset";

/**
 * Extract a substring from a hex string and parse it as an integer
 * @param hash - Source hex string
 * @param index - Start index of substring
 * @param len - Length of substring. Defaults to 1.
 */
export function hexVal(hash: string, index: number, len = 1) {
    return parseInt(hash.substring(index, index + len), 16);
}

/*
 * Re-maps a number from one range to another
 * http://processing.org/reference/map_.html
 */
export function map(value: string | number, vMin: number, vMax: number, dMin: number, dMax: number) {
    const vValue = typeof value === "number" ? value : parseFloat(value);
    const vRange = vMax - vMin;
    const dRange = dMax - dMin;

    return ((vValue - vMin) * dRange) / vRange + dMin;
}

export function fillColor(val: number) {
    return (val % 2 === 0) ? Preset.FillColorLight : Preset.FillColorDark;
}

export function fillOpacity(val: number) {
    return map(val, 0, 15, Preset.OpacityMin, Preset.OpacityMax);
}

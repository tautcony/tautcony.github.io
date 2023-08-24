export interface IConfig {
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

// Converts hex to an RGB array
function toRGB(code: string) {
    if (code.length === 4) {
        code = code.replace(/(\w)(\w)(\w)/gi, "$1$1$2$2$3$3");
    }
    const hex = /(\w{2})(\w{2})(\w{2})/.exec(code);
    return [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16)];
}

// Converts an RGB array to hex
function toHex(arr: number[]) {
    const ret = arr.map(value => {
        let hex = value.toString(16);
        hex = (hex.length === 1) ? `0${hex}` : hex;
        return hex;
    }).join("");
    return `#${ret}`;
}

function tagColor(opts: IConfig, increment: number[], weighting: number) {
    const rgb = toRGB(opts.color.start).map((value, index) => {
        const ref = Math.round(value + (increment[index] * weighting));
        return Math.max(0, Math.min(ref, 255));
    });
    return toHex(rgb);
}

function colorIncrement(opts: IConfig, range: number) {
    const start = toRGB(opts.color.start);
    const end = toRGB(opts.color.end);
    return end.map((value, index) => (value - start[index]) / range);
}

export default function tagcloud(tags: NodeListOf<Element>, options: IConfig = {}) {
    const defaults = {
        size: { start: 14, end: 18, unit: "pt" },
        color: { start: "#bbbbee", end: "#0085a1" },
    };
    const opts = {
        color: options.color !== undefined ? options.color : defaults.color,
        size: options.size !== undefined ? options.size : defaults.size,
    };
    let lowest = 0x3F3F3F3F;
    let highest = 0;
    /* eslint-disable @typescript-eslint/prefer-for-of */
    for (let i = 0; i < tags.length; ++i) {
        const element = tags[i] as HTMLAnchorElement;
        const curr = parseInt(element.getAttribute("rel"), 10);
        if (Number.isNaN(curr)) {
            continue;
        }
        lowest = Math.min(lowest, curr);
        highest = Math.max(highest, curr);
    }
    let range = highest - lowest;
    if (range === 0) {
        range = 1;
    }
    // Sizes
    const fontIncr = (opts.size.end - opts.size.start) / range;
    // Colors
    const colorIncr = colorIncrement(opts, range);
    for (let i = 0; i < tags.length; ++i) {
        const element = tags[i] as HTMLAnchorElement;
        const weighting = parseInt(element.getAttribute("rel"), 10) - lowest;
        element.style.fontSize = (opts.size.start + (weighting * fontIncr)).toString() + opts.size.unit;
        // change color to background-color
        element.style.backgroundColor = tagColor(opts, colorIncr, weighting);
    }
    /* eslint-enable @typescript-eslint/prefer-for-of */
}

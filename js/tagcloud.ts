namespace TagCloud {
    interface IConfig {
        color: {
            start: string;
            end: string;
        }
        size: {
            start: number;
            end: number;
            unit: string;
        };
    }

    export function tagcloud(tags: JQuery, options: IConfig) {
        const defaults = {
            size:  { start: 14, end: 18, unit: "pt" },
            color: { start: "#bbbbee", end: "#0085a1"},
        } as IConfig;
        const opts = {
            color: options.color !== undefined ? options.color : defaults.color,
            size:  options.size  !== undefined ? options.size  : defaults.size,
        } as IConfig;
        let lowest = 0x3f3f3f3f;
        let highest = 0;
        tags.each((index, elem) => {
            const curr = parseInt(elem.getAttribute("rel"), 10);
            lowest = Math.min(lowest, curr);
            highest = Math.max(highest, curr);
        });
        let range = highest - lowest;
        if (range === 0) {
            range = 1;
        }
        // Sizes
        let fontIncr = 0;
        let colorIncr: number[] = [];
        if (opts.size) {
            fontIncr = (opts.size.end - opts.size.start) / range;
        }
        // Colors
        if (opts.color) {
            colorIncr = colorIncrement(opts, range);
        }
        return tags.each((index, elem) => {
            const weighting = parseInt($(elem).attr("rel"), 10) - lowest;
            if (opts.size) {
                $(elem).css({ "font-size": opts.size.start + (weighting * fontIncr) + opts.size.unit });
            }
            if (opts.color) {
                // change color to background-color
                $(elem).css({ backgroundColor: tagColor(opts, colorIncr, weighting) });
            }
        });
    }

    // Converts hex to an RGB array
    function toRGB(code: string) {
        if (/#[0-9a-fA-F]{3}/.test(code)) {
            const r = code[1] + code[1];
            const g = code[2] + code[2];
            const b = code[3] + code[3];
            code = "#" + r + g + b;
        }
        const hex = /(\w{2})(\w{2})(\w{2})/.exec(code);
        if (hex === null) {
            return [0, 0, 0];
        }
        return [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16)];
    }

    // Converts an RGB array to hex
    function toHex(arr: number[]) {
        const ret = arr.map((value) => {
            let hex = value.toString(16);
            hex = (hex.length === 1) ? `0${hex}` : hex;
            return hex;
        }).join("");
        return `#${ret}`;
    }

    function colorIncrement(opts: IConfig, range: number) {
        const start = toRGB(opts.color.start);
        const end   = toRGB(opts.color.end);
        return end.map((value, index) => {
            return (value - start[index]) / range;
        });
    }

    function tagColor(opts: IConfig, increment: number[], weighting: number) {
        const rgb = toRGB(opts.color.start).map((value, index) => {
            const ref = Math.round(value + (increment[index] * weighting));
            return ref > 255 ? 255 : ref < 0 ? 0 : ref;
        });
        return toHex(rgb);
    }
}

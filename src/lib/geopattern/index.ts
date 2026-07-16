import PatternGenerator, { Pattern, PatternOptions } from "./pattern-generator";

/*
 * Normalize arguments, if not given, to:
 * string: (new Date()).toString()
 * options: {}
 */
function optArgs(cb: (str: string, options?: PatternOptions) => Pattern) {
    return function opt(str?: string | PatternOptions, options?: PatternOptions) {
        if (typeof str === "string") {
            return cb(str, options);
        }
        return cb(new Date().toString(), str);
    };
}

const GeoPattern = {
    generate: optArgs((str: string, options?: PatternOptions) => {
        const generator = new PatternGenerator(str, options);
        return generator.generate();
    }),
};

export const { generate } = GeoPattern;

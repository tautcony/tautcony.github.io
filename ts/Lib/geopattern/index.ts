import PatternGenerator, { Pattern, IPatternOption } from "./pattern-generator";

/*
 * Normalize arguments, if not given, to:
 * string: (new Date()).toString()
 * options: {}
 */
function optArgs(cb: (str: string, options?: IPatternOption) => Pattern) {
    return function opt(str?: string | IPatternOption, options?: IPatternOption) {
        if (typeof str === "string") {
            return cb(str, options);
        }
        return cb(new Date().toString(), str);
    };
}

const GeoPattern = {
    generate: optArgs((str: string, options?: IPatternOption) => {
        const generator = new PatternGenerator(str, options);
        return generator.generate();
    }),
};

export const { generate } = GeoPattern;

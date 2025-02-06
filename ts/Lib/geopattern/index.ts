import PatternGenerator, { Pattern, IPatternOption } from "./pattern-generator";

/*
 * Normalize arguments, if not given, to:
 * string: (new Date()).toString()
 * options: {}
 */
function optArgs(cb: (str: string, options?: IPatternOption) => Pattern) {
    return function opt(str: string | IPatternOption, options?: IPatternOption) {
        let strVal: string | null = null;
        let optionsVal = {} as IPatternOption | undefined;
        if (typeof str === "string") {
            strVal = str;
            optionsVal = options;
        } else {
            strVal = null;
            optionsVal = str;
        }
        if (strVal === null || strVal === undefined) {
            strVal = (new Date()).toString();
        }
        if (!options) {
            options = {} as IPatternOption;
        }
        return cb(strVal, optionsVal);
    };
}

const GeoPattern = {
    generate: optArgs((str: string, options?: IPatternOption) => {
        const generator = new PatternGenerator(str, options);
        return generator.generate();
    }),
};

export const { generate } = GeoPattern;

(($ => {
    if (!$) {
        return;
    }
    // If jQuery, add plugin
    $.fn.geopattern = function plugin(this, str?: string, options?: IPatternOption) {
        this.each(() => {
            const titleSha = $(this).attr("data-title-sha");
            if (titleSha) {
                options = $.extend({
                    hash: titleSha,
                }, options);
            }
            const pattern = GeoPattern.generate(str as string, options);
            $(this).css("background-image", pattern.toDataUrl());
        });
        return this;
    };
})(typeof window["jQuery"] !== "undefined" ? window["jQuery"] : null));

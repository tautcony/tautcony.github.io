var TagCloud;
(function (TagCloud) {
    function tagcloud(tags, options) {
        var defaults = {
            size: { start: 14, end: 18, unit: "pt" },
            color: { start: "#bbbbee", end: "#0085a1" },
        };
        var opts = {
            color: options.color !== undefined ? options.color : defaults.color,
            size: options.size !== undefined ? options.size : defaults.size,
        };
        var lowest = 0x3f3f3f3f;
        var highest = 0;
        tags.each(function (index, elem) {
            var curr = parseInt(elem.getAttribute("rel"), 10);
            lowest = Math.min(lowest, curr);
            highest = Math.max(highest, curr);
        });
        var range = highest - lowest;
        if (range === 0) {
            range = 1;
        }
        var fontIncr = 0;
        var colorIncr = [];
        if (opts.size) {
            fontIncr = (opts.size.end - opts.size.start) / range;
        }
        if (opts.color) {
            colorIncr = colorIncrement(opts, range);
        }
        return tags.each(function (index, elem) {
            var weighting = parseInt($(elem).attr("rel"), 10) - lowest;
            if (opts.size) {
                $(elem).css({ "font-size": opts.size.start + (weighting * fontIncr) + opts.size.unit });
            }
            if (opts.color) {
                $(elem).css({ backgroundColor: tagColor(opts, colorIncr, weighting) });
            }
        });
    }
    TagCloud.tagcloud = tagcloud;
    function toRGB(code) {
        if (/#[0-9a-fA-F]{3}/.test(code)) {
            var r = code[1] + code[1];
            var g = code[2] + code[2];
            var b = code[3] + code[3];
            code = "#" + r + g + b;
        }
        var hex = /(\w{2})(\w{2})(\w{2})/.exec(code);
        if (hex === null) {
            return [0, 0, 0];
        }
        return [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16)];
    }
    function toHex(arr) {
        var ret = arr.map(function (value) {
            var hex = value.toString(16);
            hex = (hex.length === 1) ? "0" + hex : hex;
            return hex;
        }).join("");
        return "#" + ret;
    }
    function colorIncrement(opts, range) {
        var start = toRGB(opts.color.start);
        var end = toRGB(opts.color.end);
        return end.map(function (value, index) {
            return (value - start[index]) / range;
        });
    }
    function tagColor(opts, increment, weighting) {
        var rgb = toRGB(opts.color.start).map(function (value, index) {
            var ref = Math.round(value + (increment[index] * weighting));
            return ref > 255 ? 255 : ref < 0 ? 0 : ref;
        });
        return toHex(rgb);
    }
})(TagCloud || (TagCloud = {}));

$(document).ready(function () {
    var cd64 = "|$$$}rstuvwxyz{$$$$$$$>?@ABCDEFGHIJKLMNOPQRSTUVW$$$$$$XYZ[\\]^_`abcdefghijklmnopq";
    function decode_block(str, offset) {
        var input = [0, 0, 0];
        for (var i = offset; i < offset + 4; ++i) {
            var c = str.charCodeAt(i);
            var v = (c >= 43 && c <= 122) ? cd64[c - 43] === "$" ? 0 : cd64.charCodeAt(c - 43) - 61 : 0;
            input[i - offset] = v - 1;
        }
        return String.fromCharCode(((0xFF & input[0] << 2) | input[1] >> 4), ((0xFF & input[1] << 4) | input[2] >> 2), ((0xC0 & input[2] << 6) | input[3] >> 0));
    }
    function decode(str) {
        var ret = "";
        for (var i = 0; i < str.length; i += 4) {
            ret += decode_block(str, i);
        }
        return ret;
    }
    var qrUrl = "L2ltZy9hbGlwYXlfcXIucG5n";
    var qrcode = window["qrcode"];
    var donate = window["donate"];
    if (qrcode === undefined) {
        return;
    }
    donate.addEventListener("mouseover", function () { return setTimeout(function () { return qrcode.src = decode(qrUrl); }, 201); });
    donate.addEventListener("mouseout", function () { return setTimeout(function () { return qrcode.src = ""; }, 201); });
});
$(document).ready(function () {
    var lang = document.getElementsByClassName("lang");
    var selecter = document.getElementById("langSelect");
    if (lang.length === 0) {
        return;
    }
    var lastSelectedLanguageIndex = -1;
    $("#langSelect").on("change", function (eventObject) {
        if (lastSelectedLanguageIndex !== -1) {
            $(lang[lastSelectedLanguageIndex]).fadeOut(0);
        }
        lastSelectedLanguageIndex = selecter.options.selectedIndex;
        $(lang[selecter.options.selectedIndex]).fadeIn(500);
    });
    var currentLanguageIndex = 0;
    var currentLanguage = window.navigator.language;
    for (var i = 0; i < lang.length; i++) {
        var opt = document.createElement("option");
        opt.setAttribute("value", i.toString());
        opt.innerHTML = lang[i].getAttribute("title");
        if (currentLanguage.indexOf(lang[i].getAttribute("lang")) >= 0) {
            currentLanguageIndex = i;
            console.log(currentLanguage);
        }
        selecter.appendChild(opt);
    }
    selecter.options.selectedIndex = currentLanguageIndex;
    $("#langSelect").trigger("change");
});
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
        var lowest = 0x3F3F3F3F;
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
            code = "#" + (r + g + b);
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
$(document).ready(function () {
    if ($("#tag_cloud").length === 0) {
        return;
    }
    function RemoveItemsByClassName(className) {
        var used = document.getElementsByClassName(className);
        for (var i = 0; i < used.length; ++i) {
            used[i].parentNode.removeChild(used[i]);
        }
    }
    var unsorted = document.getElementsByClassName("tag");
    var tags = [];
    for (var i = 0; i < unsorted.length; i++) {
        tags.push(unsorted[i]);
    }
    tags.sort();
    RemoveItemsByClassName("tag");
    var tagCloud = document.getElementById("tag_cloud");
    for (var _i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
        var tag = tags_1[_i];
        tagCloud.appendChild(tag);
    }
    var config = {
        color: { start: "#bbbbee", end: "#0085a1" },
        size: { start: 1, end: 1.1, unit: "em" },
    };
    TagCloud.tagcloud($("#tag_cloud a"), config);
});
/*!
 * TC Blog v1.0.0 (http://startbootstrap.com)
 * Copyright 2017 TautCony
 * Licensed under Apache 2.0 (https://github.com/tautcony/tautcony.github.io/blob/master/LICENSE)
 */
$(document).ready(function () {
    var banner = $("header.intro-header");
    if (banner.css("background-image") === "none") {
        banner.geopattern(document.location.href);
    }
    $("table").wrap("<div class='table-responsive'></div>");
    $("table").addClass("table");
    $('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>').addClass("embed-responsive-item");
    $('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>').addClass("embed-responsive-item");
    (function () {
        var MQL = 1170;
        if ($(window).width() > MQL) {
            var headerHeight_1 = $(".navbar-custom").height();
            var bannerHeight_1 = $(".intro-header .container").height();
            $(window).scroll({ previousTop: 0 }, function (event) {
                var currentTop = $(window).scrollTop();
                var $catalog = $(".side-catalog");
                if (currentTop < event.data.previousTop) {
                    if (currentTop > 0 && $(".navbar-custom").hasClass("is-fixed")) {
                        $(".navbar-custom").addClass("is-visible");
                    }
                    else {
                        $(".navbar-custom").removeClass("is-visible is-fixed");
                    }
                }
                else {
                    $(".navbar-custom").removeClass("is-visible");
                    if (currentTop > headerHeight_1 && !$(".navbar-custom").hasClass("is-fixed")) {
                        $(".navbar-custom").addClass("is-fixed");
                    }
                }
                event.data.previousTop = currentTop;
                $catalog.show();
                if (currentTop > bannerHeight_1) {
                    $catalog.addClass("fixed");
                }
                else {
                    $catalog.removeClass("fixed");
                }
            });
        }
    })();
    $("#gotop").click(function () {
        $("html, body").animate({ scrollTop: 0 }, 1000);
    });
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $("#gotop").stop().fadeIn("fast");
        }
        else {
            $("#gotop").stop().fadeOut("fast");
        }
    });
    (function () {
        var initalTitle = document.title;
        var gogatsubyou = ["_(:3 」∠)_", "_(・ω・｣∠)_", "_(:з)∠)_", "_(┐「ε:)_", "_(:3」∠❀",
            "_(:зゝ∠)_", "_(:3」[＿]", "ヾ(:3ﾉｼヾ)ﾉｼ", "(¦3ꇤ[▓▓]", "_( -ω-` )⌒)_"];
        document.addEventListener("visibilitychange", function (event) {
            if (!document.hidden) {
                document.title = "．．．．．．";
                setTimeout(function () { return document.title = initalTitle; }, 500);
            }
            else {
                document.title = gogatsubyou[Math.floor(Math.random() * gogatsubyou.length)] + " " + initalTitle;
            }
        });
    })();
    function startsWith(text, searchString, position) {
        return text.substr(position || 0, searchString.length) === searchString;
    }
    function checkDomain(url) {
        if (url.indexOf("//") === 0) {
            url = location.protocol + url;
        }
        return url.toLowerCase().replace(/([a-z])?:\/\//, "$1").split("/")[0];
    }
    function isExternal(url) {
        return (url.length > 1 && url.indexOf(":") > -1 || url.indexOf("//") > -1) &&
            checkDomain(location.href) !== checkDomain(url);
    }
    (function () {
        var post = $(".post-container");
        if (post.length !== 0) {
            post.children("p").each(function (index, value) {
                var p = $(value);
                if (startsWith(p.text(), "//")) {
                    p.css({ color: "#339966" });
                }
            });
            post.find("a").each(function (index, value) {
                if (isExternal(value.href)) {
                    $(value).addClass("external");
                }
            });
        }
    })();
});

String.prototype.format = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var str = this;
    return str.replace(/\{(\d+)\}/g, function (m, i) { return args[i].toString(); });
};
document.addEventListener("DOMContentLoaded", function () {
    var qrContainer = document.getElementById("qr-container");
    if (qrContainer === null) {
        return;
    }
    var empty = "data:image/svg+xml;base64," + window.btoa("<svg xmlns='http://www.w3.org/2000/svg' width='350' height='350'/>");
    var header = "iVBORw0KGgoAAAANSUhEUgAAAV4AAAFeAQMAAAD35eVZAAAABlBMVEUAAAD///+l2Z/dAAAAAnRSTlP/AOW3MEoAAAI";
    var tail = "AAAABJRU5ErkJggg==";
    var qrcodes = [
        header + "SSURBVGhD7dVRbuQwCAZg34T734qDrEQNP2BHbbXVkoet9DOTxIEPP4RoZtnP48/6m7iC+I7/B+uKEDMVlbgVFDVzJYhHWFDAdeOkZ12CeIb3Qwe9i72H1yCI38APgj7FQfwmThTaug8r4jdwJqROfrskTj0bPxOP8IoQ/f6TgniCOzANuYYi9gjiCVaMJOeyUbzzC0uxMxviEc5xpI46VpkWfM2Ih/hKSvSu6MECq1DEI6xlJJPo7r6+EI/wqWWp/TpNxHNcak8HupqKZhBPsFfi/Y9/z5VX6ZH4FmgmHmFfuNZboOyRdCeJx9jq0T8noo9W4gm2zgBLIsvTzhC/gT1CFnF889yBeIj9sfezzytyYtYZIx7iyMD5aXnRLYbSZeI5RhoawpswmBoO8Qxr5rxoj4jm6iYeYsuEXjaArmeGeIj3wodyVYLFoNAlfhBPcCcubJiKoSH20RgK8b/jSF9Wo5KXqObEiCc413G7W3YIxOp+7Ec8xHFfhQqVexFl4gn2m31k8bp8KhDPsL/8/aKfaJyceIr7h+XAJTUg7RrxEH89FMM4vIZW4gk+pXuZzLeRaiOe4Hjonj64OwoSv4AlS4etnEXeVJV4hjVG0tzLnsxNNEdWv0jEQ9xjqK7qrAXxOzjzjuNYsUEc8SWeYQh/yUEsz9jES2ghHuEVIeDREDiMxV65JJ7gnwfxHb8SfwCuYqR+v2PyJg" + tail,
        header + "bSURBVGhD7dVRjtswDATQucnc/1ZzkAKzH0PKdtGii9AfXYB0Ykvioz5Mx4G/H7/wL3GLxff4f7AAAKAtgGJlRKvXSiweYSaXrA4XLVQu58UzfJoh2kLQqQZbLH4DC3XvT7WQ4sVvYndLErWQ6+I3cHKdsi2gHXgWF88wAADU348Siyf4CvF8b824YvEEKy3BeeC7DKcmx+IRtpOwBVBVIbBL8rEXD3FyojOus5hPVrx4jCOSPN9HffqyeISFNgBTU4Vno5jFI1whgKnDebELFxUXj7CYuZjlEtEpynTxFIsW0JiuWSq6Q4tHWGDxrMWLQn4EnfHiF3Apq0WBlICLp9gWaKFqAIBKWnXKNlw8w4l0RSjNmtO1XTVl8Yf4IGbpFAPXXKC4eIIzrJqTpFNPncYsnmGB/s3eyzO080tZ/DmmRT9sZftiC+DiMfbjjVJMoLIawcUjnK6orXjvkQD0RouHuOfXgL2BaLteN4uHmH3qEO2WV27xCAs8837mb6NsBS6eYXX6Hr2Yx160BS6e4Rx/rBCFk188w74985c7oxTgdHDxh7jmT24BpfqPdPEEn+SlhSoWVVBcPMO56+DB6QTFaySKecks/hjTfraE9bEtIE2xF09x3/hjLbCuoE7LFr+CwQcO9dmj/zQXTzHAYhbodMPJWvTiGbZtHd4tsMVrICweYgAAWDc/lnUSBdZ+i0f4+7H4Hj8SfwHjVqVvacHp/A" + tail
    ];
    var donate = document.createElement("p");
    donate.id = "donate";
    donate.textContent = "啊哈，不考虑资助一下贫苦的山区儿童么（雾";
    var qrcode = document.createElement("img");
    qrcode.id = "qrcode";
    qrcode.src = empty;
    donate.addEventListener("mouseover", function () { return setTimeout(function () { return qrcode.src = "data:image/png;base64," + qrcodes[Math.floor(Math.random() * qrcodes.length)]; }, 201); });
    donate.addEventListener("mouseout", function () { return setTimeout(function () { return qrcode.src = empty; }, 201); });
    qrContainer.appendChild(donate);
    qrContainer.appendChild(qrcode);
});
var kon = {
    data: [
        {
            title: "中文",
            lang: "zh",
            blockquote: "夜空彼方与飞机尾云",
            content: ["唯「以后我们也能一直组乐队就好了」", "律「是啊」", "紬「嗯」", "梓「是啊」", "澪「嗯。就这样，直到永远吧」"]
        }, {
            title: "日本語",
            lang: "jp",
            blockquote: "夜空ノムコウとひこうき雲",
            content: ["唯「これからもずっと、みんなでバンドできたらいいね」", "律「そうだな」", "紬「うん」", "梓「そうですね」", "澪「ああ。ずっと、ずっとな」"]
        }, {
            title: "English",
            lang: "en",
            blockquote: "Translation Server Error :)",
            content: ["Yui「I hope I can playing in a band with you guys forever」", "Ritsu「I konw what you mean」", "Mugi「Hum」", "Azusa「Me, too」", "Mio「Yeah! Forever. And ever」"]
        }
    ],
    className: "lang",
    title: "K-ON!! EP12",
    url: "http://www.tbs.co.jp/anime/k-on/k-on_tv/story/story212.html"
};
document.addEventListener("DOMContentLoaded", function () {
    var konContainer = document.getElementById("kon-container");
    if (konContainer === null) {
        return;
    }
    function getElement(value) {
        var div = document.createElement("div");
        div.className = kon.className;
        div.title = value.title;
        div.lang = value.lang;
        div.classList.add("none");
        var blockquote = document.createElement("blockquote");
        blockquote.textContent = value.blockquote;
        div.appendChild(blockquote);
        value.content.forEach(function (element) {
            var p = document.createElement("p");
            p.textContent = element;
            div.appendChild(p);
        });
        var source = document.createElement("p");
        source.style.textAlign = "right";
        source.title = kon.title;
        var link = document.createElement("a");
        link.href = kon.url;
        link.text = kon.title;
        source.appendChild(document.createTextNode("—— "));
        source.appendChild(link);
        div.appendChild(source);
        return div;
    }
    var lang = [];
    var selector = document.getElementById("langSelect");
    kon.data.forEach(function (value) {
        var div = getElement(value);
        lang.push(div);
        konContainer.appendChild(div);
    });
    var currentLanguageIndex = 0;
    var currentLanguage = window.navigator.language;
    lang.forEach(function (value, index) {
        var opt = document.createElement("option");
        opt.value = index.toString();
        opt.innerHTML = value.getAttribute("title");
        selector.appendChild(opt);
        if (currentLanguage.indexOf(value.getAttribute("lang")) >= 0) {
            currentLanguageIndex = index;
        }
    });
    var lastSelectedLanguageIndex = -1;
    selector.addEventListener("change", function (event) {
        var selectedIndex = parseInt(event.target.value, 10);
        if (lastSelectedLanguageIndex !== -1) {
            lang[lastSelectedLanguageIndex].classList.add("none");
        }
        lastSelectedLanguageIndex = selectedIndex;
        lang[selectedIndex].classList.remove("none");
    });
    selector.options.selectedIndex = currentLanguageIndex;
    selector.dispatchEvent(new Event("change"));
});
window.addEventListener("load", function () {
    var banner = document.querySelector("header.intro-header");
    var style = window.getComputedStyle(banner);
    if (style.backgroundImage === "none") {
        var pattern = GeoPattern.generate(document.location.href);
        banner.style.backgroundImage = pattern.toDataUrl();
    }
    var pList = document.querySelectorAll(".post-content p");
    for (var i = 0; i < pList.length; ++i) {
        var p = pList[i];
        if (Lib.startsWith(p.innerText, "//")) {
            p.style.color = "#339966";
        }
    }
    var aList = document.querySelectorAll(".post-content a");
    for (var i = 0; i < aList.length; ++i) {
        var a = aList[i];
        if (Lib.isExternal(a.href)) {
            a.classList.add("external");
        }
    }
});
document.addEventListener("DOMContentLoaded", function () {
    if (document.querySelector("#tag_cloud") === null) {
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
    tags.sort(function (lhs, rhs) {
        if (lhs.title === rhs.title) {
            return 0;
        }
        if (lhs.title < rhs.title) {
            return -1;
        }
        return 1;
    });
    RemoveItemsByClassName("tag");
    var tagCloud = document.getElementById("tag_cloud");
    for (var _i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
        var tag = tags_1[_i];
        tagCloud.appendChild(tag);
    }
    var config = {
        color: { start: "#bbbbee", end: "#0085a1" },
        size: { start: 1, end: 1.1, unit: "em" }
    };
    Lib.tagcloud(document.querySelectorAll("#tag_cloud a"), config);
});
document.addEventListener("DOMContentLoaded", function () {
    var tables = document.querySelectorAll("table");
    for (var i = 0; i < tables.length; ++i) {
        var table = tables[i];
        table.classList.add("table");
        $(table).wrap("<div class='table-responsive'></div>");
    }
    $('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>').addClass("embed-responsive-item");
    $('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>').addClass("embed-responsive-item");
    (function () {
        var MQL = 1170;
        var navbar = document.querySelector(".navbar-custom");
        var catalog = document.querySelector(".side-catalog");
        var headerHeight = navbar.clientHeight;
        var bannerHeight = document.querySelector(".intro-header .container").clientHeight;
        function updateBanner(currentTop, previousTop) {
            if (window.innerWidth > MQL) {
                if (currentTop < previousTop) {
                    if (currentTop > 0 && navbar.classList.contains("is-fixed")) {
                        navbar.classList.add("is-visible");
                    }
                    else {
                        navbar.classList.remove("is-visible", "is-fixed");
                    }
                }
                else {
                    navbar.classList.remove("is-visible");
                    if (currentTop > headerHeight && !navbar.classList.contains("is-fixed")) {
                        navbar.classList.add("is-fixed");
                    }
                }
                if (catalog === null) {
                    return;
                }
                catalog.style.display = "block";
                if (currentTop > bannerHeight) {
                    catalog.classList.add("fixed");
                }
                else {
                    catalog.classList.remove("fixed");
                }
            }
        }
        var lastKnownScrollPosition = 0;
        var ticking = false;
        var BannerAnimation = function (e) {
            if (!ticking) {
                var previousTop_1 = lastKnownScrollPosition;
                window.requestAnimationFrame(function () {
                    updateBanner(window.scrollY, previousTop_1);
                    ticking = false;
                });
            }
            ticking = true;
            lastKnownScrollPosition = window.scrollY;
        };
        window.addEventListener("scroll", BannerAnimation);
        window.addEventListener("resize", BannerAnimation);
    })();
    var $gotop = $("#gotop");
    $gotop.click(function () { return $("html, body").animate({ scrollTop: 0 }, 1000); });
    $(window).scroll({ passive: true }, function () { return $gotop.toggleClass("active", $(window).scrollTop() > 300); });
    new Lib.Nav().Init();
    new Lib.Title(["_(:3 」∠)_", "_(・ω・｣∠)_", "_(:з)∠)_", "_(┐「ε:)_", "_(:3」∠❀",
        "_(:зゝ∠)_", "_(:3」[＿]", "ヾ(:3ﾉｼヾ)ﾉｼ", "(¦3ꇤ[▓▓]", "_( -ω-` )⌒)_"]).Init();
    new Lib.Quote(".copyright", "quote").Init(Math.pow(10, 4));
});
var Lib;
(function (Lib) {
    var Nav = (function () {
        function Nav() {
            this.navbar = document.querySelector("#blog_navbar");
            this.toggle = document.querySelector(".navbar-toggle");
            this.collapse = document.querySelector(".navbar-collapse");
        }
        Nav.prototype.Init = function () {
            var _this = this;
            this.toggle.addEventListener("click", function (e) {
                if (_this.navbar.classList.contains("in")) {
                    _this.close();
                }
                else {
                    _this.open();
                }
            });
            document.addEventListener("click", function (e) {
                if (e.target === _this.toggle ||
                    e.target.className === "icon-bar") {
                    return;
                }
                _this.close();
            });
        };
        Nav.prototype.close = function () {
            var _this = this;
            this.toggle.classList.add("is-collapsed");
            this.navbar.classList.remove("in");
            setTimeout(function () {
                if (!_this.navbar.classList.contains("in")) {
                    _this.collapse.style.height = "0";
                }
            }, 400);
        };
        Nav.prototype.open = function () {
            this.navbar.classList.add("in");
            this.toggle.classList.remove("is-collapsed");
            this.collapse.style.height = "auto";
        };
        return Nav;
    }());
    Lib.Nav = Nav;
})(Lib || (Lib = {}));
var Lib;
(function (Lib) {
    var Quote = (function () {
        function Quote(containerSelector, className) {
            var _this = this;
            this.RandomQuote = function () {
                if (_this.quotes === undefined) {
                    clearTimeout(_this.timer);
                    return;
                }
                var quote = _this.quotes[Math.floor(Math.random() * _this.quotes.length)];
                var text = quote.text[Math.floor(Math.random() * quote.text.length)];
                return {
                    text: text,
                    author: quote.author,
                    source: quote.source
                };
            };
            this.CreateElement = function (info) {
                var className = info.className !== undefined ? info.className : "";
                var style = info.cssText !== undefined ? info.cssText : "";
                var element = document.createElement(info.tagName);
                element.className = className;
                element.style.cssText = style;
                if (typeof info.content === "string") {
                    element.textContent = info.content;
                }
                else {
                    info.content.forEach(function (item) {
                        element.appendChild(item);
                    });
                }
                return element;
            };
            this.CreateQuote = function () {
                var quoteDiv = _this.CreateElement({
                    tagName: "div",
                    className: "quote-content",
                    cssText: "margin-top:2em;margin-bottom:-2em;",
                    content: ""
                });
                var authorDiv = _this.CreateElement({
                    tagName: "small",
                    className: "quote-author",
                    cssText: "margin-left:16em;",
                    content: ""
                });
                return [quoteDiv, document.createElement("br"), authorDiv];
            };
            this.container = this.CreateElement({
                tagName: "div",
                className: className,
                content: this.CreateQuote()
            });
            document.querySelector(containerSelector).appendChild(this.container);
        }
        Quote.prototype.Init = function (timeout) {
            var _this = this;
            this.FetchData(function () {
                _this.UpdateQuote();
                _this.Interval(timeout);
            });
        };
        Quote.prototype.UpdateQuote = function () {
            var quote = this.RandomQuote();
            this.container.querySelector(".quote-content").textContent = quote.text;
            this.container.querySelector(".quote-author").textContent = "\u2014\u2014 " + quote.author + " \u300A" + quote.source + "\u300B";
        };
        Quote.prototype.Interval = function (timeout) {
            var _this = this;
            this.timer = setInterval(function () {
                _this.UpdateQuote();
            }, timeout);
        };
        Quote.prototype.FetchData = function (callBack) {
            var _this = this;
            var baseurl = document.head.querySelector("meta[name=baseurl]").content;
            var url = "/json/quote.json";
            if (baseurl !== undefined && baseurl !== "") {
                url = baseurl + url;
            }
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onload = function () {
                if (xhr.readyState === 4 && xhr.getResponseHeader("content-type").indexOf("application/json") !== -1) {
                    _this.quotes = JSON.parse(xhr.responseText);
                    callBack();
                }
                else {
                    console.error(xhr);
                }
            };
            xhr.onerror = function () {
                console.error(xhr.statusText);
            };
            xhr.send();
        };
        return Quote;
    }());
    Lib.Quote = Quote;
})(Lib || (Lib = {}));
var Lib;
(function (Lib) {
    function tagcloud(tags, options) {
        if (options === void 0) { options = {}; }
        var defaults = {
            size: { start: 14, end: 18, unit: "pt" },
            color: { start: "#bbbbee", end: "#0085a1" }
        };
        var opts = {
            color: options.color !== undefined ? options.color : defaults.color,
            size: options.size !== undefined ? options.size : defaults.size
        };
        var lowest = 0x3F3F3F3F;
        var highest = 0;
        for (var i = 0; i < tags.length; ++i) {
            var element = tags[i];
            var curr = parseInt(element.getAttribute("rel"), 10);
            lowest = Math.min(lowest, curr);
            highest = Math.max(highest, curr);
        }
        var range = highest - lowest;
        if (range === 0) {
            range = 1;
        }
        var fontIncr = (opts.size.end - opts.size.start) / range;
        var colorIncr = colorIncrement(opts, range);
        for (var i = 0; i < tags.length; ++i) {
            var element = tags[i];
            var weighting = parseInt(element.getAttribute("rel"), 10) - lowest;
            element.style.fontSize = (opts.size.start + (weighting * fontIncr)).toString() + opts.size.unit;
            element.style.backgroundColor = tagColor(opts, colorIncr, weighting);
        }
    }
    Lib.tagcloud = tagcloud;
    function toRGB(code) {
        var ret = code;
        if (/#[0-9a-fA-F]{3}/.test(ret)) {
            var r = ret[1] + ret[1];
            var g = ret[2] + ret[2];
            var b = ret[3] + ret[3];
            ret = "#" + (r + g + b);
        }
        var hex = /(\w{2})(\w{2})(\w{2})/.exec(ret);
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
})(Lib || (Lib = {}));
var Lib;
(function (Lib) {
    var Title = (function () {
        function Title(titles) {
            this.titles = titles;
            this.initalTitle = document.title;
            this.restoreTitleID = null;
        }
        Title.prototype.Init = function () {
            var _this = this;
            document.addEventListener("visibilitychange", function (event) {
                if (!document.hidden) {
                    document.title = "．．．．．．";
                    if (_this.restoreTitleID !== null) {
                        clearTimeout(_this.restoreTitleID);
                    }
                    _this.restoreTitleID = setTimeout(function () {
                        document.title = _this.initalTitle;
                        _this.restoreTitleID = null;
                    }, 500);
                }
                else {
                    if (_this.restoreTitleID !== null) {
                        clearTimeout(_this.restoreTitleID);
                    }
                    document.title = _this.titles[Math.floor(Math.random() * _this.titles.length)] + " " + _this.initalTitle;
                }
            });
        };
        return Title;
    }());
    Lib.Title = Title;
})(Lib || (Lib = {}));
var Lib;
(function (Lib) {
    function startsWith(text, searchString, position) {
        return text.substr(position === undefined ? 0 : position, searchString.length) === searchString;
    }
    Lib.startsWith = startsWith;
    function checkDomain(url) {
        var ret = url;
        if (ret.indexOf("//") === 0) {
            ret = location.protocol + ret;
        }
        return ret.toLowerCase().replace(/([a-z])?:\/\//, "$1").split("/")[0];
    }
    Lib.checkDomain = checkDomain;
    function isExternal(url) {
        return (url.length > 1 && url.indexOf(":") > -1 || url.indexOf("//") > -1) &&
            checkDomain(location.href) !== checkDomain(url);
    }
    Lib.isExternal = isExternal;
})(Lib || (Lib = {}));

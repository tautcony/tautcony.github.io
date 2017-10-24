$(document).ready(function () {
    var cd64 = "|$$$}rstuvwxyz{$$$$$$$>?@ABCDEFGHIJKLMNOPQRSTUVW$$$$$$XYZ[\\]^_`abcdefghijklmnopq";
    function decode_block(str, offset) {
        var input = [0, 0, 0];
        for (var i = offset; i < offset + 4; ++i) {
            var c = str.charCodeAt(i);
            var v = (c >= 43 && c <= 122) ? cd64[c - 43] === "$" ? 0 : cd64.charCodeAt(c - 43) - 61 : 0;
            input[i - offset] = v - 1;
        }
        return String.fromCharCode((((input[0] << 2) & 0xFF) | (input[1] >> 4)), (((input[1] << 4) & 0xFF) | (input[2] >> 2)), (((input[2] << 6) & 0xC0) | (input[3] >> 0)));
    }
    function decode(str) {
        var ret = "";
        for (var i = 0; i < str.length; i += 4) {
            ret += decode_block(str, i);
        }
        return ret;
    }
    var qrContainer = document.getElementById("qr-container");
    if (qrContainer === null) {
        return;
    }
    var donate = document.createElement("p");
    donate.id = "donate";
    donate.textContent = "啊哈，不考虑资助一下贫苦的山区儿童么（雾";
    var qrcode = document.createElement("img");
    qrcode.id = "qrcode";
    var qrUrl = "L2ltZy9hbGlwYXlfcXIucG5n";
    donate.addEventListener("mouseover", function () { return setTimeout(function () { return qrcode.src = decode(qrUrl); }, 201); });
    donate.addEventListener("mouseout", function () { return setTimeout(function () { return qrcode.src = ""; }, 201); });
    qrContainer.appendChild(donate);
    qrContainer.appendChild(qrcode);
});
var kon = {
    data: [
        {
            title: "中文",
            lang: "zh",
            blockquote: "夜空彼方与飞机尾云",
            content: ["唯「以后我们也能一直组乐队就好了」", "律「是啊」", "紬「嗯」", "梓「是啊」", "澪「嗯。就这样，直到永远吧」"],
        }, {
            title: "日本語",
            lang: "jp",
            blockquote: "夜空ノムコウとひこうき雲",
            content: ["唯「これからもずっと、みんなでバンドできたらいいね」", "律「そうだな」", "紬「うん」", "梓「そうですね」", "澪「ああ。ずっと、ずっとな」"],
        }, {
            title: "English",
            lang: "en",
            blockquote: "Translation Server Error :)",
            content: ["Yui「I hope I can playing in a band with you guys forever」", "Ritsu「I konw what you mean」", "Mugi「Hum」", "Azusa「Me, too」", "Mio「Yeah! Forever. And ever」"],
        },
    ],
    class: "lang",
    title: "K-ON!! EP12",
    url: "http://www.tbs.co.jp/anime/k-on/k-on_tv/story/story212.html",
};
$(document).ready(function () {
    var konContainer = document.getElementById("kon-container");
    if (konContainer === null) {
        return;
    }
    function getElement(index) {
        var div = document.createElement("div");
        div.className = kon.class;
        div.title = kon.data[index].title;
        div.lang = kon.data[index].lang;
        div.style.display = "none";
        var blockquote = document.createElement("blockquote");
        blockquote.textContent = kon.data[index].blockquote;
        div.appendChild(blockquote);
        kon.data[index].content.forEach(function (element) {
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
    for (var i = 0; i < kon.data.length; ++i) {
        konContainer.appendChild(getElement(i));
    }
    var lang = document.getElementsByClassName("lang");
    var selecter = document.getElementById("langSelect");
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
$(document).ready(function () {
    var banner = $("header.intro-header");
    if (banner.css("background-image") === "none") {
        banner.geopattern(document.location.href);
    }
    new Lib.Nav().Init();
    var post = $(".post-content");
    if (post.length !== 0) {
        post.children("p").each(function (index, value) {
            var p = $(value);
            if (Lib.startsWith(p.text(), "//")) {
                p.css({ color: "#339966" });
            }
        });
        post.find("a").each(function (index, value) {
            if (Lib.isExternal(value.href)) {
                $(value).addClass("external");
            }
        });
    }
});
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
    Lib.tagcloud($("#tag_cloud a"), config);
});
$(document).ready(function () {
    $("table").wrap("<div class='table-responsive'></div>");
    $("table").addClass("table");
    $('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>').addClass("embed-responsive-item");
    $('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>').addClass("embed-responsive-item");
    (function () {
        var MQL = 1170;
        if ($(window).width() > MQL) {
            var headerHeight_1 = $(".navbar-custom").height();
            var bannerHeight_1 = $(".intro-header .container").height();
            $(window).scroll({ previousTop: 0, passive: true }, function (event) {
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
    $("#gotop").click(function () { return $("html, body").animate({ scrollTop: 0 }, 1000); });
    $(window).scroll({ passive: true }, function () { return $("#gotop").toggleClass("active", $(window).scrollTop() > 300); });
    new Lib.Title(["_(:3 」∠)_", "_(・ω・｣∠)_", "_(:з)∠)_", "_(┐「ε:)_", "_(:3」∠❀",
        "_(:зゝ∠)_", "_(:3」[＿]", "ヾ(:3ﾉｼヾ)ﾉｼ", "(¦3ꇤ[▓▓]", "_( -ω-` )⌒)_"]).Init();
    new Lib.Quote(".copyright", "quote").Interval(Math.pow(10, 4));
});
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
                if (_this.navbar.className.indexOf("in") > 0) {
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
            this.navbar.className = " ";
            setTimeout(function () {
                if (_this.navbar.className.indexOf("in") < 0) {
                    _this.collapse.style.height = "0";
                }
            }, 400);
        };
        Nav.prototype.open = function () {
            this.collapse.style.height = "auto";
            this.navbar.className += " in";
        };
        return Nav;
    }());
    Lib.Nav = Nav;
})(Lib || (Lib = {}));
var Lib;
(function (Lib) {
    var quotes = [
        {
            org: "Was ist schlecht? - Alles, was aus der Schwäche stammt.",
            jpn: "悪とは何か──弱さから生ずるすべてのものだ。",
            chi: "何謂惡──即一切源自於軟弱之物。",
            aut: "Friedrich Wilhelm Nietzsche",
            sou: "Der Antichrist",
        },
        {
            org: "C'est une grande habileté que de savoir cacher son habileté.",
            jpn: "才能を隠すのにも卓越した才能がいる。",
            chi: "要隱藏天分也需要卓越的天分。",
            aut: "François VI, duc de La Rochefoucauld",
            sou: "Réflexions ou sentences et maximes morales",
        },
        {
            org: "Man is an only animal that makes bargains: no dog exchanges bones with another.",
            jpn: "人間は取引をする唯一の動物である。骨を交換する犬はいない。",
            chi: "人類是唯一會交易的動物。沒有狗會交換骨頭",
            aut: "Adam Smith",
            sou: "The Wealth of Nations",
        },
        {
            org: "Il ne faut pas s'offenser que les autres nous chachent la vérité.\npuisque nous nous la cachons si souvent à nous-mêmes.",
            jpn: "他人が真実を隠蔽することに対して、我々は怒るべきでない。\nなぜなら、我々も自身から真実を隠蔽するのであるから。",
            chi: "他人隱瞞真相，我們不應當發怒。\n因為我們自己也會隱瞞真相。",
            aut: "François VI, duc de La Rochefoucauld",
            sou: "Réflexions ou sentences et maximes morales",
        },
        {
            org: "l'enfer, c'est les autres.",
            jpn: "地獄、それは他人である。",
            chi: "他人即地獄",
            aut: "Jean-Paul Sartre",
            sou: "Huis clos",
        },
        {
            org: "Il y a deux sortes de mensonges: celui de fait qui regarde le passé, celui de droit qui regarde l' avenir.",
            jpn: "嘘には二種類ある。\n過去に関する事実上の嘘と未来に関する権利上の嘘である。",
            chi: "謊言分為兩種。\n與過去相關的事實上的謊言與未來相關的權利上的謊言。",
            aut: "Jean-Jacques Rousseau",
            sou: "Émile: ou De l'éducation",
        },
        {
            org: "Rein n'est si dangereux qu'un ignorant ami; Mieux vaudrait un sage ennemi.",
            jpn: "無知な友人ほど危険なものはない。\n賢い敵のほうがよっぽどましだ。",
            chi: "寧可有聰明的敵人也不要有無知的朋友。",
            aut: "Jean de La Fontaine",
            sou: "Fables choisies",
        },
        {
            org: "Lasciate ogni speranza, voi ch'entrate.",
            jpn: "汝等ここに入るもの、一切の望みを捨てよ。",
            chi: "進入此地者，當捨棄一切希望。",
            aut: "Dante Alighieri",
            sou: "Divina Commedia",
        },
        {
            org: "L'homme est condamné à être libre.",
            jpn: "人間は自由の刑に処されている。",
            chi: "人類被處以自由之刑。",
            aut: "Jean-Paul Sartre",
            sou: "L'existentialisme est un humanisme",
        },
        {
            org: "Den farligste Forræder blandt alle er den, ethvert Menneske har i sig selv.",
            jpn: "裏切者の中で最も危険なる裏切者は何かといえば、すべての人間が己れ自身の内部にかくしているところのものである。",
            chi: "背叛者中最危險的背叛者是將所有人藏於已身者。",
            aut: "Søren Aabye Kierkegaard",
            sou: "Kjerlighedens Gjerninger",
        },
        {
            org: "Was aber die Leute gemeiniglich das Shicksal nennen sind meistens nur ihre eigenen dummen Streiche.",
            jpn: "しかし、概して人々が運命と呼ぶものは、大半が自分の愚行にすぎない。",
            chi: "然而，基本上人們稱之為命運的大多只是自己的愚行。",
            aut: "Arthur Schopenhauer",
            sou: "Parerga und Paralipomena",
        },
        {
            org: "Das Genie wohnt nur eine Etage höher als der Wahnsinn.",
            jpn: "天才とは、狂気よりも1階層分だけ上に住んでいる者のことである。",
            chi: "所謂的天才，指的是比瘋狂更上一層的人。",
            aut: "Arthur Schopenhauer",
            sou: "Parerga und Paralipomena",
        },
    ];
    var Quote = (function () {
        function Quote(containerSelector, className) {
            var _this = this;
            this.RandomQuote = function () {
                var quote = quotes[Math.floor(Math.random() * quotes.length)];
                var text = [quote.org, quote.chi, quote.jpn][Math.floor(Math.random() * 3)];
                return {
                    text: text,
                    author: quote.aut,
                    source: quote.sou,
                };
            };
            this.CreateElement = function (info) {
                var className = info.className !== undefined ? info.className : "";
                var style = info.cssText !== undefined ? info.cssText : "";
                var element = document.createElement(info.tagName);
                element.className = className;
                element.style.cssText = info.cssText;
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
                    content: "",
                });
                var authorDiv = _this.CreateElement({
                    tagName: "small",
                    className: "quote-author",
                    cssText: "margin-left:16em;",
                    content: "",
                });
                return [quoteDiv, document.createElement("br"), authorDiv];
            };
            var wrapper = this.CreateElement({
                tagName: "div",
                className: className,
                content: this.CreateQuote(),
            });
            document.querySelector(containerSelector).appendChild(wrapper);
            this.container = document.querySelector(containerSelector + " ." + className);
            this.UpdateQuote();
        }
        Quote.prototype.UpdateQuote = function () {
            var quote = this.RandomQuote();
            this.container.querySelector(".quote-content").textContent = quote.text;
            this.container.querySelector(".quote-author").textContent = "\u2014\u2014 " + quote.author + " \u300A" + quote.source + "\u300B";
        };
        Quote.prototype.Interval = function (timeout) {
            var _this = this;
            setInterval(function () {
                _this.UpdateQuote();
            }, timeout);
        };
        return Quote;
    }());
    Lib.Quote = Quote;
})(Lib || (Lib = {}));
var Lib;
(function (Lib) {
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
        var fontIncr = (opts.size.end - opts.size.start) / range;
        var colorIncr = colorIncrement(opts, range);
        return tags.each(function (index, elem) {
            var weighting = parseInt($(elem).attr("rel"), 10) - lowest;
            $(elem).css({ "font-size": (opts.size.start + (weighting * fontIncr)).toString() + opts.size.unit });
            $(elem).css({ backgroundColor: tagColor(opts, colorIncr, weighting) });
        });
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
            this.restoreTitleID = 0;
        }
        Title.prototype.Init = function () {
            var _this = this;
            document.addEventListener("visibilitychange", function (event) {
                if (!document.hidden) {
                    document.title = "．．．．．．";
                    if (_this.restoreTitleID !== 0) {
                        clearTimeout(_this.restoreTitleID);
                    }
                    _this.restoreTitleID = setTimeout(function () {
                        document.title = _this.initalTitle;
                        _this.restoreTitleID = 0;
                    }, 500);
                }
                else {
                    if (_this.restoreTitleID !== 0) {
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

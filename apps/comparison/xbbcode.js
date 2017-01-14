var XBBCODE;
(function (XBBCODE) {
    var urlPattern = /^(?:https?|file|c):(?:\/{1;3}|\\{1})[-a-zA-Z0-9:;@#%&()~_?\+=\/\\\.]*$/;
    var colorNamePattern = /^(?:aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)$/;
    var colorCodePattern = /^[#]?[a-fA-F0-9]{6}$/;
    var emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    var fontFacePattern = /^([a-z][a-z0-9_]+|"[a-z][a-z0-9_\s]+")$/i;
    var bbRegExp;
    var pbbRegExp;
    var pbbRegExp2;
    var openTags;
    var closeTags;
    var tagList;
    var tagsNoParseList = [];
    var tags = {
        "b": {
            openTag: function (params, content) {
                return '<span class="xbbcode-b">';
            },
            closeTag: function (params, content) {
                return '</span>';
            }
        },
        "bbcode": {
            openTag: function (params, content) {
                return '';
            },
            closeTag: function (params, content) {
                return '';
            }
        },
        "center": {
            openTag: function (params, content) {
                return '<span class="xbbcode-center">';
            },
            closeTag: function (params, content) {
                return '</span>';
            }
        },
        "code": {
            openTag: function (params, content) {
                return '<span class="xbbcode-code">';
            },
            closeTag: function (params, content) {
                return '</span>';
            },
            noParse: true
        },
        "color": {
            openTag: function (params, content) {
                params = params || '';
                var colorCode = (params.substr(1)).toLowerCase() || "black";
                colorNamePattern.lastIndex = 0;
                colorCodePattern.lastIndex = 0;
                if (!colorNamePattern.test(colorCode)) {
                    if (!colorCodePattern.test(colorCode)) {
                        colorCode = "black";
                    }
                    else {
                        if (colorCode.substr(0, 1) !== "#") {
                            colorCode = "#" + colorCode;
                        }
                    }
                }
                return "<span style=\"color:" + colorCode + "\">";
            },
            closeTag: function (params, content) {
                return '</span>';
            }
        },
        "email": {
            openTag: function (params, content) {
                var myEmail;
                if (!params) {
                    myEmail = content.replace(/<.*?>/g, "");
                }
                else {
                    myEmail = params.substr(1);
                }
                emailPattern.lastIndex = 0;
                if (!emailPattern.test(myEmail)) {
                    return '<a>';
                }
                return "<a href=\"mailto:\"" + myEmail + "\">";
            },
            closeTag: function (params, content) {
                return '</a>';
            }
        },
        "face": {
            openTag: function (params, content) {
                params = params || '';
                var faceCode = params.substr(1) || "inherit";
                fontFacePattern.lastIndex = 0;
                if (!fontFacePattern.test(faceCode)) {
                    faceCode = "inherit";
                }
                return "<span style=\"font-family:" + faceCode + "\">";
            },
            closeTag: function (params, content) {
                return '</span>';
            }
        },
        "font": {
            openTag: function (params, content) {
                params = params || '';
                var faceCode = params.substr(1) || "inherit";
                fontFacePattern.lastIndex = 0;
                if (!fontFacePattern.test(faceCode)) {
                    faceCode = "inherit";
                }
                return "<span style=\"font-family:" + faceCode + "\">";
            },
            closeTag: function (params, content) {
                return '</span>';
            }
        },
        "i": {
            openTag: function (params, content) {
                return '<span class="xbbcode-i">';
            },
            closeTag: function (params, content) {
                return '</span>';
            }
        },
        "img": {
            openTag: function (params, content) {
                var myUrl = content;
                urlPattern.lastIndex = 0;
                if (!urlPattern.test(myUrl)) {
                    myUrl = "";
                }
                return "<img src=\"" + myUrl + "\" />";
            },
            closeTag: function (params, content) {
                return '';
            },
            displayContent: false
        },
        "justify": {
            openTag: function (params, content) {
                return '<span class="xbbcode-justify">';
            },
            closeTag: function (params, content) {
                return '</span>';
            }
        },
        "large": {
            openTag: function (params, content) {
                params = params || '';
                var colorCode = params.substr(1) || "inherit";
                colorNamePattern.lastIndex = 0;
                colorCodePattern.lastIndex = 0;
                if (!colorNamePattern.test(colorCode)) {
                    if (!colorCodePattern.test(colorCode)) {
                        colorCode = "inherit";
                    }
                    else {
                        if (colorCode.substr(0, 1) !== "#") {
                            colorCode = "#" + colorCode;
                        }
                    }
                }
                return "<span class=\"xbbcode-size-36\" style=\"color:" + colorCode + "\">";
            },
            closeTag: function (params, content) {
                return '</span>';
            }
        },
        "left": {
            openTag: function (params, content) {
                return '<span class="xbbcode-left">';
            },
            closeTag: function (params, content) {
                return '</span>';
            }
        },
        "li": {
            openTag: function (params, content) {
                return "<li>";
            },
            closeTag: function (params, content) {
                return "</li>";
            },
            restrictParentsTo: ["list", "ul", "ol"]
        },
        "list": {
            openTag: function (params, content) {
                return '<ul>';
            },
            closeTag: function (params, content) {
                return '</ul>';
            },
            restrictChildrenTo: ["*", "li"]
        },
        "noparse": {
            openTag: function (params, content) {
                return '';
            },
            closeTag: function (params, content) {
                return '';
            },
            noParse: true
        },
        "ol": {
            openTag: function (params, content) {
                return '<ol>';
            },
            closeTag: function (params, content) {
                return '</ol>';
            },
            restrictChildrenTo: ["*", "li"]
        },
        "php": {
            openTag: function (params, content) {
                return '<span class="xbbcode-code">';
            },
            closeTag: function (params, content) {
                return '</span>';
            },
            noParse: true
        },
        "quote": {
            openTag: function (params, content) {
                return '<blockquote class="xbbcode-blockquote">';
            },
            closeTag: function (params, content) {
                return '</blockquote>';
            }
        },
        "right": {
            openTag: function (params, content) {
                return '<span class="xbbcode-right">';
            },
            closeTag: function (params, content) {
                return '</span>';
            }
        },
        "s": {
            openTag: function (params, content) {
                return '<span class="xbbcode-s">';
            },
            closeTag: function (params, content) {
                return '</span>';
            }
        },
        "size": {
            openTag: function (params, content) {
                params = params || '';
                var mySize = parseInt(params.substr(1), 10) || 0;
                if (mySize < 4 || mySize > 40) {
                    mySize = 14;
                }
                return "<span class=\"xbbcode-size-" + mySize + "\">";
            },
            closeTag: function (params, content) {
                return '</span>';
            }
        },
        "small": {
            openTag: function (params, content) {
                params = params || '';
                var colorCode = params.substr(1) || "inherit";
                colorNamePattern.lastIndex = 0;
                colorCodePattern.lastIndex = 0;
                if (!colorNamePattern.test(colorCode)) {
                    if (!colorCodePattern.test(colorCode)) {
                        colorCode = "inherit";
                    }
                    else {
                        if (colorCode.substr(0, 1) !== "#") {
                            colorCode = "#" + colorCode;
                        }
                    }
                }
                return "<span class=\"xbbcode-size-10\" style=\"color:" + colorCode + "\">";
            },
            closeTag: function (params, content) {
                return '</span>';
            }
        },
        "sub": {
            openTag: function (params, content) {
                return '<sub>';
            },
            closeTag: function (params, content) {
                return '</sub>';
            }
        },
        "sup": {
            openTag: function (params, content) {
                return '<sup>';
            },
            closeTag: function (params, content) {
                return '</sup>';
            }
        },
        "table": {
            openTag: function (params, content) {
                return '<table class="xbbcode-table">';
            },
            closeTag: function (params, content) {
                return '</table>';
            },
            restrictChildrenTo: ["tbody", "thead", "tfoot", "tr"]
        },
        "tbody": {
            openTag: function (params, content) {
                return '<tbody>';
            },
            closeTag: function (params, content) {
                return '</tbody>';
            },
            restrictChildrenTo: ["tr"],
            restrictParentsTo: ["table"]
        },
        "tfoot": {
            openTag: function (params, content) {
                return '<tfoot>';
            },
            closeTag: function (params, content) {
                return '</tfoot>';
            },
            restrictChildrenTo: ["tr"],
            restrictParentsTo: ["table"]
        },
        "thead": {
            openTag: function (params, content) {
                return '<thead class="xbbcode-thead">';
            },
            closeTag: function (params, content) {
                return '</thead>';
            },
            restrictChildrenTo: ["tr"],
            restrictParentsTo: ["table"]
        },
        "td": {
            openTag: function (params, content) {
                return '<td class="xbbcode-td">';
            },
            closeTag: function (params, content) {
                return '</td>';
            },
            restrictParentsTo: ["tr"]
        },
        "th": {
            openTag: function (params, content) {
                return '<th class="xbbcode-th">';
            },
            closeTag: function (params, content) {
                return '</th>';
            },
            restrictParentsTo: ["tr"]
        },
        "tr": {
            openTag: function (params, content) {
                return '<tr class="xbbcode-tr">';
            },
            closeTag: function (params, content) {
                return '</tr>';
            },
            restrictChildrenTo: ["td", "th"],
            restrictParentsTo: ["table", "tbody", "tfoot", "thead"]
        },
        "u": {
            openTag: function (params, content) {
                return '<span class="xbbcode-u">';
            },
            closeTag: function (params, content) {
                return '</span>';
            }
        },
        "ul": {
            openTag: function (params, content) {
                return '<ul>';
            },
            closeTag: function (params, content) {
                return '</ul>';
            },
            restrictChildrenTo: ["*", "li"]
        },
        "url": {
            openTag: function (params, content) {
                var myUrl;
                if (!params) {
                    myUrl = content.replace(/<.*?>/g, "");
                }
                else {
                    myUrl = params.substr(1);
                }
                urlPattern.lastIndex = 0;
                if (!urlPattern.test(myUrl)) {
                    myUrl = "#";
                }
                return "<a href=\"" + myUrl + "\">";
            },
            closeTag: function (params, content) {
                return '</a>';
            }
        },
        "*": {
            openTag: function (params, content) {
                return "<li>";
            },
            closeTag: function (params, content) {
                return "</li>";
            },
            restrictParentsTo: ["list", "ul", "ol"]
        }
    };
    function initTags() {
        tagList = [];
        for (var prop in tags) {
            if (tags.hasOwnProperty(prop)) {
                if (prop === "*") {
                    tagList.push("\\" + prop);
                }
                else {
                    tagList.push(prop);
                    if (tags[prop].noParse !== undefined) {
                        tagsNoParseList.push(prop);
                    }
                }
                tags[prop].validChildLookup = {};
                tags[prop].validParentLookup = {};
                tags[prop].restrictParentsTo = tags[prop].restrictParentsTo || [];
                tags[prop].restrictChildrenTo = tags[prop].restrictChildrenTo || [];
                var len = tags[prop].restrictChildrenTo.length;
                for (var i = 0; i < len; ++i) {
                    tags[prop].validChildLookup[tags[prop].restrictChildrenTo[i]] = true;
                }
                len = tags[prop].restrictParentsTo.length;
                for (var i = 0; i < len; ++i) {
                    tags[prop].validParentLookup[tags[prop].restrictParentsTo[i]] = true;
                }
            }
        }
        bbRegExp = new RegExp("<bbcl=([0-9]+) (" + tagList.join("|") + ")([ =][^>]*?)?>((?:.|[\\r\\n])*?)<bbcl=\\1 /\\2>", "gi");
        pbbRegExp = new RegExp("\\[(" + tagList.join("|") + ")([ =][^\\]]*?)?\\]([^\\[]*?)\\[/\\1\\]", "gi");
        pbbRegExp2 = new RegExp("\\[(" + tagsNoParseList.join("|") + ")([ =][^\\]]*?)?\\]([\\s\\S]*?)\\[/\\1\\]", "gi");
        (function () {
            var closeTagList = [];
            for (var _i = 0, tagList_1 = tagList; _i < tagList_1.length; _i++) {
                var tag = tagList_1[_i];
                if (tag !== "\\*") {
                    closeTagList.push("/" + tag);
                }
            }
            openTags = new RegExp("(\\[)((?:" + tagList.join("|") + ")(?:[ =][^\\]]*?)?)(\\])", "gi");
            closeTags = new RegExp("(\\[)(" + closeTagList.join("|") + ")(\\])", "gi");
        })();
    }
    initTags();
    function checkParentChildRestrictions(parentTag, bbcode, bbcodeLevel, tagName, tagParams, tagContents, errQueue) {
        errQueue = errQueue || [];
        ++bbcodeLevel;
        var reTagNames = new RegExp("(<bbcl=" + bbcodeLevel + " )(" + tagList.join("|") + ")([ =>])", "gi");
        var reTagNamesParts = new RegExp("(<bbcl=" + bbcodeLevel + " )(" + tagList.join("|") + ")([ =>])", "i");
        var matchingTags = tagContents.match(reTagNames) || [];
        var pInfo = tags[parentTag] || undefined;
        reTagNames.lastIndex = 0;
        if (!matchingTags) {
            tagContents = "";
        }
        for (var _i = 0, matchingTags_1 = matchingTags; _i < matchingTags_1.length; _i++) {
            var matchingTag = matchingTags_1[_i];
            reTagNamesParts.lastIndex = 0;
            var childTag = (matchingTag.match(reTagNamesParts))[2].toLowerCase();
            if (pInfo && pInfo.restrictChildrenTo && pInfo.restrictChildrenTo.length > 0) {
                if (!pInfo.validChildLookup[childTag]) {
                    var errStr = "The tag \"" + childTag + "\" is not allowed as a child of the tag \"" + parentTag + "\".";
                    errQueue.push(errStr);
                }
            }
            var cInfo = tags[childTag] || undefined;
            if (cInfo.restrictParentsTo.length > 0) {
                if (!cInfo.validParentLookup[parentTag]) {
                    var errStr = "The tag \"" + parentTag + "\" is not allowed as a parent of the tag \"" + childTag + "\".";
                    errQueue.push(errStr);
                }
            }
        }
        tagContents = tagContents.replace(bbRegExp, function (matchStr, bbcodeLevel, tagName, tagParams, tagContents) {
            errQueue = checkParentChildRestrictions(tagName.toLowerCase(), matchStr, bbcodeLevel, tagName, tagParams, tagContents, errQueue);
            return matchStr;
        });
        return errQueue;
    }
    function updateTagDepths(tagContents) {
        tagContents = tagContents.replace(/\<([^\>][^\>]*?)\>/gi, function (matchStr, subMatchStr) {
            var bbCodeLevel = subMatchStr.match(/^bbcl=([0-9]+) /);
            if (bbCodeLevel === null) {
                return "<bbcl=0 " + subMatchStr + ">";
            }
            else {
                return "<" + subMatchStr.replace(/^(bbcl=)([0-9]+)/, function (matchStr, m1, m2) {
                    return m1 + (parseInt(m2, 10) + 1);
                }) + ">";
            }
        });
        return tagContents;
    }
    function unprocess(tagContent) {
        return tagContent.replace(/<bbcl=[0-9]+ \/\*>/gi, "").replace(/<bbcl=[0-9]+ /gi, "&#91;").replace(/>/gi, "&#93;");
    }
    function replaceFunct(matchStr, bbcodeLevel, tagName, tagParams, tagContents) {
        tagName = tagName.toLowerCase();
        var processedContent = tags[tagName].noParse ? unprocess(tagContents) : tagContents.replace(bbRegExp, replaceFunct), openTag = tags[tagName].openTag(tagParams, processedContent), closeTag = tags[tagName].closeTag(tagParams, processedContent);
        if (tags[tagName].displayContent === false) {
            processedContent = "";
        }
        return openTag + processedContent + closeTag;
    }
    ;
    function parse(config) {
        var output = config.text;
        output = output.replace(bbRegExp, replaceFunct);
        return output;
    }
    function fixStarTag(text) {
        text = text.replace(/\[(?!\*[ =\]]|list([ =][^\]]*)?\]|\/list[\]])/ig, "<");
        text = text.replace(/\[(?=list([ =][^\]]*)?\]|\/list[\]])/ig, ">");
        while (text !== (text = text.replace(/>list([ =][^\]]*)?\]([^>]*?)(>\/list])/gi, function (matchStr, contents, endTag) {
            var innerListTxt = matchStr;
            while (innerListTxt !== (innerListTxt = innerListTxt.replace(/\[\*\]([^\[]*?)(\[\*\]|>\/list])/i, function (matchStr, contents, endTag) {
                if (endTag.toLowerCase() === ">/list]") {
                    endTag = "</*]</list]";
                }
                else {
                    endTag = "</*][*]";
                }
                return "<*]" + contents + endTag;
            })))
                ;
            innerListTxt = innerListTxt.replace(/>/g, "<");
            return innerListTxt;
        })))
            ;
        text = text.replace(/</g, "[");
        return text;
    }
    function addBbcodeLevels(text) {
        while (text !== (text = text.replace(pbbRegExp, function (matchStr, tagName, tagParams, tagContents) {
            matchStr = matchStr.replace(/\[/g, "<");
            matchStr = matchStr.replace(/\]/g, ">");
            return updateTagDepths(matchStr);
        })))
            ;
        return text;
    }
    function getTags() {
        return tags;
    }
    XBBCODE.getTags = getTags;
    ;
    function addTags(newtags) {
        for (var tag in newtags) {
            tags[tag] = newtags[tag];
        }
        initTags();
    }
    XBBCODE.addTags = addTags;
    ;
    function process(config) {
        var ret = { html: "", error: false, errorQueue: [] };
        config.text = config.text.replace(/</g, "&lt;");
        config.text = config.text.replace(/>/g, "&gt;");
        config.text = config.text.replace(openTags, function (matchStr, openB, contents, closeB) {
            return "<" + contents + ">";
        });
        config.text = config.text.replace(closeTags, function (matchStr, openB, contents, closeB) {
            return "<" + contents + ">";
        });
        config.text = config.text.replace(/\[/g, "&#91;");
        config.text = config.text.replace(/\]/g, "&#93;");
        config.text = config.text.replace(/</g, "[");
        config.text = config.text.replace(/>/g, "]");
        while (config.text !== (config.text = config.text.replace(pbbRegExp2, function (matchStr, tagName, tagParams, tagContents) {
            tagContents = tagContents.replace(/\[/g, "&#91;");
            tagContents = tagContents.replace(/\]/g, "&#93;");
            tagParams = tagParams || "";
            tagContents = tagContents || "";
            return "[" + tagName + tagParams + "]" + tagContents + "[/" + tagName + "]";
        })))
            ;
        config.text = fixStarTag(config.text);
        config.text = addBbcodeLevels(config.text);
        ret.errorQueue = checkParentChildRestrictions("bbcode", config.text, -1, "", "", config.text);
        ret.html = parse(config);
        if (ret.html.indexOf("[") !== -1 || ret.html.indexOf("]") !== -1) {
            ret.errorQueue.push("Some tags appear to be misaligned.");
        }
        if (config.removeMisalignedTags) {
            ret.html = ret.html.replace(/\[.*?\]/g, "");
        }
        if (config.addInLineBreaks) {
            ret.html = "<div style=\"white-space:pre-wrap;\">" + ret.html + "</div>";
        }
        if (!config.escapeHtml) {
            ret.html = ret.html.replace("&#91;", "[");
            ret.html = ret.html.replace("&#93;", "]");
        }
        ret.error = ret.errorQueue.length !== 0;
        return ret;
    }
    XBBCODE.process = process;
    ;
})(XBBCODE || (XBBCODE = {}));

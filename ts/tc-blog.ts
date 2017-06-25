/*!
 * TC Blog v1.0.0 (http://startbootstrap.com)
 * Copyright 2017 TautCony
 * Licensed under Apache 2.0 (https://github.com/IronSummitMedia/startbootstrap/blob/gh-pages/LICENSE)
 */

$(document).ready(() => {

const STYLE_TITLE     = "background:#03a9f4;color:#fff;padding:2px 6px;line-height:32px;border-radius:4px;";
const STYLE_B_WARNING = "background:#ffb300;color:#fff;padding:2px    ;border-radius:4px;line-height:32px;";
const STYLE_B_SUCCESS = "background:#4caf50;color:#fff;padding:2px    ;border-radius:4px;line-height:32px;";
const STYLE_B_ERROR   = "background:#ff3333;color:#fff;padding:2px    ;border-radius:4px;line-height:32px;";

function async(url, func) {
    const script = document.createElement("script");
    const orgins = document.getElementsByTagName("script")[0];
    script.src = url;
    if (func) { script.addEventListener("load", (e) => { func(null, e); }, false); }
    orgins.parentNode.insertBefore(script, orgins);
}

// responsive tables
$(document).ready(() => {
    $("table").wrap("<div class='table-responsive'></div>");
    $("table").addClass("table");
});

// responsive embed videos
$(document).ready(() => {
    $('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
    $('iframe[src*="youtube.com"]').addClass("embed-responsive-item");
    $('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
    $('iframe[src*="vimeo.com"]').addClass("embed-responsive-item");
});

// Navigation Scripts to Show Header on Scroll-Up
(() => {
    const MQL = 1170;

    //primary navigation slide-in effect
    if ($(window).width() > MQL) {
        const headerHeight = $(".navbar-custom").height();
        const bannerHeight = $(".intro-header .container").height();
        $(window).scroll({ previousTop: 0 }, (event) => {
            const currentTop = $(window).scrollTop();
            const $catalog = $(".side-catalog");

            //check if user is scrolling up by mouse or keyborad
            if (currentTop < event.data.previousTop) {
                //if scrolling up...
                if (currentTop > 0 && $(".navbar-custom").hasClass("is-fixed")) {
                    $(".navbar-custom").addClass("is-visible");
                } else {
                    $(".navbar-custom").removeClass("is-visible is-fixed");
                }
            } else {
                //if scrolling down...
                $(".navbar-custom").removeClass("is-visible");
                if (currentTop > headerHeight && !$(".navbar-custom").hasClass("is-fixed")) {
                    $(".navbar-custom").addClass("is-fixed");
                }
            }
            event.data.previousTop = currentTop;

            //adjust the appearance of side-catalog
            $catalog.show();
            if (currentTop > bannerHeight) {
                $catalog.addClass("fixed");
            } else {
                $catalog.removeClass("fixed");
            }
        });
    }
})();

(() => {
    // only load tagcloud.js in tag.html
    if ($("#tag_cloud").length === 0) {
        return;
    }

    //Sort The Tag in dictionary order
    function RemoveItemsByClassName(className) {
        const used = document.getElementsByClassName(className);
        for (let i = 0; i < used.length; ++i) {
            used[i].parentNode.removeChild(used[i]);
        }
    }

    const unsorted = document.getElementsByClassName("tag");
    const tags = [];
    for (let i = 0; i < unsorted.length; i++) {
        tags.push(unsorted[i]);
    }
    tags.sort();

    RemoveItemsByClassName("tag");
    const tagCloud = document.getElementById("tag_cloud");
    for (const tag of tags) {
        tagCloud.appendChild(tag);
    }
    const config = {
        color: { start: "#bbbbee", end: "#0085a1" },
        size: { start: 1, end: 1.1, unit: "em" },
    };
    TagCloud.tagcloud($("#tag_cloud a"), config);
})();

(() => {
    $("#gotop").click(() => {
        $("html, body").animate({ scrollTop: 0 }, 1000);
    });
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            $("#gotop").stop().fadeIn("fast");
        } else {
            $("#gotop").stop().fadeOut("fast");
        }
    });
})();

(() => {
    const initalTitle = document.title;
    const gogatsubyou = ["_(:3 」∠)_", "_(・ω・｣∠)_", "_(:з)∠)_"   , "_(┐「ε:)_" , "_(:3」∠❀",
                       "_(:зゝ∠)_" , "_(:3」[＿]" , "ヾ(:3ﾉｼヾ)ﾉｼ", "(¦3ꇤ[▓▓]", "_( -ω-` )⌒)_"];
    document.addEventListener("visibilitychange", (event) => {
        if (!document.hidden) {
            document.title = initalTitle;
        } else {
            document.title = `${gogatsubyou[Math.floor(Math.random() * gogatsubyou.length)]} ${initalTitle}`;
        }
    });
})();

function startsWith(text: string, searchString: string, position?: number) {
    return text.substr(position || 0, searchString.length) === searchString;
}

(() => {
    const post = $(".post-container");
    if (post.length !== 0) {
            post.children("p").each((index, value) => {
            const p = $(value);
            if (startsWith(p.text(), "//")) {
                p.css({color: "#339966"});
            }
        });
    }
})();

});

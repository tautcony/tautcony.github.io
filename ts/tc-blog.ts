/*!
 * TC Blog v1.0.0 (http://startbootstrap.com)
 * Copyright 2017 TautCony
 * Licensed under Apache 2.0 (https://github.com/tautcony/tautcony.github.io/blob/master/LICENSE)
 */

$(document).ready(() => {
const banner = $("header.intro-header");
if (banner.css("background-image") === "none") {
    banner.geopattern(document.location.href);
}

// responsive tables
$("table").wrap("<div class='table-responsive'></div>");
$("table").addClass("table");

// responsive embed videos
$('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>').addClass("embed-responsive-item");
$('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>').addClass("embed-responsive-item");

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

(() => {
    const initalTitle = document.title;
    const gogatsubyou = ["_(:3 」∠)_", "_(・ω・｣∠)_", "_(:з)∠)_"   , "_(┐「ε:)_" , "_(:3」∠❀",
                         "_(:зゝ∠)_" , "_(:3」[＿]" , "ヾ(:3ﾉｼヾ)ﾉｼ", "(¦3ꇤ[▓▓]", "_( -ω-` )⌒)_"];
    document.addEventListener("visibilitychange", event => {
        if (!document.hidden) {
            document.title = "．．．．．．";
            setTimeout(() => document.title = initalTitle, 500);
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

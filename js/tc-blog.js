/*!
 * Clean Blog v1.0.0 (http://startbootstrap.com)
 * Copyright 2015 Start Bootstrap
 * Licensed under Apache 2.0 (https://github.com/IronSummitMedia/startbootstrap/blob/gh-pages/LICENSE)
 */

 /*!
 * Hux Blog v1.6.0 (http://startbootstrap.com)
 * Copyright 2016 @huxpro
 * Licensed under Apache 2.0
 */

// Tooltip Init
// Unuse by Hux since V1.6: Titles now display by default so there is no need for tooltip
// $(function() {
//     $("[data-toggle='tooltip']").tooltip();
// });


// make all images responsive
/*
 * Unuse by Hux
 * actually only Portfolio-Pages can't use it and only post-img need it.
 * so I modify the _layout/post and CSS to make post-img responsive!
 */
// $(function() {
//    $("img").addClass("img-responsive");
// });

// responsive tables
$(document).ready(function() {
    $("table").wrap("<div class='table-responsive'></div>");
    $("table").addClass("table");
});

// responsive embed videos
$(document).ready(function() {
    $('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
    $('iframe[src*="youtube.com"]').addClass("embed-responsive-item");
    $('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
    $('iframe[src*="vimeo.com"]').addClass("embed-responsive-item");
});

// Navigation Scripts to Show Header on Scroll-Up
jQuery(document).ready(function ($) {
    var MQL = 1170;

    //primary navigation slide-in effect
    if ($(window).width() > MQL) {
        var headerHeight = $(".navbar-custom").height(),
            bannerHeight = $(".intro-header .container").height();
        $(window).scroll({ previousTop: 0 }, function (event) {
            var currentTop = $(window).scrollTop();
            var $catalog = $(".side-catalog");

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
                if (currentTop > headerHeight && !$(".navbar-custom").hasClass("is-fixed")) $(".navbar-custom").addClass("is-fixed");
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
});

function async(url, func) {
    var script = document.createElement("script");
    var orgins = document.getElementsByTagName("script")[0];
    script.src = url;
    if (func) { script.addEventListener("load", function (e) { func(null, e); }, false); }
    orgins.parentNode.insertBefore(script, orgins);
}

async("//cdn.bootcss.com/fastclick/1.0.6/fastclick.min.js", function() {
    var $nav = document.querySelector("nav");
    if($nav) FastClick.attach($nav);
});

jQuery(document).ready(function ($) {
    // only load tagcloud.js in tag.html
    if ($("#tag_cloud").length === 0) {
        return;
    }
    async("/js/tagcloud.js",
        function() {
            var config = {
                color: { start: "#bbbbee", end: "#0085a1" },
                size: { start: 1, end: 1, unit: "em" }
            };
            TagCloud.tagcloud($("#tag_cloud a"), config);
        });
});

jQuery(document).ready(function ($) {
    $("#gotop").click(function () {
        $("html, body").animate({ scrollTop: 0 }, 1000);
    });
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $("#gotop").fadeIn("fast");
        } else {
            $("#gotop").stop().fadeOut("fast");
        }
    });
});

jQuery(document).ready(() => {
    var initalTitle = document.title;
    var gogatsubyou = ["_(:3 」∠)_", "_(・ω・｣∠)_", "_(:з)∠)_"   , "_(┐「ε:)_" , "_(:3」∠❀",
                       "_(:зゝ∠)_" , "_(:3」[＿]" , "ヾ(:3ﾉｼヾ)ﾉｼ", "(¦3ꇤ[▓▓]", "_( -ω-` )⌒)_"];
    document.addEventListener("visibilitychange", function(event) {
        if (!document.hidden) {
            document.title = initalTitle;
        } else {
            document.title = gogatsubyou[Math.floor(Math.random() * gogatsubyou.length)] + " " + initalTitle;
        }
    });
});

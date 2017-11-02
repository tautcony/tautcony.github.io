$(() => {

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
        $(window).scroll({ previousTop: 0, passive: true }, (event) => {
            const currentTop = $(window).scrollTop();
            const $catalog = $(".side-catalog");

            /* tslint:disable: no-unsafe-any*/
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
            /* tslint:enable: no-unsafe-any*/

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

$("#gotop").click(() => $("html, body").animate({ scrollTop: 0 }, 1000));
$(window).scroll({ passive: true }, () => $("#gotop").toggleClass("active", $(window).scrollTop() > 300));

new Lib.Title(["_(:3 」∠)_", "_(・ω・｣∠)_", "_(:з)∠)_", "_(┐「ε:)_", "_(:3」∠❀",
               "_(:зゝ∠)_", "_(:3」[＿]", "ヾ(:3ﾉｼヾ)ﾉｼ", "(¦3ꇤ[▓▓]", "_( -ω-` )⌒)_"]).Init();

new Lib.Quote(".copyright", "quote").Interval(10 ** 4);

});

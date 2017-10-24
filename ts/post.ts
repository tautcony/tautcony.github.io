$(document).ready(() => {
    const banner = $("header.intro-header");
    if (banner.css("background-image") === "none") {
        banner.geopattern(document.location.href);
    }

    new Lib.Nav().Init();

    const post = $(".post-content");
    if (post.length !== 0) {
        post.children("p").each((index, value) => {
            const p = $(value);
            if (Lib.startsWith(p.text(), "//")) {
                p.css({color: "#339966"});
            }
        });
        post.find("a").each((index, value) => {
            if (Lib.isExternal((value as HTMLAnchorElement).href)) {
                $(value).addClass("external");
            }
        });
    }

});

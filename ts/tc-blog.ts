/* eslint-disable dot-notation */
import "core-js/es";
import "regenerator-runtime/runtime";
import "whatwg-fetch";
import * as Sentry from "@sentry/browser";
import Heti from "heti/js/heti-addon";

import Nav from "./Lib/navbar";
import Quote from "./Lib/quote";
import Title from "./Lib/title";
import tagcloud from "./Lib/tagcloud";
import Archive from "./archive";
import * as page from "./page";
import * as post from "./post";
import * as about from "./about";
// import * as arknights from "./arknights";

require("../less/tc-blog.less");
require("heti/lib/heti.scss");

Sentry.init({
    dsn: "https://24f09a831bb64823a88e88b918b2bb4f@o955448.ingest.sentry.io/6683081",
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1,
});

window["generateCatalog"] = page.generateCatalog;
document.addEventListener("DOMContentLoaded", () => {
    const nav = new Nav();
    const title = new Title(["_(:3 」∠)_", "_(・ω・｣∠)_", "_(:з)∠)_", "_(┐「ε:)_", "_(:3」∠❀", "_(:зゝ∠)_", "_(:3」[＿]", "ヾ(:3ﾉｼヾ)ﾉｼ", "(¦3ꇤ[▓▓]", "_( -ω-` )⌒)_"]);
    const quote = new Quote(".copyright", "quote");

    nav.init();
    const archive = new Archive();
    archive.init();
    page.init();
    post.init();

    title.init();
    quote.init(10 ** 4);
    about.init();

    const config = {
        color: { start: "#bbbbee", end: "#0085a1" },
        size: { start: 1, end: 1.1, unit: "em" },
    };
    tagcloud(document.querySelectorAll("#tag_cloud a"), config);
    if (window["$crisp"] !== undefined) {
        window["$crisp"].push(["safe", true]);
    }
    if (typeof XPathResult !== "undefined") {
        const heti = new Heti(".heti");
        heti.autoSpacing();
    }
    /*
    if (document.querySelector("#webgl") !== null) {
        arknights.init();
        arknights.background();
    }
    */
});

if (navigator.serviceWorker) {
    // disbale previous service worker for some bugs
    navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
            registration.unregister();
        }
    });
}

import "core-js/es";
import "regenerator-runtime/runtime";
import "whatwg-fetch";

import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";

import Nav from "./Lib/navbar";
import Quote from "./Lib/quote";
import Title from "./Lib/title";
import tagcloud from "./Lib/tagcloud";
import Archive from "./archive";
import { generateCatalog, pageInit } from "./page";
import postInit from "./post";
import * as aboutInit from "./about";

require("../less/tc-blog.less");
require("heti/lib/heti.scss");
import Heti from "heti/js/heti-addon.js";

Sentry.init({
    dsn: "https://24f09a831bb64823a88e88b918b2bb4f@o955448.ingest.sentry.io/6683081",
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.25,
});

window["generateCatalog"] = generateCatalog;
document.addEventListener("DOMContentLoaded", () => {
    const nav = new Nav();
    const title = new Title(["_(:3 」∠)_", "_(・ω・｣∠)_", "_(:з)∠)_", "_(┐「ε:)_", "_(:3」∠❀", "_(:зゝ∠)_", "_(:3」[＿]", "ヾ(:3ﾉｼヾ)ﾉｼ", "(¦3ꇤ[▓▓]", "_( -ω-` )⌒)_"]);
    const quote = new Quote(".copyright", "quote");

    nav.Init();
    new Archive();
    pageInit();
    postInit();

    title.Init();
    quote.Init(10 ** 4);
    aboutInit.konInit();

    const config = {
        color: { start: "#bbbbee", end: "#0085a1" },
        size: { start: 1, end: 1.1, unit: "em" },
    };
    tagcloud(document.querySelectorAll("#tag_cloud a"), config);
    if (window["$crisp"] !== undefined) {
        window["$crisp"].push(["safe", true]);
    }
});
if (typeof XPathResult !== "undefined") {
    const heti = new Heti(".heti");
    heti.autoSpacing();
}

if(navigator.serviceWorker) {
    // disbale previous service worker for some bugs
    navigator.serviceWorker.getRegistrations().then((registrations) => {
        for(const registration of registrations) {
            registration.unregister();
        }
    });
}

import "@babel/polyfill";

import Nav from "./Lib/navbar";
import Quote from "./Lib/quote";
import Title from "./Lib/title";
// import CoreValue from "./Lib/corevalue";
import tagcloud from "./Lib/tagcloud";
import bubbleBg from "./Lib/bubbleBg";
import Archive from "./archive";
import { generateCatalog, pageInit } from "./page";
import postInit from "./post";
import * as aboutInit from "./about";
require("../less/tc-blog.less");

import * as pangu from "../js/pangu.js/browser/pangu";

window["generateCatalog"] = generateCatalog;
document.addEventListener("DOMContentLoaded", () => {
    const nav = new Nav();
    const title = new Title(["_(:3 」∠)_", "_(・ω・｣∠)_", "_(:з)∠)_", "_(┐「ε:)_", "_(:3」∠❀", "_(:зゝ∠)_", "_(:3」[＿]", "ヾ(:3ﾉｼヾ)ﾉｼ", "(¦3ꇤ[▓▓]", "_( -ω-` )⌒)_"]);
    const quote = new Quote(".copyright", "quote");
    // new CoreValue().Init();
    const bubble = new bubbleBg("#bubble_bg");

    nav.Init();
    new Archive();
    pageInit();
    postInit();

    title.Init();
    quote.Init(10 ** 4);
    aboutInit.qrInit();
    aboutInit.konInit();

    const config = {
        color: { start: "#bbbbee", end: "#0085a1" },
        size: { start: 1, end: 1.1, unit: "em" },
    };
    tagcloud(document.querySelectorAll("#tag_cloud a"), config);

    pangu.autoSpacingPage();
    bubble.init();
});

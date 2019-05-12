import "@babel/polyfill";

import Nav from "./Lib/navbar";
import Quote from "./Lib/quote";
import Title from "./Lib/title";
import CoreValue from "./Lib/corevalue";
import tagcloud from "./Lib/tagcloud";
import brightnessInit from "./Lib/brightness";
import Archive from "./archive";
import pageInit from "./page";
import postInit from "./post";
import * as aboutInit from "./about";
require("../less/tc-blog.less");

document.addEventListener("DOMContentLoaded", () => {
    new Nav().Init();
    new Title(["_(:3 」∠)_", "_(・ω・｣∠)_", "_(:з)∠)_", "_(┐「ε:)_", "_(:3」∠❀", "_(:зゝ∠)_", "_(:3」[＿]", "ヾ(:3ﾉｼヾ)ﾉｼ", "(¦3ꇤ[▓▓]", "_( -ω-` )⌒)_"]).Init();
    new Quote(".copyright", "quote").Init(10 ** 4);
    new CoreValue().Init();
    brightnessInit();
    // tslint:disable-next-line: no-unused-expression
    new Archive();
    pageInit();
    postInit();
    aboutInit.qrInit();
    aboutInit.konInit();

    const config = {
        color: { start: "#bbbbee", end: "#0085a1" },
        size: { start: 1, end: 1.1, unit: "em" }
    };
    tagcloud(document.querySelectorAll("#tag_cloud a"), config);
});

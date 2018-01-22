import Nav from "./Lib/navbar";
import Quote from "./Lib/quote";
import Title from "./Lib/title";
import pageInit from "./page";
import tagInit from "./tag";
import postInit from "./post";
import * as aboutInit from "./about";
//require("../less/tc-blog.less");

document.addEventListener("DOMContentLoaded", () => {
    new Nav().Init();
    new Title(["_(:3 」∠)_", "_(・ω・｣∠)_", "_(:з)∠)_", "_(┐「ε:)_", "_(:3」∠❀", "_(:зゝ∠)_", "_(:3」[＿]", "ヾ(:3ﾉｼヾ)ﾉｼ", "(¦3ꇤ[▓▓]", "_( -ω-` )⌒)_"]).Init();
    new Quote(".copyright", "quote").Init(10 ** 4);
    pageInit();
    tagInit();
    postInit();
    aboutInit.qrInit();
    aboutInit.konInit();
});

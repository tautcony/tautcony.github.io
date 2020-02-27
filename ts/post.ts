import * as Lib from "./Lib/utils";
import * as GeoPattern from "geopattern";

export default function init() {
    const banner = document.querySelector("header.intro-header") as HTMLDivElement;
    const style = window.getComputedStyle(banner);
    if (style.backgroundImage === "none") {
        const pattern = GeoPattern.generate(document.location.href);
        banner.style.backgroundImage = pattern.toDataUrl();
    }

    /* eslint-disable @typescript-eslint/prefer-for-of */
    const pList = document.querySelectorAll(".post-content p");
    for (let i = 0; i < pList.length; ++i) {
        const p = pList[i] as HTMLParagraphElement;
        if (Lib.startsWith(p.innerText, "//")) {
            p.style.color = "#339966";
        }
    }
    const aList = document.querySelectorAll(".post-content a");
    for (let i = 0; i < aList.length; ++i) {
        const a = aList[i] as HTMLAnchorElement;
        if (Lib.isExternal(a.href)) {
            a.classList.add("external");
        }
    }
    /* eslint-enable @typescript-eslint/prefer-for-of */
}

window.addEventListener("load", () => {
    const banner = document.querySelector("header.intro-header") as HTMLDivElement;
    if (banner.style.backgroundImage === "") {
        const pattern = GeoPattern.generate(document.location.href);
        banner.style.backgroundImage = pattern.toDataUrl();
    }

    /*tslint:disable: prefer-for-of*/
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
    /*tslint:enable: prefer-for-of*/
});

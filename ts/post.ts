import * as Lib from "./Lib/utils";
import * as GeoPattern from "./Lib/geopattern";
const packageInfo = require("../repo.json");

function queryParams(params: { [key: string]: string | number | boolean }) {
    return Object.keys(params)
        .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
        .join("&");
}

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
    if (!packageInfo.repository) {
        return;
    }
    /* eslint-enable @typescript-eslint/prefer-for-of */
    const apiurl = `https://api.github.com/repos/${packageInfo.repository.owner}/${packageInfo.repository.name}/commits`;
    const filename = "_posts/" + location.pathname.split("/").filter(_=>_).join("-")+".markdown";
    const url = apiurl + "?" + queryParams({
        path: filename,
    });
    const updateContainer = document.querySelector("#update-date");
    if (updateContainer === null) {
        return;
    }
    fetch(url, {
        method: "GET",
        credentials: "omit",
    }).then(response => response.json()
    ).then(data => {
        if (data.length <= 1) {
            return;
        }
        const dateString = data[0].commit?.author?.date;
        if (dateString === undefined) {
            return;
        }
        const formatedDate = new Date(dateString).toLocaleString("en", { month: "long", day: "numeric", year: "numeric" });
        const fullSha = data[0]?.sha;
        let updateInfo = formatedDate;
        if (fullSha !== undefined) {
            updateInfo += ` with commit ${fullSha.substring(0, 7)}`;
        }
        updateContainer.innerHTML = updateInfo;
    }).catch(reason => {
        console.warn("Failed to fetch commit info", reason);
    });
}

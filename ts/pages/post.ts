import * as GeoPattern from "../Lib/geopattern";
import * as Lib from "../Lib/utils";
import packageInfo from "../../repo.json";

function queryParams(params: Record<string, string | number | boolean>) {
    return Object.keys(params)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(String(params[k]))}`)
        .join("&");
}

interface JekyllPageMeta {
    path?: string;
}

declare global {
    interface Window {
        jekyll?: {
            page?: JekyllPageMeta;
        };
    }
}

export function init() {
    const banner = document.querySelector("header.intro-header") as HTMLDivElement | null;
    if (!banner) {
        return;
    }
    const style = window.getComputedStyle(banner);
    if (style.backgroundImage === "none") {
        const pattern = GeoPattern.generate(document.location.href);
        banner.style.backgroundImage = pattern.toDataUrl();
    }

    const pList = document.querySelectorAll(".post-content p");
    for (const node of Array.from(pList)) {
        const p = node as HTMLParagraphElement;
        if (Lib.startsWith(p.innerText, "//")) {
            p.style.color = "#339966";
        }
    }
    const aList = document.querySelectorAll(".post-content a");
    for (const node of Array.from(aList)) {
        const a = node as HTMLAnchorElement;
        if (Lib.isExternal(a.href)) {
            a.classList.add("external");
        }
    }
    if (!packageInfo.repository) {
        return;
    }

    const apiurl = `https://api.github.com/repos/${packageInfo.repository.owner}/${packageInfo.repository.name}/commits`;
    const pathFromJekyll = window.jekyll?.page?.path;
    const filename = `_posts/${window.location.pathname.split("/").filter(Boolean).join("-")}.markdown`;
    const path = pathFromJekyll || filename;
    const url = `${apiurl}?${queryParams({ path })}`;
    const updateContainer = document.querySelector("#update-date");
    if (updateContainer === null) {
        return;
    }
    fetch(url, {
        method: "GET",
        credentials: "omit",
    })
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data) || data.length <= 1) {
                return;
            }
            const dateString = data[0]?.commit?.author?.date;
            if (dateString === undefined) {
                return;
            }
            const formatedDate = new Date(dateString).toLocaleString("en", {
                month: "long",
                day: "numeric",
                year: "numeric",
            });
            const fullSha = data[0]?.sha as string | undefined;
            let updateInfo = formatedDate;
            if (fullSha !== undefined) {
                updateInfo += ` with commit ${fullSha.substring(0, 7)}`;
            }
            updateContainer.textContent = updateInfo;
        })
        .catch(reason => {
            console.warn("Failed to fetch commit info", reason);
        });
}

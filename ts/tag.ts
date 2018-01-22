import tagcloud from "./Lib/tagcloud";

export default function init() {
    // only load tags.ts in tag.html
    if (document.querySelector("#tag_cloud") === null) {
        return;
    }

    //Sort The Tag in dictionary order
    function RemoveItemsByClassName(className: string) {
        const used = document.getElementsByClassName(className);
        for (let i = 0; i < used.length; ++i) {//tslint:disable-line
            used[i].parentNode.removeChild(used[i]);
        }
    }

    const unsorted = document.getElementsByClassName("tag");
    const tags = [];
    for (let i = 0; i < unsorted.length; i++) {//tslint:disable-line
        tags.push(unsorted[i]);
    }
    tags.sort((lhs: HTMLAnchorElement, rhs: HTMLAnchorElement) => {
        if (lhs.title === rhs.title) {
            return 0;
        }
        if (lhs.title < rhs.title) {
            return -1;
        }
        return 1;
    });

    RemoveItemsByClassName("tag");
    const tagCloud = document.getElementById("tag_cloud");
    for (const tag of tags) {
        tagCloud.appendChild(tag);
    }
    const config = {
        color: { start: "#bbbbee", end: "#0085a1" },
        size: { start: 1, end: 1.1, unit: "em" }
    };
    tagcloud(document.querySelectorAll("#tag_cloud a"), config);
}

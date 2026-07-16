import { el } from "../lib/dom";

interface KonBlock {
    title: string;
    lang: string;
    blockquote: string;
    content: string[];
}

const KON_BLOCKS: readonly KonBlock[] = [
    {
        title: "中文",
        lang: "zh",
        blockquote: "夜空彼方与飞机尾云",
        content: ["唯「以后我们也能一直组乐队就好了」", "律「是啊」", "紬「嗯」", "梓「是啊」", "澪「嗯。就这样，直到永远吧」"],
    },
    {
        title: "日本語",
        lang: "jp",
        blockquote: "夜空ノムコウとひこうき雲",
        content: ["唯「これからもずっと、みんなでバンドできたらいいね」", "律「そうだな」", "紬「うん」", "梓「そうですね」", "澪「ああ。ずっと、ずっとな」"],
    },
    {
        title: "English",
        lang: "en",
        blockquote: "Translation Server Error :)",
        content: [
            "Yui「I hope I can playing in a band with you guys forever」",
            "Ritsu「I konw what you mean」",
            "Mugi「Hum」",
            "Azusa「Me, too」",
            "Mio「Yeah! Forever. And ever」",
        ],
    },
];

const KON_META = {
    className: "lang",
    title: "K-ON!! EP12",
    url: "https://www.tbs.co.jp/anime/k-on/k-on_tv/story/story212.html",
} as const;

function createBlock(block: KonBlock): HTMLDivElement {
    return el(
        "div",
        {
            class: `${KON_META.className} none`,
            title: block.title,
            lang: block.lang,
        },
        el("blockquote", block.blockquote),
        block.content.map(line => el("p", line)),
        el(
            "p",
            { style: { textAlign: "right" }, title: KON_META.title },
            "—— ",
            el("a", { href: KON_META.url }, KON_META.title)
        )
    );
}

export function init(): void {
    const container = document.getElementById("kon-container");
    const languageSelect = document.getElementById("langSelect");
    if (container === null || !(languageSelect instanceof HTMLSelectElement)) {
        return;
    }

    const blocks = KON_BLOCKS.map(block => {
        const element = createBlock(block);
        container.append(element);
        return element;
    });

    const browserLanguage = window.navigator.language;
    let preferredIndex = 0;
    for (const [index, block] of blocks.entries()) {
        languageSelect.append(el("option", {
            value: String(index),
            textContent: block.title,
        }));
        if (browserLanguage.includes(block.lang)) {
            preferredIndex = index;
        }
    }

    let lastSelectedIndex = -1;
    languageSelect.addEventListener("change", () => {
        const selectedIndex = Number.parseInt(languageSelect.value, 10);
        if (!Number.isFinite(selectedIndex) || !blocks[selectedIndex]) {
            return;
        }
        if (lastSelectedIndex !== -1) {
            blocks[lastSelectedIndex].classList.add("none");
        }
        lastSelectedIndex = selectedIndex;
        blocks[selectedIndex].classList.remove("none");
    });

    languageSelect.selectedIndex = preferredIndex;
    languageSelect.dispatchEvent(new Event("change", { bubbles: true }));
}

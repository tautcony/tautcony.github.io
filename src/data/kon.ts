/**
 * About-page K-ON multi-language quote blocks (SSG content).
 * Client only handles preferred-language pick + select switching.
 */

export interface KonBlock {
    title: string;
    lang: string;
    blockquote: string;
    content: string[];
}

export const KON_BLOCKS: readonly KonBlock[] = [
    {
        title: "中文",
        lang: "zh",
        blockquote: "夜空彼方与飞机尾云",
        content: [
            "唯「以后我们也能一直组乐队就好了」",
            "律「是啊」",
            "紬「嗯」",
            "梓「是啊」",
            "澪「嗯。就这样，直到永远吧」",
        ],
    },
    {
        title: "日本語",
        lang: "jp",
        blockquote: "夜空ノムコウとひこうき雲",
        content: [
            "唯「これからもずっと、みんなでバンドできたらいいね」",
            "律「そうだな」",
            "紬「うん」",
            "梓「そうですね」",
            "澪「ああ。ずっと、ずっとな」",
        ],
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

export const KON_META = {
    className: "lang",
    title: "K-ON!! EP12",
    url: "https://www.tbs.co.jp/anime/k-on/k-on_tv/story/story212.html",
} as const;

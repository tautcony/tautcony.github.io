interface String {
    format(...args: Array<number | string | object>): string;
}
String.prototype.format = function(...args: Array<number | string | object>) {
    const str = this as string;
    return str.replace(/\{(\d+)\}/g, (m: string, i: number) => args[i].toString());
};

$(() => {
    const cd64 = "|$$$}rstuvwxyz{$$$$$$$>?@ABCDEFGHIJKLMNOPQRSTUVW$$$$$$XYZ[\\]^_`abcdefghijklmnopq";
    function decode_block(str: string, offset: number) {
        const input = [0, 0, 0];
        for (let i = offset; i < offset + 4; ++i) {
            const c = str.charCodeAt(i);
            const v = (c >= 43 && c <= 122) ? cd64[c - 43] === "$" ? 0 : cd64.charCodeAt(c - 43) - 61 : 0;
            input[i - offset] = v - 1;
        }
        return String.fromCharCode(
            (((input[0] << 2) & 0xFF) | (input[1] >> 4)),
            (((input[1] << 4) & 0xFF) | (input[2] >> 2)),
            (((input[2] << 6) & 0xC0) | (input[3] >> 0))
        ).replace(/\uffff+$/g, "");
    }

    function decode(str: string) {
        let ret = "";
        for (let i = 0; i < str.length; i += 4) {
            ret += decode_block(str, i);
        }
        return ret;
    }

    const qrContainer = document.getElementById("qr-container");
    if (qrContainer === null) {
        return;
    }

    const donate = document.createElement("p");
    donate.id = "donate";
    donate.textContent = "啊哈，不考虑资助一下贫苦的山区儿童么（雾";
    const empty = "/img/empty.png";
    const qrcode = document.createElement("img");
    qrcode.id = "qrcode";
    qrcode.src = empty;
    const qrUrl = "L2ltZy9xcmNvZGVfezB9LnBuZw==";
    donate.addEventListener("mouseover", () => setTimeout(() => qrcode.src = decode(qrUrl).format(Math.floor(Math.random() * 2)), 201));
    donate.addEventListener("mouseout",  () => setTimeout(() => qrcode.src = empty, 201));
    qrContainer.appendChild(donate);
    qrContainer.appendChild(qrcode);
});

interface IKON {
    title: string;
    lang: string;
    blockquote: string;
    content: string[];
}

const kon = {
    data: [
       {
        title: "中文",
        lang: "zh",
        blockquote: "夜空彼方与飞机尾云",
        content: ["唯「以后我们也能一直组乐队就好了」", "律「是啊」", "紬「嗯」", "梓「是啊」", "澪「嗯。就这样，直到永远吧」"]
    }, {
        title: "日本語",
        lang: "jp",
        blockquote: "夜空ノムコウとひこうき雲",
        content: ["唯「これからもずっと、みんなでバンドできたらいいね」", "律「そうだな」", "紬「うん」", "梓「そうですね」", "澪「ああ。ずっと、ずっとな」"]
    }, {
        title: "English",
        lang: "en",
        blockquote: "Translation Server Error :)",
        content: ["Yui「I hope I can playing in a band with you guys forever」", "Ritsu「I konw what you mean」", "Mugi「Hum」", "Azusa「Me, too」", "Mio「Yeah! Forever. And ever」"]
    }
    ] as IKON[],
    className: "lang",
    title: "K-ON!! EP12",
    url: "http://www.tbs.co.jp/anime/k-on/k-on_tv/story/story212.html"
};

$(() => {
    const konContainer = document.getElementById("kon-container");
    if (konContainer === null) {
        return;
    }

    function getElement(value: IKON): HTMLDivElement {
        const div = document.createElement("div");
        div.className = kon.className;
        div.title = value.title;
        div.lang = value.lang;
        div.style.display = "none";
        const blockquote = document.createElement("blockquote");
        blockquote.textContent = value.blockquote;
        div.appendChild(blockquote);
        value.content.forEach(element => {
            const p = document.createElement("p");
            p.textContent = element;
            div.appendChild(p);
        });
        const source = document.createElement("p");
        source.style.textAlign = "right";
        source.title = kon.title;
        const link = document.createElement("a");
        link.href = kon.url;
        link.text = kon.title;
        source.appendChild(document.createTextNode("—— "));
        source.appendChild(link);
        div.appendChild(source);
        return div;
    }

    const lang: HTMLDivElement[] = [];
    const selector = document.getElementById("langSelect") as HTMLSelectElement;
    kon.data.forEach((value) => {
        const div = getElement(value);
        lang.push(div);
        konContainer.appendChild(div);
    });

    let currentLanguageIndex = 0;
    const currentLanguage = window.navigator.language;
    lang.forEach((value, index) => {
        const opt = document.createElement("option");
        opt.value = index.toString();
        opt.innerHTML = value.getAttribute("title");
        selector.appendChild(opt);
        if (currentLanguage.indexOf(value.getAttribute("lang")) >= 0) {
            currentLanguageIndex = index;
        }
    });

    let lastSelectedLanguageIndex = -1;
    selector.addEventListener("change", (event: Event) => {
        const selectedIndex = parseInt((event.target as HTMLOptionElement).value, 10);
        if (lastSelectedLanguageIndex !== -1) {
            lang[lastSelectedLanguageIndex].style.display = "none";
        }
        lastSelectedLanguageIndex = selectedIndex;
        $(lang[selectedIndex]).fadeIn(500);
    });

    selector.options.selectedIndex = currentLanguageIndex;
    selector.dispatchEvent(new Event("change"));
});

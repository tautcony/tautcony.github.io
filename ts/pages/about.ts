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
            content: ["唯「以后我们也能一直组乐队就好了」", "律「是啊」", "紬「嗯」", "梓「是啊」", "澪「嗯。就这样，直到永远吧」"],
        }, {
            title: "日本語",
            lang: "jp",
            blockquote: "夜空ノムコウとひこうき雲",
            content: ["唯「これからもずっと、みんなでバンドできたらいいね」", "律「そうだな」", "紬「うん」", "梓「そうですね」", "澪「ああ。ずっと、ずっとな」"],
        }, {
            title: "English",
            lang: "en",
            blockquote: "Translation Server Error :)",
            content: ["Yui「I hope I can playing in a band with you guys forever」", "Ritsu「I konw what you mean」", "Mugi「Hum」", "Azusa「Me, too」", "Mio「Yeah! Forever. And ever」"],
        },
    ] as IKON[],
    className: "lang",
    title: "K-ON!! EP12",
    url: "http://www.tbs.co.jp/anime/k-on/k-on_tv/story/story212.html",
};

function createEvent(type: string) {
    let event: Event;
    if (typeof (Event) === "function") {
        event = new Event(type);
    } else {
        event = document.createEvent("Event");
        event.initEvent(type, true, true);
    }
    return event;
}

export function init() {
    const konContainer = document.getElementById("kon-container");
    if (konContainer === null) {
        return;
    }

    function getElement(value: IKON): HTMLDivElement {
        const div = document.createElement("div");
        div.className = kon.className;
        div.title = value.title;
        div.lang = value.lang;
        div.classList.add("none");
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
    kon.data.forEach(value => {
        const div = getElement(value);
        lang.push(div);
        konContainer.appendChild(div);
    });

    let currentLanguageIndex = 0;
    const currentLanguage = window.navigator.language;
    lang.forEach((value, index) => {
        const opt = document.createElement("option");
        opt.value = index.toString();
        opt.innerHTML = value.getAttribute("title") as string;
        selector.appendChild(opt);
        if (currentLanguage.indexOf(value.getAttribute("lang") as string) >= 0) {
            currentLanguageIndex = index;
        }
    });

    let lastSelectedLanguageIndex = -1;
    selector.addEventListener("change", (event: Event) => {
        const selectedIndex = parseInt((event.target as HTMLOptionElement).value, 10);
        if (lastSelectedLanguageIndex !== -1) {
            lang[lastSelectedLanguageIndex].classList.add("none");
        }
        lastSelectedLanguageIndex = selectedIndex;
        lang[selectedIndex].classList.remove("none"); // todo: fix fadein effect
    });

    selector.options.selectedIndex = currentLanguageIndex;
    selector.dispatchEvent(createEvent("change"));
}

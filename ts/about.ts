export function qrInit() {
    const qrContainer = document.getElementById("qr-container");
    if (qrContainer === null) {
        return;
    }

    const empty = `data:image/svg+xml;base64,${window.btoa("<svg xmlns='http://www.w3.org/2000/svg' width='350' height='350'/>")}`;
    const header = "iVBORw0KGgoAAAANSUhEUgAAAV4AAAFeAQMAAAD35eVZAAAABlBMVEUAAAD///+l2Z/dAAAAAnRSTlP/AOW3MEoAAAI";
    const tail = "AAAABJRU5ErkJggg==";
    const qrcodes = [
        `${header}SSURBVGhD7dVRbuQwCAZg34T734qDrEQNP2BHbbXVkoet9DOTxIEPP4RoZtnP48/6m7iC+I7/B+uKEDMVlbgVFDVzJYhHWFDAdeOkZ12CeIb3Qwe9i72H1yCI38APgj7FQfwmThTaug8r4jdwJqROfrskTj0bPxOP8IoQ/f6TgniCOzANuYYi9gjiCVaMJOeyUbzzC0uxMxviEc5xpI46VpkWfM2Ih/hKSvSu6MECq1DEI6xlJJPo7r6+EI/wqWWp/TpNxHNcak8HupqKZhBPsFfi/Y9/z5VX6ZH4FmgmHmFfuNZboOyRdCeJx9jq0T8noo9W4gm2zgBLIsvTzhC/gT1CFnF889yBeIj9sfezzytyYtYZIx7iyMD5aXnRLYbSZeI5RhoawpswmBoO8Qxr5rxoj4jm6iYeYsuEXjaArmeGeIj3wodyVYLFoNAlfhBPcCcubJiKoSH20RgK8b/jSF9Wo5KXqObEiCc413G7W3YIxOp+7Ec8xHFfhQqVexFl4gn2m31k8bp8KhDPsL/8/aKfaJyceIr7h+XAJTUg7RrxEH89FMM4vIZW4gk+pXuZzLeRaiOe4Hjonj64OwoSv4AlS4etnEXeVJV4hjVG0tzLnsxNNEdWv0jEQ9xjqK7qrAXxOzjzjuNYsUEc8SWeYQh/yUEsz9jES2ghHuEVIeDREDiMxV65JJ7gnwfxHb8SfwCuYqR+v2PyJg${tail}`,
        `${header}bSURBVGhD7dVRjtswDATQucnc/1ZzkAKzH0PKdtGii9AfXYB0Ykvioz5Mx4G/H7/wL3GLxff4f7AAAKAtgGJlRKvXSiweYSaXrA4XLVQu58UzfJoh2kLQqQZbLH4DC3XvT7WQ4sVvYndLErWQ6+I3cHKdsi2gHXgWF88wAADU348Siyf4CvF8b824YvEEKy3BeeC7DKcmx+IRtpOwBVBVIbBL8rEXD3FyojOus5hPVrx4jCOSPN9HffqyeISFNgBTU4Vno5jFI1whgKnDebELFxUXj7CYuZjlEtEpynTxFIsW0JiuWSq6Q4tHWGDxrMWLQn4EnfHiF3Apq0WBlICLp9gWaKFqAIBKWnXKNlw8w4l0RSjNmtO1XTVl8Yf4IGbpFAPXXKC4eIIzrJqTpFNPncYsnmGB/s3eyzO080tZ/DmmRT9sZftiC+DiMfbjjVJMoLIawcUjnK6orXjvkQD0RouHuOfXgL2BaLteN4uHmH3qEO2WV27xCAs8837mb6NsBS6eYXX6Hr2Yx160BS6e4Rx/rBCFk188w74985c7oxTgdHDxh7jmT24BpfqPdPEEn+SlhSoWVVBcPMO56+DB6QTFaySKecks/hjTfraE9bEtIE2xF09x3/hjLbCuoE7LFr+CwQcO9dmj/zQXTzHAYhbodMPJWvTiGbZtHd4tsMVrICweYgAAWDc/lnUSBdZ+i0f4+7H4Hj8SfwHjVqVvacHp/A${tail}`,
    ];
    const donate = document.createElement("p");
    donate.id = "donate";
    donate.textContent = "啊哈，不考虑资助一下贫苦的山区儿童么（雾";
    const qrcode = document.createElement("img");
    qrcode.id = "qrcode";
    qrcode.src = empty;
    donate.addEventListener("mouseover", () => setTimeout(() => qrcode.src = `data:image/png;base64,${qrcodes[Math.floor(Math.random() * qrcodes.length)]}`, 201));
    donate.addEventListener("mouseout",  () => setTimeout(() => qrcode.src = empty, 201));
    qrContainer.appendChild(donate);
    qrContainer.appendChild(qrcode);
}

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

export function konInit() {
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
            lang[lastSelectedLanguageIndex].classList.add("none");
        }
        lastSelectedLanguageIndex = selectedIndex;
        lang[selectedIndex].classList.remove("none"); // todo: fix fadein effect
    });

    selector.options.selectedIndex = currentLanguageIndex;
    selector.dispatchEvent(new Event("change"));
}

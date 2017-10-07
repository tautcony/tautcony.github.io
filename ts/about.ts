$(document).ready(() => {
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
            (((input[2] << 6) & 0xC0) | (input[3] >> 0)),
        );
    }

    function decode(str: string) {
        let ret = "";
        for (let i = 0; i < str.length; i += 4) {
            ret += decode_block(str, i);
        }
        return ret;
    }

    const qrUrl = "L2ltZy9hbGlwYXlfcXIucG5n";
    const qrcode = document.getElementById("qrcode") as HTMLImageElement;
    const donate = document.getElementById("donate") as HTMLParagraphElement;
    if (qrcode === null) {
        return;
    }
    donate.addEventListener("mouseover", () => setTimeout(() => qrcode.src = decode(qrUrl), 201));
    donate.addEventListener("mouseout",  () => setTimeout(() => qrcode.src = ""           , 201));
});

$(document).ready(() => {
    const lang = document.getElementsByClassName("lang") as HTMLCollectionOf<HTMLElement>;
    const selecter = document.getElementById("langSelect") as HTMLSelectElement;
    if (lang.length === 0) {
        return;
    }
    let lastSelectedLanguageIndex = -1;
    $("#langSelect").on("change", (eventObject: Event) => {
        if (lastSelectedLanguageIndex !== -1) {
            $(lang[lastSelectedLanguageIndex]).fadeOut(0);
        }
        lastSelectedLanguageIndex = selecter.options.selectedIndex;
        $(lang[selecter.options.selectedIndex]).fadeIn(500);
    });

    let currentLanguageIndex = 0;
    const currentLanguage = window.navigator.language;
    for (let i = 0; i < lang.length; i++) {
        const opt = document.createElement("option");
        opt.setAttribute("value", i.toString());
        opt.innerHTML = lang[i].getAttribute("title");
        if (currentLanguage.indexOf(lang[i].getAttribute("lang")) >= 0) {
            currentLanguageIndex = i;
            console.log(currentLanguage);
        }
        selecter.appendChild(opt);
    }
    selecter.options.selectedIndex = currentLanguageIndex;
    $("#langSelect").trigger("change");
});

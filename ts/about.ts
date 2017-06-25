function onLanChange(index) {
    const lang = document.getElementsByClassName("lang") as HTMLCollectionOf<HTMLElement>;
    const selecter = document.getElementById("langSelect") as HTMLSelectElement;
    for (let i = 0; i < lang.length; i++) {//tslint:disable-line
        lang[i].style.display = "none";
    }
    lang[index].style.display = "block";
    selecter.selectedIndex = index;
}

$(document).ready(() => {
    const cd64 = "|$$$}rstuvwxyz{$$$$$$$>?@ABCDEFGHIJKLMNOPQRSTUVW$$$$$$XYZ[\\]^_`abcdefghijklmnopq";

    function decode_block(str, offset) {
        const input = [0, 0, 0];
        for (let i = offset; i < offset + 4; ++i) {
            const c = str.charCodeAt(i);
            const v = (c >= 43 && c <= 122) ? cd64[c - 43] === "$" ? 0 : cd64.charCodeAt(c - 43) - 61 : 0;
            input[i - offset] = v - 1;
        }
        return String.fromCharCode(
            ((0xFF & input[0] << 2) | input[1] >> 4),
            ((0xFF & input[1] << 4) | input[2] >> 2),
            ((0xC0 & input[2] << 6) | input[3] >> 0),
        );
    }

    function decode(str) {
        let ret = "";
        for (let i = 0; i < str.length; i += 4) {
            ret += decode_block(str, i);
        }
        return ret;
    }
    const qrUrl = "L2ltZy9hbGlwYXlfcXIucG5n";
    document.addEventListener("DOMContentLoaded", () => {
        const qrcode = window["qrcode"];
        const donate = window["donate"];
        donate.addEventListener("mouseover", () => {
            setTimeout(() => { qrcode.src = decode(qrUrl); }, 201);
        });
        donate.addEventListener("mouseout", () => {
            setTimeout(() => { qrcode.src = ""; }, 201);
        });
    }, false);

});

$(document).ready(() => {
    const lang = document.getElementsByClassName("lang") as HTMLCollectionOf<HTMLElement>;
    const selecter = document.getElementById("langSelect") as HTMLSelectElement;
    if (lang.length === 0) {
        return;
    }
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

    onLanChange(currentLanguageIndex);
});

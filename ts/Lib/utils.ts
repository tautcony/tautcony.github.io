export function startsWith(text: string, searchString: string, position: number = 0) {
    return text.substring(position, searchString.length + position) === searchString;
}

export function checkDomain(url: string) {
    let ret = url;
    if (ret.indexOf("//") === 0) {
        ret = window.location.protocol + ret;
    }
    return ret.toLowerCase().replace(/([a-z])?:\/\//, "$1").split("/")[0];
}

export function isExternal(url: string) {
    return (url.length > 1 && (url.indexOf(":") > -1 || url.indexOf("//") > -1))
        && checkDomain(window.location.href) !== checkDomain(url);
}

// eslint-disable-next-line camelcase, @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention
export function util_ui_element_creator<K extends keyof HTMLElementTagNameMap>(type: K, props: any = {}, children: Element[] | Text | string = null): HTMLElementTagNameMap[K] {
    const elem = document.createElement(type);
    for (const n of Object.keys(props)) {
        switch (n) {
            case "style":
                for (const x of Object.keys(props.style)) {
                    elem.style[x] = props.style[x];
                }
                break;
            case "className":
                elem.className = props[n];
                break;
            case "event":
                for (const x of Object.keys(props.event)) {
                    elem.addEventListener(x, props.event[x]);
                }
                break;
            default:
                elem.setAttribute(n, props[n]);
                break;
        }
    }
    if (children) {
        if (Array.isArray(children)) {
            for (const child of children) {
                if (child !== null) {
                    elem.appendChild(child);
                }
            }
        } else if (typeof children === "string") {
            elem.textContent = children;
        } else {
            elem.textContent = (children as Text).data;
        }
    }
    return elem;
}

export function shuffle<T>(arr: T[]) {
    const newArr = arr.map(i => ({ v: i, r: Math.random() }));
    newArr.sort((a, b) => a.r - b.r);
    arr.splice(0, arr.length, ...newArr.map(i => i.v));
}

export function startsWith(text: string, searchString: string, position?: number) {
    return text.substr(position === undefined ? 0 : position, searchString.length) === searchString;
}

export function checkDomain(url: string) {
    let ret = url;
    if (ret.indexOf("//") === 0) {
        ret = location.protocol + ret;
    }
    return ret.toLowerCase().replace(/([a-z])?:\/\//, "$1").split("/")[0];
}

export function isExternal(url: string) {
    return (url.length > 1 && url.indexOf(":") > -1 || url.indexOf("//") > -1) &&
            checkDomain(location.href) !== checkDomain(url);
}

/*tslint:disable: no-any no-unsafe-any*/
export function util_ui_element_creator<K extends keyof HTMLElementTagNameMap>(type: K, props: any = {}, children: Element[] | Text = null): HTMLElementTagNameMap[K] {
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
        } else {
            elem.textContent = (children as Text).textContent;
        }
    }
    return elem;
}
/*tslint:enable: no-any no-unsafe-any*/

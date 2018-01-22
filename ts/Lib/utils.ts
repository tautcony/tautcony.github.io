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

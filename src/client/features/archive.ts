function queryString(): Record<string, string> {
    const queryObj: Record<string, string> = {};
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of params.entries()) {
        // URLSearchParams already percent-decodes (e.g. %E7%BC%96%E7%A8%8B → 编程, C%2B%2B → C++).
        queryObj[key] = value;
    }
    return queryObj;
}

const setUrlQuery = (() => {
    const baseUrl = window.location.href.split("?")[0] ?? window.location.pathname;
    return (query?: string) => {
        if (typeof query === "string") {
            window.history.replaceState(null, "", baseUrl + query);
        } else {
            window.history.replaceState(null, "", baseUrl);
        }
    };
})();

/** Normalize tag key for comparison (trim; decode once if still percent-encoded). */
function normalizeTagKey(raw: string | null | undefined): string {
    if (raw === null || raw === undefined) {
        return "";
    }
    let t = raw.trim();
    if (!t) {
        return "";
    }
    // Legacy pages may store data-encode as encodeURIComponent(tag); query is decoded.
    if (/%[0-9A-Fa-f]{2}/.test(t)) {
        try {
            t = decodeURIComponent(t);
        } catch {
            /* keep original */
        }
    }
    return t;
}

function find(selectors: string, parent: Element | Element[] | Document | null = document) {
    const queryParent = parent;
    if (queryParent === null) {
        return [];
    }
    if (!Array.isArray(queryParent)) {
        return Array.from(queryParent.querySelectorAll(selectors));
    }
    let ret: Element[] = [];
    for (const element of queryParent) {
        const subElements = element.querySelectorAll(selectors);
        ret = ret.concat(Array.from(subElements));
    }
    return ret;
}

export default class Archive {
    private tags: Element | null = null;
    private articalTags: Element[] = [];
    private tagShowAll: Element | null = null;
    private result: Element | null = null;
    private sections: Element[] = [];
    private sectionArticles: Element[][] = [];
    private lastFocusButton: Element | null = null;
    private sectionTopArticleIndex: number[] = [];
    private hasInit = false;

    private hasTagCloud = false;

    public constructor() {
        if (document.querySelector("#tag_cloud") === null) {
            return;
        }
        this.hasTagCloud = true;
        this.tags = document.querySelector(".js-tags");
        this.articalTags = find(".tag-button", this.tags);
        const tagButtonAll = find(".tag-button--all", this.tags);
        this.tagShowAll = tagButtonAll.length > 0 ? tagButtonAll[0] : null;
        this.result = document.querySelector(".js-result");
        this.sections = find("section", this.result);

        this.sections.forEach(section => {
            this.sectionArticles.push(find(".item", section));
        });

        let index = 0;
        for (const section of this.sections) {
            this.sectionTopArticleIndex.push(index);
            index += find(".item", section).length;
        }
        this.sectionTopArticleIndex.push(index);
    }

    public init() {
        if (!this.hasTagCloud) {
            return;
        }
        const query = queryString();
        // From /post → /archive/?tag=编程 (or C%2B%2B); value is already decoded.
        const queryTag = normalizeTagKey(query["tag"]);

        this.tagSelect(queryTag);

        find("a", this.tags).forEach(tag => {
            (tag as HTMLAnchorElement).addEventListener("click", e => {
                e.preventDefault();
                this.tagSelect(tag.getAttribute("data-encode"), tag);
            });
        });
    }

    private searchButtonsByTag(_tag: string | null /* raw tag */) {
        const key = normalizeTagKey(_tag);
        if (!key) {
            return this.tagShowAll;
        }
        const buttons = this.articalTags.filter(
            tag => normalizeTagKey(tag.getAttribute("data-encode")) === key
        );
        if (buttons.length === 0) {
            return this.tagShowAll;
        }
        return buttons[0];
    }

    private buttonFocus(target: Element | null) {
        if (target) {
            target.classList.add("focus");
            if (this.lastFocusButton && this.lastFocusButton !== target) {
                this.lastFocusButton.classList.remove("focus");
            }
            this.lastFocusButton = target;
        }
    }

    private tagSelect(_tag: string | null /* raw tag */, target?: Element) {
        const key = normalizeTagKey(_tag);
        const showAll = key === "";

        const result: Record<number, Record<number, boolean>> = {};
        for (let i = 0; i < this.sectionArticles.length; i++) {
            const articles = this.sectionArticles[i];
            for (let j = 0; j < articles.length; j++) {
                if (showAll) {
                    if (result[i] === undefined) {
                        result[i] = {};
                    }
                    result[i][j] = true;
                } else {
                    const tags = (articles[j].getAttribute("data-tags") ?? "")
                        .split(",")
                        .map(t => normalizeTagKey(t))
                        .filter(Boolean);
                    if (tags.includes(key)) {
                        if (result[i] === undefined) {
                            result[i] = {};
                        }
                        result[i][j] = true;
                    }
                }
            }
        }

        for (let i = 0; i < this.sectionArticles.length; i++) {
            if (result[i]) {
                this.sections[i].classList.remove("d-none");
            } else {
                this.sections[i].classList.add("d-none");
            }
            for (let j = 0; j < this.sectionArticles[i].length; j++) {
                if (result[i] && result[i][j]) {
                    this.sectionArticles[i][j].classList.remove("d-none");
                } else {
                    this.sectionArticles[i][j].classList.add("d-none");
                }
            }
        }

        if (!this.hasInit && this.result !== null) {
            this.result.classList.remove("d-none");
            this.hasInit = true;
        }

        if (target) {
            this.buttonFocus(target);
            const targetTag = normalizeTagKey(target.getAttribute("data-encode"));
            if (!targetTag) {
                setUrlQuery();
            } else {
                setUrlQuery(`?tag=${encodeURIComponent(targetTag)}`);
            }
        } else {
            this.buttonFocus(this.searchButtonsByTag(key));
        }
    }
}

function queryString(): { [key: string]: string } {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    const queryObj = {};
    const queryStr = window.location.search.substring(1);
    const queryArr = queryStr.split("&");
    for (const query of queryArr) {
        const pair = query.split("=");
        // If first entry with this name
        if (typeof queryObj[pair[0]] === "undefined") {
            queryObj[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof queryObj[pair[0]] === "string") {
            queryObj[pair[0]] = [queryObj[pair[0]], pair[1]];
            // If third or later entry with this name
        } else {
            // tslint:disable-next-line: no-unsafe-any
            queryObj[pair[0]].push(pair[1]);
        }
    }
    return queryObj;
}

const setUrlQuery = (() => {
    const baseUrl = window.location.href.split("?")[0];
    return (query?: string) => {
        if (typeof query === "string") {
            window.history.replaceState(null, "", baseUrl + query);
        } else {
            window.history.replaceState(null, "", baseUrl);
        }
    };
})();

function find(selectors: string, parent?: Element | Element[]) {
    const queryParent = parent ? parent : document;
    if (!Array.isArray(queryParent)) {
        return Array.from(queryParent.querySelectorAll(selectors));
    }
    const ret: Element[] = [];
    for (const element of queryParent) {
        const subElements = element.querySelectorAll(selectors);
        ret.concat(Array.from(subElements));
    }
    return ret;
}

export default class Archive {
    private tags: Element;
    private articalTags: Element[];
    private tagShowAll: Element;
    private result: Element;
    private sections: Element[];
    private sectionArticles: Element[][] = [];
    private lastFocusButton: Element = null;
    private sectionTopArticleIndex: number[] = [];
    private hasInit: boolean = false;

    public constructor() {
        if (document.querySelector("#tag_cloud") === null) {
            return;
        }
        this.tags = document.querySelector(".js-tags");
        this.articalTags = find(".tag-button", this.tags);
        this.tagShowAll = find(".tag-button--all", this.tags)[0];
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

        const query = queryString();
        const _tag = query["tag"];

        this.tagSelect(_tag);

        find("a", this.tags).forEach(tag => {
            (tag as HTMLAnchorElement).addEventListener("click", () => {   /* only change */
                this.tagSelect(tag.getAttribute("data-encode"), tag);
            });
        });
    }

    private searchButtonsByTag(_tag: string/*raw tag*/) {
        if (!_tag) {
            return this.tagShowAll;
        }
        const _buttons = this.articalTags.filter(tag => tag.getAttribute("data-encode") === _tag);
        if (_buttons.length === 0) {
            return this.tagShowAll;
        }
        return _buttons[0];
    }

    private buttonFocus(target: Element) {
        if (target) {
            target.classList.add("focus");
            if (this.lastFocusButton && this.lastFocusButton !== target) {
                this.lastFocusButton.classList.remove("focus");
            }
            this.lastFocusButton = target;
        }
    }

    private tagSelect(_tag: string/*raw tag*/, target?: Element) {
        const result: { [key: number]: { [key: number]: boolean } } = {};

        for (let i = 0; i < this.sectionArticles.length; i++) {
            const articles = this.sectionArticles[i];
            for (let j = 0; j < articles.length; j++) {
                if (_tag === "" || _tag === undefined) {
                    if (result[i] === undefined) {
                        result[i] = {};
                    }
                    result[i][j] = true;
                } else {
                    const tags = articles[j].getAttribute("data-tags").split(",");
                    for (const element of tags) {
                        if (element === _tag) {
                            if (result[i] === undefined) {
                                result[i] = {};
                            }
                            result[i][j] = true; break;
                        }
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

        if (!this.hasInit) {
            this.result.classList.remove("d-none");
            this.hasInit = true;
        }

        if (target) {
            this.buttonFocus(target);
            const targetTag = target.getAttribute("data-encode");
            if (targetTag === "" || typeof targetTag !== "string") {
                setUrlQuery();
            } else {
                setUrlQuery(`?tag=${targetTag}`);
            }
        } else {
            this.buttonFocus(this.searchButtonsByTag(_tag));
        }
    }
}

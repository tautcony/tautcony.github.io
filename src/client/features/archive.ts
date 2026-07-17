/**
 * Archive tag filter (`#tag_cloud` + `.js-result`).
 * Tag-cloud font/color is SSG (`lib/tag-cloud`); this only filters + `?tag=`.
 */

/** Normalize tag key (trim; decode once if still percent-encoded). */
function normalizeTagKey(raw: string | null | undefined): string {
    if (raw === null || raw === undefined) {
        return "";
    }
    let text = raw.trim();
    if (!text) {
        return "";
    }
    if (/%[0-9A-Fa-f]{2}/.test(text)) {
        try {
            text = decodeURIComponent(text);
        } catch {
            /* keep original */
        }
    }
    return text;
}

function queryAll(selector: string, parent: ParentNode | null): Element[] {
    if (!parent) {
        return [];
    }
    return [...parent.querySelectorAll(selector)];
}

function setTagQuery(tag?: string): void {
    const url = new URL(window.location.href);
    if (tag) {
        url.searchParams.set("tag", tag);
    } else {
        url.searchParams.delete("tag");
    }
    window.history.replaceState(null, "", url);
}

class ArchiveFilter {
    private readonly articleTagButtons: Element[];
    private readonly showAllButton: Element | null;
    private readonly resultRoot: Element | null;
    private readonly sections: Element[];
    private readonly sectionArticles: Element[][];
    private readonly articleTagKeys: string[][][];
    private lastFocusedButton: Element | null = null;
    private revealed = false;

    public constructor(tagsRoot: Element) {
        this.articleTagButtons = queryAll(".tag-button", tagsRoot);
        this.showAllButton = queryAll(".tag-button--all", tagsRoot)[0] ?? null;
        this.resultRoot = document.querySelector(".js-result");
        this.sections = queryAll("section", this.resultRoot);
        this.sectionArticles = [];
        this.articleTagKeys = [];

        for (const section of this.sections) {
            const items = queryAll(".item", section);
            this.sectionArticles.push(items);
            this.articleTagKeys.push(
                items.map(item =>
                    (item.getAttribute("data-tags") ?? "")
                        .split(",")
                        .map(tag => normalizeTagKey(tag))
                        .filter(Boolean)
                )
            );
        }

        for (const tag of queryAll("a", tagsRoot)) {
            tag.addEventListener("click", event => {
                event.preventDefault();
                this.selectTag(tag.getAttribute("data-encode"), tag);
            });
        }

        // From /post → /archive/?tag=编程; URLSearchParams already decodes.
        const queryTag = normalizeTagKey(new URLSearchParams(window.location.search).get("tag"));
        this.selectTag(queryTag);
    }

    private findButtonByTag(tag: string | null): Element | null {
        const key = normalizeTagKey(tag);
        if (!key) {
            return this.showAllButton;
        }
        return this.articleTagButtons.find(
            button => normalizeTagKey(button.getAttribute("data-encode")) === key
        ) ?? this.showAllButton;
    }

    private focusButton(target: Element | null): void {
        if (!target) {
            return;
        }
        target.classList.add("focus");
        if (this.lastFocusedButton && this.lastFocusedButton !== target) {
            this.lastFocusedButton.classList.remove("focus");
        }
        this.lastFocusedButton = target;
    }

    private selectTag(tag: string | null, target?: Element): void {
        const key = normalizeTagKey(tag);
        const showAll = key === "";

        for (let sectionIndex = 0; sectionIndex < this.sectionArticles.length; sectionIndex++) {
            const articles = this.sectionArticles[sectionIndex];
            const tagKeys = this.articleTagKeys[sectionIndex];
            let sectionVisible = false;

            for (let articleIndex = 0; articleIndex < articles.length; articleIndex++) {
                const visible = showAll || tagKeys[articleIndex].includes(key);
                articles[articleIndex].classList.toggle("d-none", !visible);
                if (visible) {
                    sectionVisible = true;
                }
            }
            this.sections[sectionIndex].classList.toggle("d-none", !sectionVisible);
        }

        if (!this.revealed && this.resultRoot !== null) {
            this.resultRoot.classList.remove("d-none");
            this.revealed = true;
        }

        if (target) {
            this.focusButton(target);
            const targetTag = normalizeTagKey(target.getAttribute("data-encode"));
            setTagQuery(targetTag || undefined);
        } else {
            this.focusButton(this.findButtonByTag(key));
        }
    }
}

export function init(): void {
    const tagsRoot = document.querySelector(".js-tags") ?? document.querySelector("#tag_cloud");
    if (tagsRoot === null) {
        return;
    }
    new ArchiveFilter(tagsRoot);
}

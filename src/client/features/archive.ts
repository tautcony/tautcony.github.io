/** Normalize tag key for comparison (trim; decode once if still percent-encoded). */
function normalizeTagKey(raw: string | null | undefined): string {
    if (raw === null || raw === undefined) {
        return "";
    }
    let text = raw.trim();
    if (!text) {
        return "";
    }
    // Legacy pages may store data-encode as encodeURIComponent(tag); query is decoded.
    if (/%[0-9A-Fa-f]{2}/.test(text)) {
        try {
            text = decodeURIComponent(text);
        } catch {
            /* keep original */
        }
    }
    return text;
}

function queryAll(selectors: string, parent: ParentNode | null = document): Element[] {
    if (!parent) {
        return [];
    }
    return Array.from(parent.querySelectorAll(selectors));
}

/** Update `?tag=` while preserving path/hash and other params. */
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
    private tagsRoot: Element | null = null;
    private articleTagButtons: Element[] = [];
    private showAllButton: Element | null = null;
    private resultRoot: Element | null = null;
    private sections: Element[] = [];
    private sectionArticles: Element[][] = [];
    /** Pre-normalized tags per article (sectionIndex → articleIndex → tags). */
    private articleTagKeys: string[][][] = [];
    private lastFocusedButton: Element | null = null;
    private isInitialized = false;
    private hasTagCloud = false;

    public constructor() {
        if (document.querySelector("#tag_cloud") === null) {
            return;
        }
        this.hasTagCloud = true;
        this.tagsRoot = document.querySelector(".js-tags");
        this.articleTagButtons = queryAll(".tag-button", this.tagsRoot);
        this.showAllButton = queryAll(".tag-button--all", this.tagsRoot)[0] ?? null;
        this.resultRoot = document.querySelector(".js-result");
        this.sections = queryAll("section", this.resultRoot);

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
    }

    public init(): void {
        if (!this.hasTagCloud) {
            return;
        }
        // From /post → /archive/?tag=编程 (or C%2B%2B); URLSearchParams already decodes.
        const queryTag = normalizeTagKey(new URLSearchParams(window.location.search).get("tag"));
        this.selectTag(queryTag);

        for (const tag of queryAll("a", this.tagsRoot)) {
            tag.addEventListener("click", event => {
                event.preventDefault();
                this.selectTag(tag.getAttribute("data-encode"), tag);
            });
        }
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

        if (!this.isInitialized && this.resultRoot !== null) {
            this.resultRoot.classList.remove("d-none");
            this.isInitialized = true;
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
    new ArchiveFilter().init();
}

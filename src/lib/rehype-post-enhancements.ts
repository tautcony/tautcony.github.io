/**
 * Markdown rehype pass: SSG polish formerly done in client features.
 *
 * - `p` whose text starts with `//` → class `comment-line`
 * - off-site `a[href]` → class `external`
 * - `table` → class `table`, wrapped in `div.table-responsive`
 */
import { site } from "../data/site";
import { isExternalHref } from "./is-external";

interface HastText {
    type: "text";
    value: string;
}

interface HastElement {
    type: "element";
    tagName: string;
    properties?: Record<string, unknown>;
    children?: HastNode[];
}

interface HastRoot {
    type: "root";
    children?: HastNode[];
}

type HastNode = HastRoot | HastElement | HastText | { type: string; children?: HastNode[] };

function textContent(node: HastNode): string {
    if (node.type === "text") {
        return (node as HastText).value ?? "";
    }
    const children = "children" in node && node.children ? node.children : [];
    let out = "";
    for (const child of children) {
        out += textContent(child);
    }
    return out;
}

function classList(el: HastElement): string[] {
    const current = el.properties?.className;
    if (Array.isArray(current)) {
        return current.map(String);
    }
    if (typeof current === "string" && current.trim() !== "") {
        return current.split(/\s+/).filter(Boolean);
    }
    return [];
}

function addClass(el: HastElement, className: string): void {
    const props = el.properties ?? (el.properties = {});
    const list = classList(el);
    if (!list.includes(className)) {
        list.push(className);
    }
    props.className = list;
}

function hasClass(el: HastElement, className: string): boolean {
    return classList(el).includes(className);
}

function enhanceInPlace(el: HastElement, siteOrigin: string): void {
    if (el.tagName === "p") {
        if (textContent(el).trimStart().startsWith("//")) {
            addClass(el, "comment-line");
        }
        return;
    }
    if (el.tagName === "a") {
        const href = el.properties?.href;
        if (typeof href === "string" && isExternalHref(href, siteOrigin)) {
            addClass(el, "external");
        }
        return;
    }
    if (el.tagName === "table") {
        addClass(el, "table");
    }
}

/**
 * Depth-first: enhance nodes, then rewrite each parent's children so bare
 * tables become `.table-responsive` wrappers (skip if already wrapped).
 */
function walk(node: HastNode, siteOrigin: string): void {
    if (node.type === "element") {
        enhanceInPlace(node as HastElement, siteOrigin);
    }

    const children = "children" in node && node.children ? node.children : undefined;
    if (!children || children.length === 0) {
        return;
    }

    for (const child of children) {
        walk(child, siteOrigin);
    }

    // Do not re-wrap tables already inside an author/previous wrapper.
    if (
        node.type === "element"
        && (node as HastElement).tagName === "div"
        && hasClass(node as HastElement, "table-responsive")
    ) {
        return;
    }

    let changed = false;
    const next: HastNode[] = [];
    for (const child of children) {
        if (child.type === "element" && (child as HastElement).tagName === "table") {
            next.push({
                type: "element",
                tagName: "div",
                properties: { className: ["table-responsive"] },
                children: [child as HastElement],
            });
            changed = true;
        } else {
            next.push(child);
        }
    }
    if (changed && "children" in node) {
        (node as HastRoot | HastElement).children = next;
    }
}

/** Astro / unified rehype plugin (no options). */
export function rehypePostEnhancements() {
    const siteOrigin = new URL(site.url).origin;
    return (tree: HastRoot) => {
        walk(tree, siteOrigin);
    };
}

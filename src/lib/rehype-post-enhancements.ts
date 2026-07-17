/**
 * Markdown rehype pass: SSG polish formerly done in client features.
 *
 * - `p` whose text starts with `//` → class `comment-line`
 * - off-site `a[href]` → class `external`
 * - `table` → class `table`, wrapped in `div.table-responsive`
 * - `.pdf-embed` → inject hidden `.pdf-embed__mount` (viewer HTML; not painted)
 */
import { site } from "../data/site";
import { isExternalHref } from "./is-external";
import { cssLength, pdfOpenUrl } from "./pdf-embed";

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

function propString(el: HastElement, ...keys: string[]): string | undefined {
    const props = el.properties ?? {};
    for (const key of keys) {
        const value = props[key];
        if (typeof value === "string" && value.trim() !== "") {
            return value;
        }
        if (typeof value === "number" || typeof value === "boolean") {
            return String(value);
        }
    }
    return undefined;
}

function h(
    tagName: string,
    properties: Record<string, unknown> | null,
    children: HastNode[] = []
): HastElement {
    return {
        type: "element",
        tagName,
        properties: properties ?? {},
        children,
    };
}

function text(value: string): HastText {
    return { type: "text", value };
}

function openLink(file: string, label: string): HastElement {
    return h(
        "a",
        { href: file, target: "_blank", rel: ["noopener"] },
        [text(label)]
    );
}

/**
 * Inject hidden mount shell (former `mountEmbed` HTML). Not painted until the
 * client replaces the single idle placeholder with its children.
 */
function expandPdfEmbed(el: HastElement): void {
    if (el.tagName !== "div" || !hasClass(el, "pdf-embed")) {
        return;
    }

    const file = propString(el, "dataPdfFile", "data-pdf-file");
    if (!file) {
        return;
    }

    const children = el.children ?? (el.children = []);
    const hasMount = children.some(
        c =>
            c.type === "element"
            && (c as HastElement).tagName === "div"
            && hasClass(c as HastElement, "pdf-embed__mount")
    );
    if (hasMount) {
        return;
    }

    // Drop prior sibling object/actions or empty templates from older builds.
    el.children = children.filter(c => {
        if (c.type !== "element") {
            return true;
        }
        const child = c as HastElement;
        if (child.tagName === "object" && hasClass(child, "pdf-embed__viewer")) {
            return false;
        }
        if (child.tagName === "p" && hasClass(child, "pdf-embed__actions")) {
            return false;
        }
        if (child.tagName === "template" && hasClass(child, "pdf-embed__mount")) {
            return false;
        }
        return true;
    });

    const title = propString(el, "dataPdfTitle", "data-pdf-title") || "PDF document";
    const height = cssLength(propString(el, "dataPdfHeight", "data-pdf-height") || "500");
    const openHref = pdfOpenUrl(file);

    // Unsupported-browser fallback is plain text/link — not a second
    // `.pdf-embed__placeholder` block (that class is idle-only).
    el.children!.push(
        h("div", { className: ["pdf-embed__mount"], hidden: true }, [
            h(
                "object",
                {
                    className: ["pdf-embed__viewer"],
                    type: "application/pdf",
                    title,
                    ariaLabel: title,
                    style: `height: ${height}`,
                },
                [
                    h("p", { className: ["pdf-embed__nosupport"] }, [
                        text("当前浏览器不支持内嵌 PDF 预览 · "),
                        openLink(openHref, "直接打开 / 下载 PDF"),
                    ]),
                ]
            ),
            h(
                "p",
                { className: ["pdf-embed__alt", "pdf-embed__actions"] },
                [openLink(openHref, "在新窗口打开 / 下载 PDF")]
            ),
        ])
    );
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
        return;
    }
    if (el.tagName === "div") {
        expandPdfEmbed(el);
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

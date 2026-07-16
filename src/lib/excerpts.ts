import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import { site } from "../data/site";
import type { PostEntry } from "./posts";

const markdownProcessor = createMarkdownProcessor({
    gfm: true,
    smartypants: false,
    syntaxHighlight: false,
});

const EXCLUDED_HTML_BLOCKS = new Set([
    "script",
    "style",
    "template",
    "noscript",
    "iframe",
    "object",
]);

interface HtmlTag {
    name: string;
    end: number;
    closing: boolean;
    selfClosing: boolean;
}

function isHtmlNameChar(ch: string | undefined): boolean {
    return ch !== undefined && (
        (ch >= "a" && ch <= "z")
        || (ch >= "A" && ch <= "Z")
        || (ch >= "0" && ch <= "9")
        || ch === "-"
        || ch === ":"
    );
}

function findTagEnd(source: string, start: number): number {
    let quote = "";
    for (let i = start; i < source.length; i++) {
        const ch = source[i];
        if (quote) {
            if (ch === quote) quote = "";
        } else if (ch === "\"" || ch === "'") {
            quote = ch;
        } else if (ch === ">") {
            return i;
        }
    }
    return -1;
}

function parseHtmlTagAt(source: string, index: number): HtmlTag | null {
    if (source[index] !== "<") return null;

    let cursor = index + 1;
    let closing = false;
    if (source[cursor] === "/") {
        closing = true;
        cursor++;
    }

    while (source[cursor] === " " || source[cursor] === "\n" || source[cursor] === "\r" || source[cursor] === "\t") {
        cursor++;
    }

    const nameStart = cursor;
    while (isHtmlNameChar(source[cursor])) cursor++;
    if (cursor === nameStart) return null;

    const end = findTagEnd(source, cursor);
    if (end === -1) return null;

    return {
        name: source.slice(nameStart, cursor).toLowerCase(),
        end: end + 1,
        closing,
        selfClosing: source[end - 1] === "/",
    };
}

function findElementBlockEnd(source: string, start: number, name: string): number {
    let depth = 1;
    let cursor = start;

    while (cursor < source.length) {
        const nextTag = source.indexOf("<", cursor);
        if (nextTag === -1) return source.length;

        const tag = parseHtmlTagAt(source, nextTag);
        if (!tag) {
            cursor = nextTag + 1;
            continue;
        }

        if (tag.name === name) {
            if (tag.closing) {
                depth--;
                if (depth === 0) return tag.end;
            } else if (!tag.selfClosing) {
                depth++;
            }
        }

        cursor = tag.end;
    }

    return source.length;
}

function removeHtmlComments(source: string): string {
    let out = "";
    let cursor = 0;

    while (cursor < source.length) {
        const start = source.indexOf("<!--", cursor);
        if (start === -1) {
            out += source.slice(cursor);
            break;
        }

        out += source.slice(cursor, start);
        const end = source.indexOf("-->", start + 4);
        if (end === -1) break;
        cursor = end + 3;
    }

    return out;
}

function removeExcludedHtmlBlocks(source: string): string {
    let out = "";
    let cursor = 0;

    while (cursor < source.length) {
        const nextTag = source.indexOf("<", cursor);
        if (nextTag === -1) {
            out += source.slice(cursor);
            break;
        }

        const tag = parseHtmlTagAt(source, nextTag);
        if (!tag || tag.closing || !EXCLUDED_HTML_BLOCKS.has(tag.name)) {
            out += source.slice(cursor, nextTag + 1);
            cursor = nextTag + 1;
            continue;
        }

        out += source.slice(cursor, nextTag);
        cursor = findElementBlockEnd(source, tag.end, tag.name);
    }

    return out;
}

function stripHtmlTags(source: string): string {
    let out = "";
    let cursor = 0;

    while (cursor < source.length) {
        const nextTag = source.indexOf("<", cursor);
        if (nextTag === -1) {
            out += source.slice(cursor);
            break;
        }

        const tag = parseHtmlTagAt(source, nextTag);
        if (!tag) {
            out += source.slice(cursor, nextTag + 1);
            cursor = nextTag + 1;
            continue;
        }

        out += `${source.slice(cursor, nextTag)} `;
        cursor = tag.end;
    }

    return out;
}

function cleanExcerptSource(source: string): string {
    return stripHtmlTags(removeExcludedHtmlBlocks(removeHtmlComments(source))).trim();
}

export function getExcerpt(post: PostEntry): string {
    const body = post.body ?? "";
    const separator = site.excerptSeparator;
    const hasSeparator = body.includes(separator);
    const raw = hasSeparator ? body.split(separator, 1)[0] : body;
    const excerpt = cleanExcerptSource(raw);
    return hasSeparator ? excerpt : excerpt.slice(0, 256).trimEnd();
}

export async function getExcerptHtml(post: PostEntry): Promise<string> {
    const processor = await markdownProcessor;
    const result = await processor.render(getExcerpt(post));
    return result.code;
}

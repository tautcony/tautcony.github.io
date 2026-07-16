import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import { site } from "../data/site";
import type { PostEntry } from "./posts";

const markdownProcessor = createMarkdownProcessor({
    gfm: true,
    smartypants: false,
    syntaxHighlight: false,
});

function cleanExcerptSource(source: string): string {
    return source
        .replace(/<(script|style|template|noscript|iframe|object)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<[^>]+>/g, "")
        .trim();
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

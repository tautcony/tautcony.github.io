import excerptsJson from "../../mig/fixtures/excerpts.json";
import type { PostEntry } from "./posts";

const map = excerptsJson as Record<string, string>;

export function getExcerpt(post: PostEntry): string {
    const key = post.data.sourceFilename;
    if (key && map[key] != null) return map[key];
    // Fallback for new posts without fixture
    const body = post.body ?? "";
    const raw = body.includes("<!--more-->") ? body.split("<!--more-->")[0] : body;
    return raw
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 256);
}

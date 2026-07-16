/**
 * Typed last-modified map for posts (generated JSON under the same folder).
 * UI components should import from here instead of casting the raw JSON.
 */
import raw from "./lastmod.json";

export interface LastmodEntry {
    sha: string;
    short_sha: string;
    date: string;
    display: string;
    content_sha256?: string;
}

export const lastmodMap: Readonly<Record<string, LastmodEntry>> = raw;

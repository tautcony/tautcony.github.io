import { el } from "../lib/dom";

export interface Info {
    tagName: string;
    className?: string;
    cssText?: string;
    content: string | HTMLElement[];
}

/** One author/work with one or more interchangeable lines. */
export interface QuoteEntry {
    text: string[];
    author: string;
    /** Optional work / speech title; omitted when unknown. */
    source?: string;
}

async function getJSON(url: string): Promise<unknown> {
    const response = await fetch(url, { credentials: "omit" });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return response.json() as Promise<unknown>;
}

/**
 * Accept either a bare array (public/json/quote.json) or `{ quotes: [...] }`.
 */
export function parseQuotePayload(data: unknown): QuoteEntry[] {
    const list = Array.isArray(data)
        ? data
        : data !== null && typeof data === "object" && Array.isArray((data as { quotes?: unknown }).quotes)
            ? (data as { quotes: unknown[] }).quotes
            : null;
    if (!list) {
        throw new Error("quote payload must be an array or { quotes: [] }");
    }

    return list.map((item, i) => {
        if (item === null || typeof item !== "object" || Array.isArray(item)) {
            throw new Error(`quote[${i}] must be an object`);
        }
        const rec = item as Record<string, unknown>;
        const author = rec.author;
        const text = rec.text;
        if (typeof author !== "string" || !author.trim()) {
            throw new Error(`quote[${i}].author required`);
        }
        if (!Array.isArray(text) || text.length === 0 || !text.every(t => typeof t === "string" && t.trim())) {
            throw new Error(`quote[${i}].text must be a non-empty string array`);
        }
        const entry: QuoteEntry = {
            author: author.trim(),
            text: text as string[],
        };
        if (typeof rec.source === "string" && rec.source.trim()) {
            entry.source = rec.source;
        }
        return entry;
    });
}

export default class Quote {
    private readonly container: HTMLElement;
    private readonly content: HTMLElement;
    private readonly author: HTMLElement;
    private quotes: QuoteEntry[] = [];
    private timer: number | undefined;

    public constructor(containerSelector: string, className: string) {
        this.content = el("div", {
            class: "quote-content",
            style: { marginTop: "2em" },
        });
        this.author = el("div", {
            class: "quote-author",
            style: {
                marginLeft: "16em",
                fontSize: "85%",
            },
        });
        this.container = el("div", { class: className }, this.content, this.author);

        document.querySelector(containerSelector)?.append(this.container);
    }

    public init(timeout: number) {
        void this.fetchData().then(() => {
            this.updateQuote();
            this.interval(timeout);
        });
    }

    public updateQuote() {
        const quote = this.randomQuote();
        if (quote === undefined) {
            return;
        }
        const content = quote.text[Math.floor(Math.random() * quote.text.length)];
        let author = `—— ${quote.author}`;
        if (quote.source) {
            author += `《${quote.source}》`;
        }
        this.content.textContent = content;
        this.author.textContent = author;
    }

    /** @deprecated Prefer {@link updateQuote}. */
    public UpdateQuote() {
        this.updateQuote();
    }

    private randomQuote(): QuoteEntry | undefined {
        if (this.quotes.length === 0) {
            if (this.timer !== undefined) {
                clearInterval(this.timer);
            }
            return undefined;
        }
        return this.quotes[Math.floor(Math.random() * this.quotes.length)];
    }

    private interval(timeout: number) {
        this.timer = window.setInterval(() => {
            this.updateQuote();
        }, timeout);
    }

    private async fetchData() {
        const baseMeta = document.head.querySelector("meta[name=baseurl]");
        const baseurl = baseMeta instanceof HTMLMetaElement ? baseMeta.content : "";
        const url = `${baseurl}/json/quote.json`;

        try {
            this.quotes = parseQuotePayload(await getJSON(url));
        } catch (err) {
            console.warn("Failed to load quote.json", err);
        }
    }
}

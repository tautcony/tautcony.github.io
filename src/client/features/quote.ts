/**
 * Footer quote rotation. Initial paint is SSG (`Footer.astro`);
 * quotes payload is `#site-quotes` JSON (no network fetch).
 */

export interface QuoteEntry {
    text: string[];
    author: string;
    source?: string;
}

export interface QuoteOptions {
    /** Root `.quote` selector. */
    quoteSelector?: string;
    /** Rotation interval in milliseconds. */
    intervalMs?: number;
    /** JSON script id produced by Footer. */
    dataScriptId?: string;
}

function parseQuotePayload(data: unknown): QuoteEntry[] {
    const list = Array.isArray(data)
        ? data
        : data !== null && typeof data === "object" && Array.isArray((data as { quotes?: unknown }).quotes)
            ? (data as { quotes: unknown[] }).quotes
            : null;
    if (!list) {
        throw new Error("quote payload must be an array or { quotes: [] }");
    }

    return list.map((item, index) => {
        if (item === null || typeof item !== "object" || Array.isArray(item)) {
            throw new Error(`quote[${index}] must be an object`);
        }
        const record = item as Record<string, unknown>;
        const author = record.author;
        const text = record.text;
        if (typeof author !== "string" || !author.trim()) {
            throw new Error(`quote[${index}].author required`);
        }
        if (!Array.isArray(text) || text.length === 0 || !text.every(line => typeof line === "string" && line.trim())) {
            throw new Error(`quote[${index}].text must be a non-empty string array`);
        }
        const entry: QuoteEntry = {
            author: author.trim(),
            text: text as string[],
        };
        if (typeof record.source === "string" && record.source.trim()) {
            entry.source = record.source;
        }
        return entry;
    });
}

function readQuotesFromDom(scriptId: string): QuoteEntry[] {
    const el = document.getElementById(scriptId);
    if (!(el instanceof HTMLScriptElement) || !el.textContent?.trim()) {
        throw new Error(`#${scriptId} missing or empty`);
    }
    return parseQuotePayload(JSON.parse(el.textContent) as unknown);
}

function pickRandom<T>(items: readonly T[]): T | undefined {
    if (items.length === 0) {
        return undefined;
    }
    return items[Math.floor(Math.random() * items.length)];
}

function formatAttribution(quote: QuoteEntry): string {
    let author = `—— ${quote.author}`;
    if (quote.source) {
        author += `《${quote.source}》`;
    }
    return author;
}

const FADE_DURATION_MS = 250;

class QuoteRotator {
    private readonly root: HTMLElement;
    private readonly content: HTMLElement;
    private readonly author: HTMLElement;
    private quotes: QuoteEntry[] = [];
    private timerId: number | undefined;
    private fadeTimerId: number | undefined;
    private paused = false;
    private lockedMinHeight = 0;

    public constructor(root: HTMLElement, content: HTMLElement, author: HTMLElement) {
        this.root = root;
        this.content = content;
        this.author = author;
    }

    public start(quotes: QuoteEntry[], intervalMs: number): void {
        this.quotes = quotes;
        if (this.quotes.length === 0) {
            return;
        }

        // Lock initial height monotonically so quote updates never shrink/shift the page above.
        this.lockedMinHeight = Math.max(this.root.offsetHeight, 88);
        this.root.style.minHeight = `${this.lockedMinHeight}px`;
        this.root.setAttribute("title", "点击换一条");

        this.root.addEventListener("mouseenter", () => {
            this.paused = true;
        });
        this.root.addEventListener("mouseleave", () => {
            this.paused = false;
        });
        this.root.addEventListener("click", () => {
            // Do not rotate if the user is selecting quote text.
            if (window.getSelection()?.toString()) return;
            this.paint(true);
        });

        // First interval only — SSG already painted the initial line.
        this.timerId = window.setInterval(() => {
            if (!this.paused) {
                this.paint(false);
            }
        }, intervalMs);
    }

    private pickNext(): { line: string; attribution: string } | undefined {
        const currentLine = this.content.textContent ?? "";
        for (let attempt = 0; attempt < 5; attempt++) {
            const quote = pickRandom(this.quotes);
            if (!quote) return undefined;
            const line = pickRandom(quote.text) ?? "";
            if (line !== currentLine || this.quotes.length === 1) {
                return { line, attribution: formatAttribution(quote) };
            }
        }
        const fallback = pickRandom(this.quotes);
        if (!fallback) return undefined;
        return {
            line: pickRandom(fallback.text) ?? "",
            attribution: formatAttribution(fallback),
        };
    }

    private paint(immediate: boolean): void {
        const next = this.pickNext();
        if (!next) {
            if (this.timerId !== undefined) {
                clearInterval(this.timerId);
                this.timerId = undefined;
            }
            return;
        }

        window.clearTimeout(this.fadeTimerId);
        this.root.classList.add("is-fading");

        this.fadeTimerId = window.setTimeout(() => {
            this.content.textContent = next.line;
            this.author.textContent = next.attribution;

            // Never allow height to shrink below what was already rendered.
            const measured = this.root.scrollHeight;
            if (measured > this.lockedMinHeight) {
                this.lockedMinHeight = measured;
                this.root.style.minHeight = `${this.lockedMinHeight}px`;
            }

            this.root.classList.remove("is-fading");
        }, immediate ? 120 : FADE_DURATION_MS);
    }
}

const DEFAULTS = {
    quoteSelector: "footer .quote",
    intervalMs: 10_000,
    dataScriptId: "site-quotes",
} as const;

export function init(options: QuoteOptions = {}): void {
    const root = document.querySelector<HTMLElement>(
        options.quoteSelector ?? DEFAULTS.quoteSelector
    );
    const content = root?.querySelector<HTMLElement>(".quote-content");
    const author = root?.querySelector<HTMLElement>(".quote-author");
    if (!root || !content || !author) {
        return;
    }

    let quotes: QuoteEntry[];
    try {
        quotes = readQuotesFromDom(options.dataScriptId ?? DEFAULTS.dataScriptId);
    } catch (error) {
        console.warn("Failed to read site quotes", error);
        return;
    }

    new QuoteRotator(root, content, author).start(
        quotes,
        options.intervalMs ?? DEFAULTS.intervalMs
    );
}

import { el } from "./utils";

export interface Info {
    tagName: string;
    className?: string;
    cssText?: string;
    content: string | HTMLElement[];
}

interface QuoteEntry {
    text: string[];
    author: string;
    source: string;
}

async function getJSON<T>(url: string): Promise<T> {
    const response = await fetch(url, { credentials: "omit" });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return response.json() as Promise<T>;
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
        if (quote.source !== "") {
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
            this.quotes = await getJSON<QuoteEntry[]>(url);
        } catch (err) {
            console.warn("Failed to load quote.json", err);
        }
    }
}

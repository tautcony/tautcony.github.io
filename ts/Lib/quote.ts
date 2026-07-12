import { util_ui_element_creator as _ } from "./utils";

export interface Info {
    tagName: string;
    className?: string;
    cssText?: string;
    content: string | HTMLElement[];
}

interface IFormat {
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
    private container: HTMLElement;
    private content: HTMLElement;
    private author: HTMLElement;
    private quotes: IFormat[] = [];
    private timer: number | undefined;

    public constructor(containerSelector: string, className: string) {
        this.container = _(
            "div",
            { className },
            [
                _("div", {
                    className: "quote-content",
                    style: {
                        "margin-top": "2em",
                    },
                }),
                _("div", {
                    className: "quote-author",
                    style: {
                        "margin-left": "16em",
                        "font-size": "85%",
                    },
                }),
            ]
        );
        this.content = this.container.querySelector(".quote-content") as HTMLElement;
        this.author = this.container.querySelector(".quote-author") as HTMLElement;
        const container = document.querySelector(containerSelector);
        if (container !== null) {
            container.appendChild(this.container);
        }
    }

    public init(timeout: number) {
        this.FetchData().then(() => {
            this.UpdateQuote();
            this.Interval(timeout);
        });
    }

    public UpdateQuote() {
        const quote = this.RandomQuote();
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

    private RandomQuote = () => {
        if (this.quotes.length === 0) {
            if (this.timer !== undefined) {
                clearInterval(this.timer);
            }
            return undefined;
        }
        return this.quotes[Math.floor(Math.random() * this.quotes.length)];
    };

    private Interval(timeout: number) {
        this.timer = window.setInterval(() => {
            this.UpdateQuote();
        }, timeout);
    }

    private async FetchData() {
        const baseMeta = document.head.querySelector("meta[name=baseurl]") as HTMLMetaElement | null;
        const baseurl = baseMeta?.content ?? "";
        let url = "/json/quote.json";
        if (baseurl !== "") {
            url = baseurl + url;
        }

        try {
            this.quotes = await getJSON<IFormat[]>(url);
        } catch (err) {
            console.warn("Failed to load quote.json", err);
        }
    }
}

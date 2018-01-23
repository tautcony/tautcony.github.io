import {util_ui_element_creator as _} from "./utils";

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

export default class Quote {
    private container: HTMLElement;
    private quotes: IFormat[];
    private timer: NodeJS.Timer;
    public constructor(containerSelector: string, className: string) {
        this.container = _("div", {className}, [
            _("div", {
                className: "quote-content",
                style: {
                    "margin-top": "2em"
                }
            }),
            _("div", {
                className: "quote-author",
                style: {
                    "margin-left": "16em",
                    "font-size": "85%"
                }
            })
        ]);
        document.querySelector(containerSelector).appendChild(this.container);
    }

    public Init(timeout: number) {
        this.FetchData(() => {
            this.UpdateQuote();
            this.Interval(timeout);
        });
    }

    public UpdateQuote() {
        const quote = this.RandomQuote();
        this.container.querySelector(".quote-content").textContent = quote.text;
        this.container.querySelector(".quote-author").textContent  = `—— ${quote.author} 《${quote.source}》`;
    }

    private Interval(timeout: number) {
        this.timer = setInterval(() => {
            this.UpdateQuote();
        }, timeout);
    }

    private FetchData(callBack: () => void) {
        const baseurl = (document.head.querySelector("meta[name=baseurl]") as HTMLMetaElement).content;
        let url = "/json/quote.json";
        if (baseurl !== undefined && baseurl !== "") {
            url = baseurl + url;
        }
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onload = () => {
            if (xhr.readyState === 4 && xhr.getResponseHeader("content-type").indexOf("application/json") !== -1) {
                this.quotes = JSON.parse(xhr.responseText) as IFormat[];
                callBack();
            } else {
                console.error(xhr);
            }
        };
        xhr.onerror = () => {
            console.error(xhr.statusText);
        };
        xhr.send();
    }

    private RandomQuote = () => {
        if (this.quotes === undefined) {
            clearTimeout(this.timer);
            return;
        }
        const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        const text = quote.text[Math.floor(Math.random() * quote.text.length)];
        return {
            text,
            author: quote.author,
            source: quote.source
        };
    }
}

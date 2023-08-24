export default class Title {
    private titles: string[];
    private initalTitle: string;
    private restoreTitleID: number;
    public constructor(titles: string[]) {
        this.titles = titles;
        this.initalTitle = document.title;
        this.restoreTitleID = null;
    }

    public init() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        document.addEventListener("visibilitychange", event => {
            if (!document.hidden) {
                document.title = "．．．．．．";
                if (this.restoreTitleID !== null) {
                    clearTimeout(this.restoreTitleID);
                }
                this.restoreTitleID = window.setTimeout(() => {
                    document.title = this.initalTitle;
                    this.restoreTitleID = null;
                }, 500);
            } else {
                if (this.restoreTitleID !== null) {
                    clearTimeout(this.restoreTitleID);
                }
                document.title = `${this.titles[Math.floor(Math.random() * this.titles.length)]} ${this.initalTitle}`;
            }
        });
    }
}

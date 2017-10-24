namespace Lib {
    export class Title {
        private titles: string[];
        private initalTitle: string;
        private restoreTitleID: number;
        public constructor(titles: string[]) {
            this.titles = titles;
            this.initalTitle = document.title;
            this.restoreTitleID = 0;
        }

        public Init() {
            document.addEventListener("visibilitychange", event => {
                if (!document.hidden) {
                    document.title = "．．．．．．";
                    if (this.restoreTitleID !== 0) {
                        clearTimeout(this.restoreTitleID);
                    }
                    this.restoreTitleID = setTimeout(() => {
                        document.title = this.initalTitle;
                        this.restoreTitleID = 0;
                    }, 500);
                } else {
                    if (this.restoreTitleID !== 0) {
                        clearTimeout(this.restoreTitleID);
                    }
                    document.title = `${this.titles[Math.floor(Math.random() * this.titles.length)]} ${this.initalTitle}`;
                }
            });
        }
    }
}

class TitleSwitcher {
    private readonly titles: readonly string[];
    private readonly initialTitle: string;
    private restoreTimerId: number | null = null;

    public constructor(titles: readonly string[]) {
        this.titles = titles;
        this.initialTitle = document.title;
    }

    public init(): void {
        document.addEventListener("visibilitychange", () => {
            this.clearRestoreTimer();

            if (!document.hidden) {
                document.title = "．．．．．．";
                this.restoreTimerId = window.setTimeout(() => {
                    document.title = this.initialTitle;
                    this.restoreTimerId = null;
                }, 500);
                return;
            }

            const joke = this.titles[Math.floor(Math.random() * this.titles.length)];
            document.title = `${joke} ${this.initialTitle}`;
        });
    }

    private clearRestoreTimer(): void {
        if (this.restoreTimerId !== null) {
            clearTimeout(this.restoreTimerId);
            this.restoreTimerId = null;
        }
    }
}

export function init(titles: readonly string[]): void {
    new TitleSwitcher(titles).init();
}

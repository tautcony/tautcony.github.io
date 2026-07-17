/** Tab-title jokes when the document is hidden. */

export function init(titles: readonly string[]): void {
    if (titles.length === 0) {
        return;
    }

    const initialTitle = document.title;
    let restoreTimerId: number | null = null;

    const clearRestoreTimer = (): void => {
        if (restoreTimerId !== null) {
            clearTimeout(restoreTimerId);
            restoreTimerId = null;
        }
    };

    document.addEventListener("visibilitychange", () => {
        clearRestoreTimer();

        if (!document.hidden) {
            document.title = "．．．．．．";
            restoreTimerId = window.setTimeout(() => {
                document.title = initialTitle;
                restoreTimerId = null;
            }, 500);
            return;
        }

        const joke = titles[Math.floor(Math.random() * titles.length)];
        document.title = `${joke} ${initialTitle}`;
    });
}

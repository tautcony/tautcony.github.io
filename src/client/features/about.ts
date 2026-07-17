/**
 * About-page language switcher.
 * Default block is SSG-visible (`DEFAULT_KON_INDEX` / `data-default-lang-index`).
 * Client only re-paints when navigator.language prefers another block, or on select.
 */

export function init(): void {
    const select = document.getElementById("langSelect");
    const container = document.getElementById("kon-container");
    if (!(select instanceof HTMLSelectElement) || container === null) {
        return;
    }

    const blocks = [...container.querySelectorAll<HTMLElement>(":scope > .lang")];
    if (blocks.length === 0 || select.options.length === 0) {
        return;
    }

    const defaultIndex = Number.parseInt(
        container.dataset.defaultLangIndex ?? "0",
        10
    );

    const show = (index: number): void => {
        if (!blocks[index]) {
            return;
        }
        for (const [i, block] of blocks.entries()) {
            const on = i === index;
            block.classList.toggle("none", !on);
            block.hidden = !on;
        }
        select.selectedIndex = index;
    };

    select.addEventListener("change", () => {
        show(Number.parseInt(select.value, 10));
    });

    const preferred = blocks.findIndex(block => {
        const lang = block.getAttribute("lang") ?? "";
        return lang !== "" && navigator.language.toLowerCase().includes(lang.toLowerCase());
    });

    // Only override SSG default when the browser prefers a different language.
    if (preferred >= 0 && preferred !== defaultIndex) {
        show(preferred);
    }
}

/**
 * About-page language switcher.
 * Quote markup is SSG (`src/data/kon.ts` → `pages/about`).
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

    const show = (index: number): void => {
        if (!blocks[index]) {
            return;
        }
        for (const [i, block] of blocks.entries()) {
            block.classList.toggle("none", i !== index);
        }
    };

    select.addEventListener("change", () => {
        show(Number.parseInt(select.value, 10));
    });

    const preferred = blocks.findIndex(block => {
        const lang = block.getAttribute("lang") ?? "";
        return lang !== "" && navigator.language.includes(lang);
    });
    const index = preferred >= 0 ? preferred : 0;
    select.selectedIndex = index;
    show(index);
}

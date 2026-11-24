/**
 * Custom pink dot cursor following the pointer with smooth easing,
 * expanding and fading over links (`html.is-a-enter`) and hiding over forms/widgets (`html.is-mouse-enter`).
 */

const LERP_FACTOR = 0.28;
const STOP_THRESHOLD = 0.1;

export function init(): void {
    const pointer = document.querySelector<HTMLElement>(".js-cursor_pointer");
    if (!pointer) return;

    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
        return;
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let hasMoved = false;
    let rafId: number | null = null;

    const tick = (): void => {
        const dx = targetX - currentX;
        const dy = targetY - currentY;

        if (Math.abs(dx) < STOP_THRESHOLD && Math.abs(dy) < STOP_THRESHOLD) {
            currentX = targetX;
            currentY = targetY;
            pointer.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            rafId = null;
            return;
        }

        currentX += dx * LERP_FACTOR;
        currentY += dy * LERP_FACTOR;
        pointer.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", event => {
        targetX = event.clientX;
        targetY = event.clientY;

        if (!hasMoved) {
            hasMoved = true;
            currentX = targetX;
            currentY = targetY;
            pointer.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            pointer.classList.add("is-visible");
            return;
        }

        if (rafId === null) {
            rafId = window.requestAnimationFrame(tick);
        }
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
        pointer.classList.remove("is-visible");
        hasMoved = false;
    });

    const root = document.documentElement;
    let activeLink: Element | null = null;
    let activeFormArea: Element | null = null;

    document.addEventListener("mouseover", event => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const link = target.closest("a");
        if (link && link !== activeLink) {
            activeLink = link;
            root.classList.add("is-a-enter");
        }

        const formArea = target.closest("form, iframe, .twitter-widget");
        if (formArea && formArea !== activeFormArea) {
            activeFormArea = formArea;
            root.classList.add("is-mouse-enter");
        }
    });

    document.addEventListener("mouseout", event => {
        const related = event.relatedTarget;
        const relatedEl = related instanceof Element ? related : null;

        if (activeLink && (!relatedEl || !activeLink.contains(relatedEl))) {
            const nextLink = relatedEl?.closest("a") ?? null;
            activeLink = nextLink;
            if (!nextLink) {
                root.classList.remove("is-a-enter");
            }
        }

        if (activeFormArea && (!relatedEl || !activeFormArea.contains(relatedEl))) {
            const nextFormArea = relatedEl?.closest("form, iframe, .twitter-widget") ?? null;
            activeFormArea = nextFormArea;
            if (!nextFormArea) {
                root.classList.remove("is-mouse-enter");
            }
        }
    });
}

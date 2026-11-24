/**
 * Site chrome: gotop, sticky navbar, and stepped silk-thread article TOC.
 * Tables / catalog links are SSG; this module only binds interaction.
 */

const DESKTOP_MIN_WIDTH = 1170;
const HEADING_ACTIVATION_OFFSET = 110;
const THREAD_BASE_X = 8;
const THREAD_STEP_X = 14;
const THREAD_CORNER_RADIUS = 5;
const SVG_NS = "http://www.w3.org/2000/svg";

function bindGotop(): void {
    const gotop = document.getElementById("gotop");
    if (!(gotop instanceof HTMLButtonElement)) {
        return;
    }
    gotop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

function bindCatalogFold(catalog: HTMLElement): void {
    const toggle = catalog.querySelector<HTMLButtonElement>(".catalog-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", event => {
        event.preventDefault();
        const folded = catalog.classList.toggle("fold");
        toggle.setAttribute("aria-expanded", String(!folded));
    });
}

interface CatalogPoint {
    x: number;
    y: number;
    index: number;
}

function buildSteppedPath(points: CatalogPoint[]): string {
    if (points.length === 0) {
        return "";
    }

    const first = points[0];
    const startY = Math.max(first.y - 10, 2);
    const segments: string[] = [`M ${first.x} ${startY}`, `L ${first.x} ${first.y}`];

    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const dy = curr.y - prev.y;

        if (prev.x === curr.x) {
            segments.push(`L ${curr.x} ${curr.y}`);
        } else {
            const dx = curr.x - prev.x;
            const signX = dx > 0 ? 1 : -1;
            const r = Math.min(THREAD_CORNER_RADIUS, Math.floor(Math.abs(dx) / 2), Math.floor(Math.abs(dy) / 2));
            const midY = Math.round((prev.y + curr.y) / 2);
            const sweepFirst = signX > 0 ? 0 : 1;
            const sweepSecond = signX > 0 ? 1 : 0;

            segments.push(`L ${prev.x} ${midY - r}`);
            segments.push(`A ${r} ${r} 0 0 ${sweepFirst} ${prev.x + signX * r} ${midY}`);
            segments.push(`L ${curr.x - signX * r} ${midY}`);
            segments.push(`A ${r} ${r} 0 0 ${sweepSecond} ${curr.x} ${midY + r}`);
            segments.push(`L ${curr.x} ${curr.y}`);
        }
    }

    const last = points[points.length - 1];
    segments.push(`L ${last.x} ${last.y + 10}`);
    return segments.join(" ");
}

function initCatalogSpy(catalog: HTMLElement): (forceGeometry?: boolean) => void {
    const items = Array.from(catalog.querySelectorAll<HTMLLIElement>(".catalog-item"));
    const progressEl = catalog.querySelector<HTMLElement>(".catalog-progress");
    const svg = catalog.querySelector<SVGSVGElement>(".catalog-svg");
    const trackWrap = catalog.querySelector<HTMLElement>(".catalog-track-wrap");
    const article = document.querySelector<HTMLElement>(".post-content");
    const isCollapsible = catalog.classList.contains("is-collapsible");

    const targets = items
        .map(item => {
            const slug = item.dataset.slug;
            const heading = slug ? document.getElementById(slug) : null;
            return heading ? { item, heading, level: Number(item.dataset.level ?? 0) } : null;
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    // Persistent SVG layers (never wiped on scroll, eliminating flicker/twitch)
    let bgPath: SVGPathElement | null = null;
    let fgPath: SVGPathElement | null = null;
    const nodeCircles = new Map<number, SVGCircleElement>();

    if (svg) {
        bgPath = document.createElementNS(SVG_NS, "path");
        bgPath.setAttribute("class", "catalog-thread-bg");
        svg.appendChild(bgPath);

        fgPath = document.createElementNS(SVG_NS, "path");
        fgPath.setAttribute("class", "catalog-thread-fg");
        svg.appendChild(fgPath);

        targets.forEach((_entry, index) => {
            const circle = document.createElementNS(SVG_NS, "circle");
            circle.setAttribute("class", "catalog-node");
            circle.setAttribute("r", "2.5");
            svg.appendChild(circle);
            nodeCircles.set(index, circle);
        });
    }

    let lastActiveIndex = -1;
    let lastPercent = -1;
    let lastGeometryKey = "";
    let cachedTotalLen = 0;
    let cachedLengthByIndex = new Map<number, number>();
    let cachedVisibleIndices: number[] = [];
    let redrawTimer: number | undefined;

    const syncGeometry = (): void => {
        if (!svg || !trackWrap || !bgPath || !fgPath) return;

        const visiblePoints: CatalogPoint[] = [];
        targets.forEach((entry, index) => {
            const circle = nodeCircles.get(index);
            if (entry.item.offsetHeight > 0) {
                const level = Math.min(Math.max(entry.level, 0), 3);
                const x = Math.round(THREAD_BASE_X + level * THREAD_STEP_X);
                const y = Math.round(entry.item.offsetTop + entry.item.offsetHeight / 2);
                visiblePoints.push({ x, y, index });
                if (circle) {
                    circle.setAttribute("cx", String(x));
                    circle.setAttribute("cy", String(y));
                    circle.style.display = "";
                }
            } else if (circle) {
                circle.style.display = "none";
            }
        });

        if (visiblePoints.length === 0) return;

        const geometryKey = visiblePoints.map(p => `${p.x}:${Math.round(p.y)}`).join(",");
        if (geometryKey === lastGeometryKey) {
            return;
        }
        lastGeometryKey = geometryKey;

        const lastY = visiblePoints[visiblePoints.length - 1].y + 14;
        svg.setAttribute("viewBox", `0 0 ${trackWrap.clientWidth || 220} ${lastY}`);
        svg.style.height = `${lastY}px`;

        const d = buildSteppedPath(visiblePoints);
        bgPath.setAttribute("d", d);
        fgPath.setAttribute("d", d);

        cachedTotalLen = fgPath.getTotalLength();
        fgPath.style.strokeDasharray = `${cachedTotalLen}`;

        cachedVisibleIndices = visiblePoints.map(p => p.index);
        cachedLengthByIndex = new Map<number, number>();
        let lenCursor = 0;
        const step = 3;
        for (const pt of visiblePoints) {
            while (lenCursor < cachedTotalLen) {
                const sample = fgPath.getPointAtLength(lenCursor);
                if (sample.y >= pt.y - 0.5) {
                    break;
                }
                lenCursor += step;
            }
            cachedLengthByIndex.set(pt.index, Math.min(lenCursor, cachedTotalLen));
        }
    };

    const syncActiveVisuals = (activeIndex: number): void => {
        if (!fgPath || cachedVisibleIndices.length === 0) return;

        let activeVisibleIndex = activeIndex;
        if (!cachedLengthByIndex.has(activeVisibleIndex)) {
            activeVisibleIndex = cachedVisibleIndices.reduce(
                (acc, idx) => (idx <= activeIndex ? idx : acc),
                cachedVisibleIndices[0]
            );
        }

        const activeLen = cachedLengthByIndex.get(activeVisibleIndex) ?? 0;
        fgPath.style.strokeDashoffset = `${Math.max(cachedTotalLen - activeLen, 0)}`;

        nodeCircles.forEach((circle, idx) => {
            const isActive = idx === activeVisibleIndex;
            const isPassed = idx < activeVisibleIndex;
            circle.setAttribute("r", isActive ? "4.5" : "2.5");
            circle.classList.toggle("is-active", isActive);
            circle.classList.toggle("is-passed", isPassed);
        });
    };

    return (forceGeometry = false): void => {
        if (article) {
            const rect = article.getBoundingClientRect();
            const total = Math.max(article.offsetHeight - window.innerHeight * 0.6, 1);
            const passed = Math.min(Math.max(-rect.top + window.innerHeight * 0.2, 0), total);
            const percent = Math.round(Math.min(Math.max(passed / total, 0), 1) * 100);
            if (progressEl && percent !== lastPercent) {
                lastPercent = percent;
                progressEl.textContent = `${percent}%`;
            }
        }

        if (targets.length === 0) return;

        let activeIndex = 0;
        for (let i = 0; i < targets.length; i++) {
            const top = targets[i].heading.getBoundingClientRect().top;
            if (top <= HEADING_ACTIVATION_OFFSET) {
                activeIndex = i;
            } else {
                break;
            }
        }

        if (forceGeometry) {
            syncGeometry();
            syncActiveVisuals(activeIndex);
        }

        if (activeIndex !== lastActiveIndex) {
            lastActiveIndex = activeIndex;
            items.forEach(item => {
                item.classList.remove("active");
            });

            const activeEntry = targets[activeIndex];
            activeEntry.item.classList.add("active");

            if (isCollapsible) {
                items.forEach(item => {
                    item.classList.remove("is-expanded");
                });
                let sectionStart = activeIndex;
                while (sectionStart > 0 && targets[sectionStart].level > 0) {
                    sectionStart--;
                }
                for (let i = sectionStart; i < targets.length; i++) {
                    if (i > sectionStart && targets[i].level === 0) {
                        break;
                    }
                    targets[i].item.classList.add("is-expanded");
                }
            }

            syncGeometry();
            syncActiveVisuals(activeIndex);

            if (isCollapsible) {
                window.clearTimeout(redrawTimer);
                redrawTimer = window.setTimeout(() => {
                    syncGeometry();
                    syncActiveVisuals(activeIndex);
                }, 260);
            }

            if (trackWrap && activeEntry.item.offsetHeight > 0) {
                const itemTop = activeEntry.item.offsetTop;
                const itemBottom = itemTop + activeEntry.item.offsetHeight;
                const viewTop = trackWrap.scrollTop;
                const viewBottom = viewTop + trackWrap.clientHeight;
                if (itemTop < viewTop + 12) {
                    trackWrap.scrollTo({ top: Math.max(itemTop - 16, 0), behavior: "smooth" });
                } else if (itemBottom > viewBottom - 12) {
                    trackWrap.scrollTo({ top: itemBottom - trackWrap.clientHeight + 16, behavior: "smooth" });
                }
            }
        }
    };
}

function bindScrollChrome(): void {
    const navbar = document.querySelector(".navbar-custom");
    const banner = document.querySelector(".intro-header .container");
    if (!(navbar instanceof HTMLElement) || !(banner instanceof HTMLElement)) {
        return;
    }

    const catalogEl = document.querySelector(".side-catalog");
    const catalog = catalogEl instanceof HTMLElement ? catalogEl : null;
    let updateCatalogSpy: ((forceGeometry?: boolean) => void) | null = null;
    if (catalog) {
        bindCatalogFold(catalog);
        updateCatalogSpy = initCatalogSpy(catalog);
    }

    const gotop = document.getElementById("gotop");
    const headerHeight = navbar.clientHeight;
    const bannerHeight = banner.clientHeight;
    let lastScrollY = 0;
    let framePending = false;

    const paint = (scrollY: number, previousY: number, forceGeometry = false): void => {
        if (gotop instanceof HTMLButtonElement) {
            gotop.disabled = scrollY < 300;
        }
        if (window.innerWidth <= DESKTOP_MIN_WIDTH) {
            return;
        }

        if (scrollY - previousY <= 0) {
            if (scrollY > 0 && navbar.classList.contains("is-fixed")) {
                navbar.classList.add("is-visible");
            } else {
                navbar.classList.remove("is-visible", "is-fixed");
            }
        } else {
            navbar.classList.remove("is-visible");
            if (scrollY > headerHeight && !navbar.classList.contains("is-fixed")) {
                navbar.classList.add("is-fixed");
            }
        }

        if (catalog === null) {
            return;
        }
        catalog.classList.toggle("fixed", scrollY > bannerHeight);
        catalog.classList.toggle(
            "has-navbar",
            navbar.classList.contains("is-fixed") && navbar.classList.contains("is-visible")
        );
        updateCatalogSpy?.(forceGeometry);
    };

    const schedulePaint = (forceGeometry = false): void => {
        if (!framePending) {
            const previousY = lastScrollY;
            window.requestAnimationFrame(() => {
                paint(window.scrollY, previousY, forceGeometry);
                framePending = false;
            });
            framePending = true;
        }
        lastScrollY = window.scrollY;
    };

    paint(window.scrollY, window.scrollY, true);
    window.addEventListener("scroll", () => schedulePaint(false), { passive: true });
    window.addEventListener("resize", () => schedulePaint(true));
}

export function init(): void {
    bindGotop();
    bindScrollChrome();
}

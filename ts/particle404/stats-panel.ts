/**
 * Lightweight FPS / MS panel (TypeScript port of mrdoob/stats.js essentials).
 * Used when `?perf=true` is present.
 */

export class StatsPanel {
    readonly dom: HTMLDivElement;
    private mode: 0 | 1 = 0;
    private beginTime = performance.now();
    private prevTime = this.beginTime;
    private frames = 0;

    private readonly fpsPanel: GraphPanel;
    private readonly msPanel: GraphPanel;

    constructor() {
        this.dom = document.createElement("div");
        this.dom.style.cssText =
            "position:absolute;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";
        this.dom.addEventListener("click", event => {
            event.preventDefault();
            this.showPanel(++this.mode % this.dom.children.length);
        }, false);

        this.fpsPanel = this.addPanel(new GraphPanel("FPS", "#0ff", "#002"));
        this.msPanel = this.addPanel(new GraphPanel("MS", "#0f0", "#020"));
        this.showPanel(0);
    }

    private addPanel(panel: GraphPanel): GraphPanel {
        this.dom.appendChild(panel.dom);
        return panel;
    }

    private showPanel(id: number): void {
        for (let i = 0; i < this.dom.children.length; i++) {
            const child = this.dom.children[i] as HTMLElement;
            child.style.display = i === id ? "block" : "none";
        }
        this.mode = id as 0 | 1;
    }

    begin(): void {
        this.beginTime = performance.now();
    }

    end(): number {
        this.frames++;
        const time = performance.now();
        this.msPanel.update(time - this.beginTime, 200);

        if (time >= this.prevTime + 1000) {
            this.fpsPanel.update((this.frames * 1000) / (time - this.prevTime), 100);
            this.prevTime = time;
            this.frames = 0;
        }

        return time;
    }

    update(): void {
        this.beginTime = this.end();
    }
}

class GraphPanel {
    readonly dom: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private readonly name: string;
    private readonly fg: string;
    private readonly bg: string;
    private min = Infinity;
    private max = 0;
    private readonly width = 80;
    private readonly height = 48;
    private readonly textHeight = 12;
    private readonly graphX = 0;
    private readonly graphY = 14;
    private readonly graphWidth = 80;
    private readonly graphHeight = 30;

    constructor(name: string, fg: string, bg: string) {
        this.name = name;
        this.fg = fg;
        this.bg = bg;

        const canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        canvas.style.cssText = "width:80px;height:48px";

        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("2d context unavailable for StatsPanel");
        }
        this.dom = canvas;
        this.context = context;

        context.font = `bold ${this.textHeight}px Helvetica,Arial,sans-serif`;
        context.textBaseline = "top";
        context.fillStyle = bg;
        context.fillRect(0, 0, this.width, this.height);
        context.fillStyle = fg;
        context.fillText(name, 0, 0);
        context.fillRect(this.graphX, this.graphY, this.graphWidth, this.graphHeight);
        context.fillStyle = bg;
        context.globalAlpha = 0.9;
        context.fillRect(this.graphX, this.graphY, this.graphWidth, this.graphHeight);
    }

    update(value: number, maxValue: number): void {
        this.min = Math.min(this.min, value);
        this.max = Math.max(this.max, value);

        const ctx = this.context;
        ctx.fillStyle = this.bg;
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, this.width, this.graphY);
        ctx.fillStyle = this.fg;
        ctx.fillText(
            `${Math.round(value)} ${this.name} (${Math.round(this.min)}-${Math.round(this.max)})`,
            0,
            0
        );

        ctx.drawImage(
            this.dom,
            this.graphX + 1,
            this.graphY,
            this.graphWidth - 1,
            this.graphHeight,
            this.graphX,
            this.graphY,
            this.graphWidth - 1,
            this.graphHeight
        );

        ctx.fillRect(
            this.graphX + this.graphWidth - 1,
            this.graphY,
            1,
            this.graphHeight
        );

        ctx.fillStyle = this.bg;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(
            this.graphX + this.graphWidth - 1,
            this.graphY,
            1,
            Math.round((1 - value / maxValue) * this.graphHeight)
        );
    }
}

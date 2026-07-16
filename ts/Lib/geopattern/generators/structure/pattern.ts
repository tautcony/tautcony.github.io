import SVG from "../../svg";
import { Generator } from "../generator";
import { IPatternOption } from "../../types";

export default abstract class Pattern extends Generator<Pattern> {
    public color: string;
    protected opts: IPatternOption;
    protected hash: string;
    protected svg: SVG;

    public constructor(options: IPatternOption, svg?: SVG) {
        super();
        this.opts = { ...options };
        this.hash = this.opts.hash || "";
        this.color = this.opts.color || "";
        if (svg) {
            this.svg = svg;
        } else {
            this.svg = new SVG();
        }
    }

    protected static buildPlusShape(squareSize: number): [number, number, number, number][] {
        return [
            [squareSize, 0, squareSize, squareSize * 3],
            [0, squareSize, squareSize * 3, squareSize],
        ];
    }

    public toSvg() {
        return this.svg.toString();
    }

    public override toString() {
        return this.toSvg();
    }

    public toBase64() {
        const str = this.toSvg();
        // Encode as UTF-8 bytes then base64 (no deprecated unescape).
        const bytes = new TextEncoder().encode(str);
        let binary = "";
        for (const byte of bytes) {
            binary += String.fromCharCode(byte);
        }
        return btoa(binary);
    }

    public toDataUri() {
        return `data:image/svg+xml;base64,${this.toBase64()}`;
    }

    public toDataUrl() {
        return `url("${this.toDataUri()}")`;
    }
}

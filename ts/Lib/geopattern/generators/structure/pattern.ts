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
        this.hash = this.opts.hash;
        this.color = this.opts.color;
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

    public toString() {
        return this.toSvg();
    }

    public toBase64() {
        const str = this.toSvg();
        let b64;

        // Use window.btoa if in the browser; otherwise fallback to node buffers
        if (typeof window !== "undefined" && typeof window.btoa === "function") {
            b64 = window.btoa(str);
        } else {
            /* const byteArray: Uint8Array = new Uint8Array(str.length);
            for (let i = 0; i < str.length; ++i) {
                byteArray[i] = str.charCodeAt(i);
            }
            b64 = base64.fromByteArray(byteArray); */
            b64 = Buffer.from(str).toString("base64");
        }

        return b64;
    }

    public toDataUri() {
        return `data:image/svg+xml;base64,${this.toBase64()}`;
    }

    public toDataUrl() {
        return `url("${this.toDataUri()}")`;
    }
}

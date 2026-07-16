import XmlNode from "./xmlnode";

import {
    Length, Coordinate, Angle, Percentage, SvgAttributes,
} from "./types";

interface SvgTransform {
    matrix?: [number, number, number, number, number, number];
    translate?: [Length, Length?];
    scale?: [number, number?];
    rotate?: [Angle, number?, number?];
    skewX?: [Angle];
    skewY?: [Angle];
}

export default class Svg {
    private width: number;
    private height: number;
    private readonly svg: XmlNode;
    private readonly context: XmlNode[];

    public constructor() {
        this.width = 100;
        this.height = 100;
        this.svg = new XmlNode("svg");
        this.context = []; // Track nested nodes
        Svg.setAttributes(this.svg, {
            xmlns: "http://www.w3.org/2000/svg",
            width: this.width,
            height: this.height,
        });
    }

    public static setAttributes(el: XmlNode, attrs: SvgAttributes): void {
        for (const attr of Object.keys(attrs)) {
            el.setAttribute(attr, attrs[attr]);
        }
    }

    // This is a hack so groups work.
    public currentContext(): XmlNode {
        return this.context[this.context.length - 1] || this.svg;
    }

    // This is a hack so groups work.
    public end(): this {
        this.context.pop();
        return this;
    }

    public currentNode(): XmlNode {
        const context = this.currentContext();
        return context.lastChild || context;
    }

    public transform(transformations: SvgTransform): this {
        this.currentNode().setAttribute(
            "transform",
            (Object.keys(transformations) as (keyof SvgTransform)[]).map(transformation => {
                const args = (transformations[transformation] || []).join(",");
                return `${transformation}(${args})`;
            }).join(" ")
        );
        return this;
    }

    public setWidth(width: number): void {
        this.svg.setAttribute("width", Math.floor(width));
    }

    public setHeight(height: number): void {
        this.svg.setAttribute("height", Math.floor(height));
    }

    public toString(): string {
        return this.svg.toString();
    }

    public rect(
        x: Coordinate | [Coordinate, Coordinate, Length, Length][],
        y?: Coordinate | SvgAttributes,
        width?: Length,
        height?: Length,
        args?: SvgAttributes
    ): this {
        if (Array.isArray(x)) {
            for (const list of x) {
                this.rect(...list, y as SvgAttributes);
            }
            return this;
        }
        if (width === undefined || height === undefined) {
            return this;
        }
        const rect = this.newChild("rect");
        const value: Coordinate = y as Coordinate;
        Svg.setAttributes(rect, {
            x, y: value, width, height, ...args,
        });
        return this;
    }

    public circle(
        cx: Length | Percentage,
        cy: Length | Percentage,
        r: Length | Percentage,
        args: SvgAttributes
    ): this {
        const circle = new XmlNode("circle");
        this.currentContext().appendChild(circle);
        Svg.setAttributes(circle, {
            cx, cy, r, ...args,
        });
        return this;
    }

    public path(d: string, args: SvgAttributes): this {
        const path = this.newChild("path");
        Svg.setAttributes(path, { d, ...args });
        return this;
    }

    public polyline(str: string | string[], args?: SvgAttributes): this {
        if (Array.isArray(str)) {
            for (const s of str) {
                this.polyline(s, args);
            }
            return this;
        }
        const polyline = this.newChild("polyline");
        Svg.setAttributes(polyline, { points: str, ...args });
        return this;
    }

    // group and context are hacks
    public group(args: SvgAttributes): this {
        const group = this.newChild("g");
        this.context.push(group);
        Svg.setAttributes(group, { ...args });
        return this;
    }

    private newChild(type: string): XmlNode {
        const child = new XmlNode(type);
        this.currentContext().appendChild(child);
        return child;
    }
}

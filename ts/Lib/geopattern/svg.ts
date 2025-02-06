import XMLNode from "./xmlnode";

import {
    Length, Coordinate, Angle, Percentage, Idict,
} from "./types";

interface Itransformation {
    matrix?: [number, number, number, number, number, number];
    translate?: [Length, Length?];
    scale?: [number, number?];
    rotate?: [Angle, number?, number?];
    skewX?: [Angle];
    skewY?: [Angle];
}

export default class SVG {
    private width: number;
    private height: number;
    private svg: XMLNode;
    private context: XMLNode[];
    public constructor() {
        this.width = 100;
        this.height = 100;
        this.svg = new XMLNode("svg");
        this.context = []; // Track nested nodes
        SVG.setAttributes(this.svg, {
            xmlns: "http://www.w3.org/2000/svg",
            width: this.width,
            height: this.height,
        });
    }

    public static setAttributes(el: XMLNode, attrs: Idict) {
        Object.keys(attrs).forEach(attr => {
            el.setAttribute(attr, attrs[attr]);
        });
    }

    // This is a hack so groups work.
    public currentContext() {
        return this.context[this.context.length - 1] || this.svg;
    }

    // This is a hack so groups work.
    public end() {
        this.context.pop();
        return this;
    }

    public currentNode() {
        const context = this.currentContext();
        return context.lastChild || context;
    }

    public transform(transformations: Itransformation) {
        this.currentNode().setAttribute(
            "transform",
            (Object.keys(transformations) as (keyof Itransformation)[]).map(transformation => {
                const args = (transformations[transformation] || []).join(",");
                return `${transformation}(${args})`;
            }).join(" ")
        );
        return this;
    }

    public setWidth(width: number) {
        this.svg.setAttribute("width", Math.floor(width));
    }

    public setHeight(height: number) {
        this.svg.setAttribute("height", Math.floor(height));
    }

    public toString() {
        return this.svg.toString();
    }

    public rect(x: Coordinate | [Coordinate, Coordinate, Length, Length][], y?: Coordinate | Idict, width?: Length, height?: Length, args?: Idict) {
        // Accept array first argument
        if (Array.isArray(x)) {
            x.forEach(list => {
                this.rect(...list, y as Idict);
            });
            return this;
        }
        if (width === undefined || height === undefined) {
            return this;
        }
        const rect = this.newChild("rect");
        const value: Coordinate = y as Coordinate;
        SVG.setAttributes(rect, {
            x, y: value, width, height, ...args,
        });


        return this;
    }

    public circle(cx: Length | Percentage, cy: Length | Percentage, r: Length | Percentage, args: Idict) {
        const circle = new XMLNode("circle");
        this.currentContext().appendChild(circle);
        SVG.setAttributes(circle, {
            cx, cy, r, ...args,
        });

        return this;
    }

    public path(d: string, args: Idict) {
        const path = this.newChild("path");
        SVG.setAttributes(path, { d, ...args });
        return this;
    }

    public polyline(str: string | string[], args?: Idict) {
        // Accept array first argument
        if (Array.isArray(str)) {
            str.forEach(s => {
                this.polyline(s, args);
            });
            return this;
        }
        const polyline = this.newChild("polyline");
        SVG.setAttributes(polyline, { points: str, ...args });

        return this;
    }

    // group and context are hacks
    public group(args: Idict) {
        const group = this.newChild("g");
        this.context.push(group);
        SVG.setAttributes(group, { ...args });
        return this;
    }

    private newChild(type: string) {
        const child = new XMLNode(type);
        this.currentContext().appendChild(child);
        return child;
    }
}

import Pattern from "./pattern";
import {
    hexVal, fillOpacity, fillColor, map,
} from "../util";

export default class NestedSquares extends Pattern {
    public generate() {
        const blockSize = map(hexVal(this.hash, 0), 0, 15, 4, 12);
        const squareSize = blockSize * 7;

        this.svg.setWidth((squareSize + blockSize) * 6 + blockSize * 6);
        this.svg.setHeight((squareSize + blockSize) * 6 + blockSize * 6);

        let i = 0;
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                let val = hexVal(this.hash, i);
                let opacity = fillOpacity(val);
                let fill = fillColor(val);

                let styles = {
                    fill: "none",
                    stroke: fill,
                    opacity,
                    "stroke-width": `${blockSize}px`,
                };

                this.svg.rect(
                    x * squareSize + x * blockSize * 2 + blockSize / 2,
                    y * squareSize + y * blockSize * 2 + blockSize / 2,
                    squareSize,

                    squareSize,

                    styles
                );

                val = hexVal(this.hash, 39 - i);
                opacity = fillOpacity(val);
                fill = fillColor(val);

                styles = {
                    fill: "none",
                    stroke: fill,
                    opacity,
                    "stroke-width": `${blockSize}px`,
                };

                this.svg.rect(
                    x * squareSize + x * blockSize * 2 + blockSize / 2 + blockSize * 2,
                    y * squareSize + y * blockSize * 2 + blockSize / 2 + blockSize * 2,
                    blockSize * 3,

                    blockSize * 3,

                    styles
                );

                i += 1;
            }
        }
        return this;
    }
}

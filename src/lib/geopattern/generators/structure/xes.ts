import Pattern from "./pattern";
import {
    hexVal, fillOpacity, fillColor, map,
} from "../util";

export default class Xes extends Pattern {
    public generate() {
        const squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 25);
        const xShape = Xes.buildPlusShape(squareSize);
        const xSize = squareSize * 3 * 0.943;

        this.svg.setWidth(xSize * 3);
        this.svg.setHeight(xSize * 3);

        let i = 0;
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const val = hexVal(this.hash, i);
                const opacity = fillOpacity(val);
                let dy = x % 2 === 0 ? y * xSize - xSize * 0.5 : y * xSize - xSize * 0.5 + xSize / 4;
                const fill = fillColor(val);

                const styles = {
                    fill,
                    opacity,
                };

                this.svg.group(styles).transform({
                    translate: [
                        (x * xSize) / 2 - xSize / 2,
                        dy - (y * xSize) / 2,
                    ],
                    rotate: [
                        45,
                        xSize / 2,
                        xSize / 2,
                    ],
                }).rect(xShape).end();

                // Add an extra column on the right for tiling.
                if (x === 0) {
                    this.svg.group(styles).transform({
                        translate: [
                            (6 * xSize) / 2 - xSize / 2,
                            dy - (y * xSize) / 2,
                        ],
                        rotate: [
                            45,
                            xSize / 2,
                            xSize / 2,
                        ],
                    }).rect(xShape).end();
                }

                // // Add an extra row on the bottom that matches the first row, for tiling.
                if (y === 0) {
                    dy = x % 2 === 0 ? 6 * xSize - xSize / 2 : 6 * xSize - xSize / 2 + xSize / 4;
                    this.svg.group(styles).transform({
                        translate: [
                            (x * xSize) / 2 - xSize / 2,
                            dy - (6 * xSize) / 2,
                        ],
                        rotate: [
                            45,
                            xSize / 2,
                            xSize / 2,
                        ],
                    }).rect(xShape).end();
                }

                // These can hang off the bottom, so put a row at the top for tiling.
                if (y === 5) {
                    this.svg.group(styles).transform({
                        translate: [
                            (x * xSize) / 2 - xSize / 2,
                            dy - (11 * xSize) / 2,
                        ],
                        rotate: [
                            45,
                            xSize / 2,
                            xSize / 2,
                        ],
                    }).rect(xShape).end();
                }

                // Add an extra one at top-right and bottom-right, for tiling
                if (x === 0 && y === 0) {
                    this.svg.group(styles).transform({
                        translate: [
                            (6 * xSize) / 2 - xSize / 2,
                            dy - (6 * xSize) / 2,
                        ],
                        rotate: [
                            45,
                            xSize / 2,
                            xSize / 2,
                        ],
                    }).rect(xShape).end();
                }
                i++;
            }
        }
        return this;
    }
}

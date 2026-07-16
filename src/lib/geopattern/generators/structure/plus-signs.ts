import Pattern from "./pattern";
import {
    hexVal, fillOpacity, fillColor, map,
} from "../util";
import Preset from "../preset";

export default class PlusSigns extends Pattern {
    public generate() {
        const squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 25);
        const plusSize = squareSize * 3;
        const plusShape = PlusSigns.buildPlusShape(squareSize);

        this.svg.setWidth(squareSize * 12);
        this.svg.setHeight(squareSize * 12);

        let i = 0;
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const val = hexVal(this.hash, i);
                const opacity = fillOpacity(val);
                const fill = fillColor(val);
                const dx = (y % 2 === 0) ? 0 : 1;

                const styles = {
                    fill,
                    stroke: Preset.StrokeColor,
                    "stroke-opacity": Preset.StrokeOpacity,
                    "fill-opacity": opacity,
                };

                this.svg.group(styles).transform({
                    translate: [
                        x * plusSize - x * squareSize + dx * squareSize - squareSize,
                        y * plusSize - y * squareSize - plusSize / 2,
                    ],
                }).rect(plusShape).end();

                // Add an extra column on the right for tiling.
                if (x === 0) {
                    this.svg.group(styles).transform({
                        translate: [
                            4 * plusSize - x * squareSize + dx * squareSize - squareSize,
                            y * plusSize - y * squareSize - plusSize / 2,
                        ],
                    }).rect(plusShape).end();
                }

                // Add an extra row on the bottom that matches the first row, for tiling
                if (y === 0) {
                    this.svg.group(styles).transform({
                        translate: [
                            x * plusSize - x * squareSize + dx * squareSize - squareSize,
                            4 * plusSize - y * squareSize - plusSize / 2,
                        ],
                    }).rect(plusShape).end();
                }

                // Add an extra one at top-right and bottom-right, for tiling
                if (x === 0 && y === 0) {
                    this.svg.group(styles).transform({
                        translate: [
                            4 * plusSize - x * squareSize + dx * squareSize - squareSize,
                            4 * plusSize - y * squareSize - plusSize / 2,
                        ],
                    }).rect(plusShape).end();
                }

                i++;
            }
        }
        return this;
    }
}

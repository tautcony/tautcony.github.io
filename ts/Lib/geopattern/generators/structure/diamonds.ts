import Pattern from "./pattern";
import {
    hexVal, fillOpacity, fillColor, map,
} from "../util";
import Preset from "../preset";

export default class Diamonds extends Pattern {
    private static buildDiamondShape(width: number, height: number) {
        return [
            width / 2, 0,
            width, height / 2,
            width / 2, height,
            0, height / 2,
        ].join(",");
    }

    public generate() {
        const diamondWidth = map(hexVal(this.hash, 0), 0, 15, 10, 50);
        const diamondHeight = map(hexVal(this.hash, 1), 0, 15, 10, 50);
        const diamond = Diamonds.buildDiamondShape(diamondWidth, diamondHeight);

        this.svg.setWidth(diamondWidth * 6);
        this.svg.setHeight(diamondHeight * 3);

        let i = 0;
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const val = hexVal(this.hash, i);
                const opacity = fillOpacity(val);
                const fill = fillColor(val);

                const styles = {
                    fill,
                    "fill-opacity": opacity,
                    stroke: Preset.StrokeColor,
                    "stroke-opacity": Preset.StrokeOpacity,
                };

                const dx = (y % 2 === 0) ? 0 : diamondWidth / 2;

                this.svg.polyline(diamond, styles).transform({
                    translate: [
                        x * diamondWidth - diamondWidth / 2 + dx,
                        (diamondHeight / 2) * y - diamondHeight / 2,
                    ],
                });

                // Add an extra one at top-right, for tiling.
                if (x === 0) {
                    this.svg.polyline(diamond, styles).transform({
                        translate: [
                            6 * diamondWidth - diamondWidth / 2 + dx,
                            (diamondHeight / 2) * y - diamondHeight / 2,
                        ],
                    });
                }

                // Add an extra row at the end that matches the first row, for tiling.
                if (y === 0) {
                    this.svg.polyline(diamond, styles).transform({
                        translate: [
                            x * diamondWidth - diamondWidth / 2 + dx,
                            (diamondHeight / 2) * 6 - diamondHeight / 2,
                        ],
                    });
                }

                // Add an extra one at bottom-right, for tiling.
                if (x === 0 && y === 0) {
                    this.svg.polyline(diamond, styles).transform({
                        translate: [
                            6 * diamondWidth - diamondWidth / 2 + dx,
                            (diamondHeight / 2) * 6 - diamondHeight / 2,
                        ],
                    });
                }

                i += 1;
            }
        }
        return this;
    }
}

import Pattern from "./pattern";
import {
    hexVal, fillOpacity, fillColor, map,
} from "../util";

export default class OverlappingCircles extends Pattern {
    public generate() {
        const scale = hexVal(this.hash, 0);
        const diameter = map(scale, 0, 15, 25, 200);
        const radius = diameter / 2;

        this.svg.setWidth(radius * 6);
        this.svg.setHeight(radius * 6);

        let i = 0;
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const val = hexVal(this.hash, i);
                const opacity = fillOpacity(val);
                const fill = fillColor(val);

                const styles = {
                    fill,
                    opacity,
                };

                this.svg.circle(x * radius, y * radius, radius, styles);

                // Add an extra one at top-right, for tiling.
                if (x === 0) {
                    this.svg.circle(6 * radius, y * radius, radius, styles);
                }

                // // Add an extra row at the end that matches the first row, for tiling.
                if (y === 0) {
                    this.svg.circle(x * radius, 6 * radius, radius, styles);
                }

                // // Add an extra one at bottom-right, for tiling.
                if (x === 0 && y === 0) {
                    this.svg.circle(6 * radius, 6 * radius, radius, styles);
                }

                i++;
            }
        }
        return this;
    }
}

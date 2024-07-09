import Pattern from "./pattern";
import {
    hexVal, fillOpacity, fillColor, map,
} from "../util";

export default class OverlappingRings extends Pattern {
    public generate() {
        const scale = hexVal(this.hash, 0);
        const ringSize = map(scale, 0, 15, 10, 60);
        const strokeWidth = ringSize / 4;

        this.svg.setWidth(ringSize * 6);
        this.svg.setHeight(ringSize * 6);

        let i = 0;
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const val = hexVal(this.hash, i);
                const opacity = fillOpacity(val);
                const fill = fillColor(val);

                const styles = {
                    fill: "none",
                    stroke: fill,
                    opacity,
                    "stroke-width": `${strokeWidth}px`,
                };

                this.svg.circle(x * ringSize, y * ringSize, ringSize - strokeWidth / 2, styles);

                // Add an extra one at top-right, for tiling.
                if (x === 0) {
                    this.svg.circle(6 * ringSize, y * ringSize, ringSize - strokeWidth / 2, styles);
                }

                if (y === 0) {
                    this.svg.circle(x * ringSize, 6 * ringSize, ringSize - strokeWidth / 2, styles);
                }

                if (x === 0 && y === 0) {
                    this.svg.circle(6 * ringSize, 6 * ringSize, ringSize - strokeWidth / 2, styles);
                }

                i += 1;
            }
        }
        return this;
    }
}

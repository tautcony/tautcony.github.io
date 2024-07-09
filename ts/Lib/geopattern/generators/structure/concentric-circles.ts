import Pattern from "./pattern";
import {
    hexVal, fillOpacity, fillColor, map,
} from "../util";

export default class ConcentricCircles extends Pattern {
    public generate() {
        const scale = hexVal(this.hash, 0);
        const ringSize = map(scale, 0, 15, 10, 60);
        const strokeWidth = ringSize / 5;

        this.svg.setWidth((ringSize + strokeWidth) * 6);
        this.svg.setHeight((ringSize + strokeWidth) * 6);

        let i = 0;
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                let val = hexVal(this.hash, i);
                let opacity = fillOpacity(val);
                let fill = fillColor(val);

                this.svg.circle(
                    x * ringSize + x * strokeWidth + (ringSize + strokeWidth) / 2,
                    y * ringSize + y * strokeWidth + (ringSize + strokeWidth) / 2,
                    ringSize / 2,
                    {
                        fill: "none",
                        stroke: fill,
                        opacity,
                        "stroke-width": `${strokeWidth}px`,
                    }
                );

                val = hexVal(this.hash, 39 - i);
                opacity = fillOpacity(val);
                fill = fillColor(val);

                this.svg.circle(
                    x * ringSize + x * strokeWidth + (ringSize + strokeWidth) / 2,
                    y * ringSize + y * strokeWidth + (ringSize + strokeWidth) / 2,
                    ringSize / 4,
                    {
                        fill,
                        "fill-opacity": opacity,
                    }
                );

                i += 1;
            }
        }
        return this;
    }
}

export type Length = number | string;
export type Coordinate = number | string;
export type Angle = number | string;
export type Percentage = string;

export type ContentType = Length | Coordinate | Angle | Percentage;

export const STRUCTURE_NAMES = [
    "octogons",
    "overlappingCircles",
    "plusSigns",
    "xes",
    "sineWaves",
    "hexagons",
    "overlappingRings",
    "plaid",
    "triangles",
    "squares",
    "concentricCircles",
    "diamonds",
    "tessellation",
    "nestedSquares",
    "mosaicSquares",
    "chevrons",
] as const;

export type StructureName = typeof STRUCTURE_NAMES[number];

/** SVG attribute map used by the geopattern SVG builder. */
export type SvgAttributes = Record<string, ContentType>;

export interface PatternOptions {
    hash?: string;
    color?: string;
    baseColor?: string;
    generator?: StructureName;
}

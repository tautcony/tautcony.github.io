export type Length = number | string;
export type Coordinate = number | string;
export type Angle = number | string;
export type Percentage = string;

export type ContentType = Length | Coordinate | Angle | Percentage;

export const AvailableStructure = ["octogons", "overlappingCircles", "plusSigns", "xes", "sineWaves", "hexagons", "overlappingRings", "plaid", "triangles", "squares", "concentricCircles", "diamonds", "tessellation", "nestedSquares", "mosaicSquares", "chevrons"] as const;

export type AvailableStructureType = typeof AvailableStructure[number];

export type Idict = Record<string, ContentType>;

export interface IPatternOption {
    hash?: string;
    color?: string;
    baseColor?: string;
    generator?: AvailableStructureType;
}

/** Shared types for the modern particle 404 GUI. */

export interface GuiSettings {
    seedColor: number[];
    sideColor: number[];
    message: string;
    background: number[];
    pointColor: number[];
    ambientColor: number[];
    explode(): void;
}

/**
 * Optional dat.GUI panel — only mounted when `?gui=true`.
 */
import { GUI } from "dat.gui";

import type { GuiSettings } from "./types";

export interface GuiHandlers {
    onMessageChange: (message: string) => void;
    onPointColorChange: () => void;
    onAmbientColorChange: () => void;
    onBackgroundChange: (rgb: number[]) => void;
}

/**
 * Build the tweak panel. Call only when config.showGui is true.
 */
export function mountGui(settings: GuiSettings, handlers: GuiHandlers): GUI {
    const gui = new GUI({ name: "404 particles" });

    gui.addColor(settings, "sideColor").name("sideColor");
    gui.addColor(settings, "seedColor").name("seedColor");

    gui.add(settings, "message").onChange((message: string) => {
        if (message.length > 0) {
            handlers.onMessageChange(message);
        }
    });

    gui.addColor(settings, "pointColor").onChange(handlers.onPointColorChange);
    gui.addColor(settings, "ambientColor").onChange(handlers.onAmbientColorChange);
    gui.addColor(settings, "background").onChange((rgb: number[]) => {
        handlers.onBackgroundChange(rgb);
    });
    gui.add(settings, "explode").name("explode");

    return gui;
}

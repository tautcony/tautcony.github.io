/**
 * Non-post page front-matter manifest (from Jekyll page files).
 * IntroHeader must not silently fall back when these are missing.
 */
import { site } from "./site";

export const pageMeta = {
    home: {
        title: undefined as string | undefined,
        description: "ようこそ　僕のページへ",
        headerImg: site.headerImg,
        path: "/",
    },
    about: {
        title: "About",
        description: "Hey, this is TautCony.",
        headerImg: "img/about-bg.jpg",
        path: "/about/",
        id: "about",
    },
    archive: {
        title: "Archive",
        description: "上手くなりたい",
        headerImg: "img/tag-bg.jpg",
        path: "/archive/",
        shortHeader: true,
    },
} as const;

export type PageKey = keyof typeof pageMeta;

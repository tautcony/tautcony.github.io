/**
 * Non-post page meta for IntroHeader / 404 (title, description, header image).
 * Missing fields must not be silently invented in layout components.
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
    notFound: {
        title: undefined as string | undefined,
        description: "何を探すんの？ここは何もいないよ",
        headerImg: "img/404-bg.jpg",
        path: "/404.html",
    },
} as const;

export type PageKey = keyof typeof pageMeta;

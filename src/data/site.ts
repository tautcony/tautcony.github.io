/**
 * Site-wide configuration for Astro SSG.
 *
 * - `url` / `baseurl` mirror `astro.config` `site` / `base` (single content source: this file).
 * - `rss: false` hides the footer RSS icon; `/feed.xml` is still generated for feed readers.
 */
export const site = {
    title: "踢锡部落格",
    seoTitle: "踢锡部落格 | TC Blog | TC的博客",
    description: "试着记录点东西 | 都是些有的没的",
    keyword: "TautCony, @tautcony, TC的博客, TC Blog, 博客, 个人网站, 踢锡部落格",
    url: "https://tautcony.xyz",
    /** Path prefix; empty string = site at domain root (same as Astro `base: "/"`). */
    baseurl: "",
    headerImg: "img/home-bg.jpg",
    email: "tautcony@gmail.com",
    author: {
        twitter: "tautcony",
        github: "tautcony",
    },
    /**
     * When true, footer SNS shows an RSS icon linking to `/feed.xml`.
     * Feed route is always built; keep false to match current chrome (no extra icon).
     */
    rss: false,
    socialAccount: [
        {
            title: "github",
            href: "https://github.com/tautcony",
            content: "",
        },
        {
            title: "twitter",
            href: "https://twitter.com/tautcony",
            content: "",
        },
        {
            title: "steam",
            href: "https://steamcommunity.com/id/tautcony",
            content: "",
        },
    ],
    sidebar: true,
    sidebarAboutDescription: "专业混吃等死",
    sidebarAvatar: "/img/avatar-tautcony.jpg",
    featuredTags: true,
    featuredConditionSize: 2,
    friends: [
        { title: "VCB-Studio", href: "https://vcb-s.com/" },
        { title: "Memo von EFS", href: "https://amefs.net/" },
        { title: "小马哥", href: "https://vigoss18.github.io/" },
        { title: "神北小毬", href: "https://npchk.info/" },
        { title: "钱叔叔", href: "https://blog.gloriousdays.pw/" },
        { title: "linkthis", href: "https://linkthis.me/" },
        { title: "はかせ", href: "https://bodayw.blogspot.com/" },
        { title: "Breakertt Blog", href: "https://breakertt.moe/" },
        { title: "spinmry's 实验室", href: "https://blog.spinmry.moe/" },
        { title: "沈聚聚", href: "https://canjuly.github.io" },
    ],
    excerptSeparator: "<!--more-->",
    googleSiteVerification: "k_t-1fgBwmMc3UsE3yUU5zGQbRN2a0cl-HljKO2odqY",
    gaMeasurementId: "G-D7DJK0DHRY",
    anchorjs: true,
    particle404: true,
    utteranc: {
        repo: "tautcony/tautcony.github.io",
        issueTerm: "pathname",
        theme: "github-light",
    },
    katex: true,
    paginate: 10,
    lang: "en",
    /**
     * Primary nav links after Home (order is UI contract).
     * Includes Tool so Nav does not hardcode a separate item.
     */
    navPages: [
        { title: "About", href: "/about/" },
        { title: "Archive", href: "/archive/" },
        { title: "Tool", href: "/tcupdate/" },
    ],
} as const;

export type Site = typeof site;

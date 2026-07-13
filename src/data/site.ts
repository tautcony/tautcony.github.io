/**
 * Site constants migrated from `_config.yml` (see mig/03-mapping-tables.md §4).
 * Keep keys in sync; dual-stack period treats this as the Astro source of truth.
 */
export const site = {
    title: "踢锡部落格",
    seoTitle: "踢锡部落格 | TC Blog | TC的博客",
    description: "试着记录点东西 | 都是些有的没的",
    keyword: "TautCony, @tautcony, TC的博客, TC Blog, 博客, 个人网站, 踢锡部落格",
    url: "https://tautcony.xyz",
    baseurl: "",
    headerImg: "img/home-bg.jpg",
    email: "tautcony@gmail.com",
    author: {
        twitter: "tautcony",
        github: "tautcony",
    },
    rss: false,
    socialAccount: [
        {
            title: "github",
            href: "https://github.com/tautcony",
            icon: "fa-github",
            content: "",
        },
        {
            title: "twitter",
            href: "https://twitter.com/tautcony",
            icon: "fa-twitter",
            content: "",
        },
        {
            title: "steam",
            href: "https://steamcommunity.com/id/tautcony",
            icon: "fa-steam",
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
    baTrackId: "" as string | undefined,
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
     * Jekyll `site.pages` with `title` (about, archive). Tool is hardcoded in Nav.
     * Order matches historical nav: About then Archive.
     */
    navPages: [
        { title: "About", href: "/about/" },
        { title: "Archive", href: "/archive/" },
    ],
} as const;

export type Site = typeof site;

/** Mapping report keys for audit (M0 site.ts completeness). */
export const siteConfigMapping = {
    title: "title",
    SEOTitle: "seoTitle",
    description: "description",
    keyword: "keyword",
    url: "url",
    baseurl: "baseurl",
    "header-img": "headerImg",
    email: "email",
    "author.twitter": "author.twitter",
    "author.github": "author.github",
    RSS: "rss",
    SocialAccount: "socialAccount",
    sidebar: "sidebar",
    "sidebar-about-description": "sidebarAboutDescription",
    "sidebar-avatar": "sidebarAvatar",
    "featured-tags": "featuredTags",
    "featured-condition-size": "featuredConditionSize",
    friends: "friends",
    excerpt_separator: "excerptSeparator",
    "google-site-verification": "googleSiteVerification",
    ga_measurement_id: "gaMeasurementId",
    anchorjs: "anchorjs",
    particle404: "particle404",
    "utteranc.repo": "utteranc.repo",
    "utteranc.issue-term": "utteranc.issueTerm",
    "utteranc.theme": "utteranc.theme",
    katex: "katex",
    paginate: "paginate",
} as const;

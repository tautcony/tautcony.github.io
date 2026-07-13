# 02 — 目标 Astro 架构

## 1. 技术选型

| 层 | 选型 | 理由 |
|----|------|------|
| SSG | **Astro `7.0.7`** | 静态优先、Vite 原生、Pages 友好；升级单独 PR |
| 内容 | **Content Layer Collections**（`src/content.config.ts` + `glob()`） | front matter schema、类型安全；显式纳入 `.md`/`.markdown` |
| 样式 | **现有 Sass**（`sass` 包） | 冻结视觉；Astro 直接 `import` scss |
| 脚本 | 现有 `ts/**` + 少量 `<script>` | 少改行为 |
| Vue | 仅 tcupdate：`@astrojs/vue@7.0.1` + `vue@^3.5.24` | 决策 D3；只在客户端挂载 |
| 站点地图 | 自定义 `pages/sitemap.xml.ts` endpoint | 首迁固定 `/sitemap.xml`，不生成 sitemap index |
| RSS | 自写 `pages/feed.xml.ts` 或社区 RSS 集成 | 对齐现 `feed.xml` 字段 |
| 部署 | 静态 `outDir` → GitHub Pages | 与现 Actions 一致 |
| Markdown | `remark-gfm`、`rehype-slug`、受控 `rehype-raw` | 版本写入 lockfile，raw HTML 只兼容历史白名单 |
| 高亮 | 见 [05-content-and-markdown.md](./05-content-and-markdown.md) | **class 适配优先于「最新高亮」** |

**不引入（首迁）**：MDX 全站、Tailwind、React、i18n 框架、SSR adapter。

---

## 2. 目标目录树（迁移完成后）

```text
/
├── public/                      # 原样拷贝、不经打包的静态资源
│   ├── CNAME
│   ├── favicon.ico
│   ├── img/
│   ├── attach/
│   ├── fonts/
│   ├── css/                     # fonts.css, iosevka.css
│   ├── json/                    # quote.json
│   ├── arknights/
│   ├── contents/
│   └── robots.txt               # 保留现站入口，Sitemap 指向 https://tautcony.xyz/sitemap.xml
│
├── src/
│   ├── content.config.ts        # Content Layer collection + glob loader
│   ├── content/
│   │   └── posts/               # 双栈期由 _posts 同步，保留原扩展名
│   │       └── *.{md,markdown}
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro     # ← default.html
│   │   ├── PostLayout.astro     # ← post.html
│   │   ├── PageLayout.astro     # ← page.html
│   │   └── KeynoteLayout.astro  # ← keynote.html（若仍需要）
│   │
│   ├── components/
│   │   ├── Head.astro
│   │   ├── Meta.astro
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   ├── IntroHeader.astro
│   │   ├── PostContainer.astro
│   │   ├── Sidebar.astro
│   │   ├── FeaturedTags.astro
│   │   ├── Comment.astro
│   │   ├── Sns.astro
│   │   ├── Katex.astro
│   │   ├── AnchorJS.astro
│   │   ├── PdfEmbed.astro
│   │   └── Pagination.astro
│   │
│   ├── pages/
│   │   ├── index.astro          # 首页第 1 页
│   │   ├── [page]/index.astro   # 仅生成 page2、page3…
│   │   ├── about/index.astro
│   │   ├── archive/index.astro
│   │   ├── tcupdate.astro       # preserve format → tcupdate.html
│   │   ├── 404.astro
│   │   ├── feed.xml.ts          # RSS
│   │   ├── sitemap.xml.ts       # 固定旧路径
│   │   └── [year]/[month]/[day]/[slug]/index.astro
│   │
│   ├── styles/                  # 从根 styles/ 移入或 re-export
│   │   └── (现有 scss 树)
│   │
│   ├── scripts/                 # 原 ts/ 客户端逻辑
│   │   ├── entries/
│   │   ├── pages/
│   │   ├── Lib/
│   │   └── particle404/
│   │
│   ├── data/
│   │   └── site.ts              # 自 _config.yml 抽出的站点常量
│   │
│   └── env.d.ts
│
├── scripts/
│   ├── generate-lastmod.mjs     # 输出/验证 src/data/lastmod.json
│   ├── sync-public.mjs           # 双栈期根资源 → public 同步
│   ├── migrate-posts.mjs        # front matter、Liquid、legacyPath 迁移
│   ├── compare-routes.mjs       # 必选：HTML/XML URL diff
│   └── compare-assets.mjs       # 必选：静态资源 URL+size/hash diff
│
├── mig/                         # 本计划（可保留）
├── docs/
├── astro.config.mjs
├── package.json                 # 去 Ruby scripts
├── tsconfig.json
└── .github/workflows/build.yml
```

> 迁移期必须把 `styles/`、`ts/` 留在仓库根，由 Astro alias 引用；双栈结束后再考虑物理搬入 `src/`。这可避免 SCSS 相对资源 URL 和旧 Jekyll 构建同时失效。

---

## 3. 路由设计（对齐 Jekyll pretty）

| 类型 | Astro 实现 | 最终 URL |
|------|------------|----------|
| 文章 | `src/pages/[year]/[month]/[day]/[slug]/index.astro` + `getStaticPaths` | `/2016/03/22/hello-github-io/` |
| 首页 | `src/pages/index.astro` | `/` |
| 分页 | `src/pages/[page]/index.astro`，仅返回 `page2`、`page3`… | `/page2/`（**不是** `/page/2/`） |
| about | `src/pages/about/index.astro` | `/about/` |
| archive | `src/pages/archive/index.astro` | `/archive/` |
| tcupdate | `src/pages/tcupdate.astro` + `build.format: 'preserve'` | `/tcupdate.html` |
| 404 | `src/pages/404.astro` | `/404.html`（Pages 可识别） |
| feed | `src/pages/feed.xml.ts` | `/feed.xml` |
| sitemap | `src/pages/sitemap.xml.ts` 自定义 endpoint | `/sitemap.xml` |

**分页路径陷阱**：`src/pages/page/[n].astro` 必然包含 `/page/` 段，不能靠 `getStaticPaths` 删除。顶层 `[page]/index.astro` 只返回 allowlist 中的 `page2` 及以上；静态 `/about/`、`/archive/` 路由优先。

**文章日期陷阱**：URL 中的日期来自 **front matter `date`（经 Jekyll 时区规则）**，不一定等于文件名日期（例：存在 `2017-04-23-…` 文件名但站点路径为 `/2017/04/24/…`）。生成 paths 时以 **迁出前 `_site` 清单或 Jekyll 的 `post.url` 为准**，不要只解析文件名。

---

## 4. 构建数据流

```text
_posts / src/content/posts
        │
        ▼
 Content Collections (+ remark/rehype)
        │
        ├─► HTML 片段（正文）
        │
scripts/generate-lastmod.mjs ──► frozen lastmod map（按 sourceFilename）
        │
        ▼
 Astro pages/layouts（拼 DOM class）
        │
        ├─ import styles/tc-blog.scss  → Vite CSS（可带 hash）
        ├─ <script type="module" src="..."> → client JS（可带 hash）
        └─ public/* 原样复制
        │
        ▼
     dist/   ──► GitHub Pages
```

**相对现状的变化**：

- 不再需要 `_data/assets.json` + Liquid `vite-assets.html`；Astro 管 CSS/JS 引用。
- lastmod 在迁移前冻结并由脚本验证，在 `IntroHeader` 里读 `src/data/lastmod.json`；Docker build 不依赖 `.git`。

---

## 5. 配置草图

### `src/data/site.ts`（由 `_config.yml` 抽出）

```ts
export const site = {
  title: "踢锡部落格",
  seoTitle: "踢锡部落格 | TC Blog | TC的博客",
  description: "试着记录点东西 | 都是些有的没的",
  keyword: "TautCony, @tautcony, TC的博客, TC Blog, 博客, 个人网站, 踢锡部落格",
  url: "https://tautcony.xyz",
  headerImg: "img/home-bg.jpg",
  email: "tautcony@gmail.com",
  author: { twitter: "tautcony", github: "tautcony" },
  socialAccount: [ /* ... */ ],
  sidebar: true,
  sidebarAboutDescription: "专业混吃等死",
  sidebarAvatar: "/img/avatar-tautcony.jpg",
  featuredTags: true,
  featuredConditionSize: 2,
  friends: [ /* ... */ ],
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
} as const;
```

### `astro.config.mjs`（要点）

- `site: 'https://tautcony.xyz'`
- `integrations: [vue()]`（`@astrojs/vue@7.0.1`）
- `build.format: 'preserve'`（文件页保留 `.html`，目录页显式使用 `index.astro`）
- `trailingSlash: 'always'`（目录路由）
- 静态资源与 `publicDir: 'public'`

---

## 6. 与现 Vite 多入口的关系

| 现入口 | Astro 挂载方式 |
|--------|----------------|
| `tc-blog` | `BaseLayout` 输出唯一 client `<script type="module">`；禁止 Astro frontmatter import |
| `page404` | 仅 `404.astro` 输出 client script；CSS 为主站样式 + `404.scss` 叠加 |
| `tcupdate` | 仅 `tcupdate.astro` 输出 client script；Vue 版本由 `@astrojs/vue` 约束 |

样式同理：主站 scss 只在 Base/主站 layout 引入，避免 404/tcupdate 打进无关 CSS（现状已是分 entry）。

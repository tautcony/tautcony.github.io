# 01 — 现站模块盘点

按「迁移时要处理的边界」划分模块。每个模块在 [03-mapping-tables.md](./03-mapping-tables.md) 有目标落点。

---

## A. 内容与数据

| 模块 ID | 名称 | 现状路径 | 说明 |
|---------|------|----------|------|
| A1 | 博文 | `_posts/*.{md,markdown}` | 42 篇（40 `.markdown` + 2 `.md`）；日期文件名 + front matter |
| A2 | 草稿 | `_drafts/` | 可选迁移；生产默认不构建 |
| A3 | 站点配置 | `_config.yml` | title、SNS、utterances、katex、paginate… |
| A4 | 构建数据 | `_data/assets.json`、`_data/lastmod.json` | 生成物；gitignore |
| A5 | 语录 | `json/quote.json`（及 `.gz`） | 运行时 fetch |
| A6 | 附件 | `attach/**` | 大文件、PDF、音频等 |
| A7 | 图片 | `img/**` | 头图、文内图、404 资源 |
| A8 | 字体 | `fonts/**`、`css/fonts.css`、`css/iosevka.css` | ~22MB woff2 |
| A9 | 其它静态 | `CNAME`、`favicon.ico`、`robots.txt`、`repo.json` 已删、`contents/` | `robots.txt` 固定保留并指向 `/sitemap.xml` |

---

## B. 模板 / 路由（Jekyll）

| 模块 ID | 名称 | 现状 | 输出 URL |
|---------|------|------|----------|
| B1 | 默认壳 | `_layouts/default.html` | 全部 HTML 页 |
| B2 | 文章布局 | `_layouts/post.html` + includes | `/YYYY/MM/DD/slug/` |
| B3 | 普通页布局 | `_layouts/page.html` | about 等 |
| B4 | Keynote | `_layouts/keynote.html` | 若有使用 |
| B5 | 首页 + 分页 | `index.html` + `jekyll-paginate` | `/`、`/page2/`… |
| B6 | 归档 | `archive.html` | `/archive/` |
| B7 | 关于 | `about.html` | `/about/` |
| B8 | 工具页 | `tcupdate.html` | `/tcupdate.html`（注意扩展名） |
| B9 | 404 | `404.html` | `/404.html` |
| B10 | RSS | `feed.xml` | `/feed.xml` |
| B11 | Sitemap | `jekyll-sitemap` | `/sitemap.xml` |

### B 子模块 — Includes

| ID | 文件 | 职责 |
|----|------|------|
| B1a | `head.html` | title、meta、CSS、modulepreload |
| B1b | `meta.html` | OG / Twitter 等 |
| B1c | `nav.html` | 顶栏 + skip-link + a11y |
| B1d | `footer.html` | 页脚 + 主 JS 入口 |
| B1e | `intro-header.html` | post/page/keynote 头图与 meta 行 |
| B1f | `post-container.html` | 正文容器、prev/next、评论、`window.jekyll` |
| B1g | `sidebar.html` | 侧栏 about / tags |
| B1h | `featured-tags.html` | 标签云片段 |
| B1i | `comment.html` | utterances |
| B1j | `sns.html` | 社交 SVG 图标 |
| B1k | `katex.html` | KaTeX CDN + auto-render |
| B1l | `anchorjs.html` | 标题锚点 |
| B1m | `pdf-embed.html` | PDF 懒加载占位 |
| B1n | `vite-assets.html` | 读 `_data/assets.json` 打 CSS/JS 标签 |

---

## C. 样式

| ID | 名称 | 路径 | 备注 |
|----|------|------|------|
| C1 | 主主题 | `styles/tc-blog.scss` + partials | layout / sidebar / catalog / syntax… |
| C2 | 404 | `styles/404.scss` | 粒子页 |
| C3 | tcupdate | `styles/tcupdate.scss` | 独立页 |
| C4 | heti | `heti` npm + scss | 中文排版 |
| C5 | 字体 CSS | `css/*.css` + `fonts/` | 不经 Vite 亦可 public |

**冻结对象：C1–C5 的选择器与视觉语义。**

---

## D. 前端 TypeScript

| ID | 入口 / 模块 | 路径 | 绑定页面 |
|----|-------------|------|----------|
| D1 | 主站 entry | `src/client/entries/blog.ts` | 全局（default layout） |
| D2 | 404 entry | `src/client/entries/page404.ts` | 404 |
| D3 | tcupdate entry | `src/client/entries/tcupdate.jsx` | tcupdate（Vue JSX） |
| D4 | 页面逻辑 | `src/client/features/{post,page,archive,about}.ts` | 按需 |
| D5 | 库 | `src/client/lib/*` | navbar、quote、pdf-embed、utils.el、geopattern… |
| D6 | 粒子 | `src/client/features/particle404/modern-scene.ts` 等 | 404；npm Three.js WebGL；r56 迁移源码待清理 |
| D7 | 构建 | `astro.config.mjs`、`scripts/*` | Content Layer + route/resource compare + frozen lastmod |

---

## E. 工程与发布

| ID | 名称 | 路径 |
|----|------|------|
| E1 | Node 包 | `package.json` |
| E2 | TS/ESLint | `tsconfig.json`、`eslint.config.mjs` |
| E3 | Ruby/Jekyll | `Gemfile`、`bin/with-ruby` |
| E4 | CI | `.github/workflows/build.yml`、`codeql.yml` |
| E5 | Dependabot | `.github/dependabot.yml` |
| E6 | Docker | `Dockerfile`（node → ruby → nginx） |
| E7 | 文档 | `README.md`、`docs/`、本目录 `mig/` |

---

## F. 第三方运行时（CDN / 嵌入）

| ID | 服务 | 使用位置 |
|----|------|----------|
| F1 | KaTeX | post |
| F2 | 浏览器原生 PDF viewer | pdf-embed（无第三方运行时） |
| F3 | Three.js（npm bundle） | 404 |
| F4 | utterances | comment |
| F5 | Sentry | blog.ts |
| F6 | Pace | head |
| F7 | APlayer | about |
| F8 | AnchorJS | anchorjs include |

迁移时这些 **URL 与初始化参数尽量原样**，避免行为回归。

---

## 模块依赖简图

```text
A1 Posts ──► B2 PostLayout ──► B1 BaseLayout ──► C1 styles + D1 blog.ts
A3 config ─┬► B* 全部页面
           └► F4 utterances / F1 katex flags
A6/A7/A8 ──► public 静态（构建不变换内容）
D7 lastmod ──► B1e intro-header「Update on」
E4 CI ──► D7 build +（现）E3 jekyll  ──迁移后──► 仅 Astro build
```

# 03 — 映射表（Jekyll → Astro）

## 1. 布局与组件

| 现文件 | Astro 落点 | 迁移要点 |
|--------|------------|----------|
| `_layouts/default.html` | `layouts/BaseLayout.astro` | `lang=en`、nav、main#main-content、footer、微信 0 尺寸图 |
| `_layouts/post.html` | `layouts/PostLayout.astro` | IntroHeader post + PostContainer + catalog 列 + AnchorJS + Katex |
| `_layouts/page.html` | `layouts/PageLayout.astro` | IntroHeader page + content slot |
| `_layouts/keynote.html` | `layouts/KeynoteLayout.astro` | iframe 头；确认是否仍有页面使用 |
| `_includes/head.html` | `components/Head.astro` | 标题公式、pace、字体 CSS、主 CSS、modulepreload |
| `_includes/meta.html` | `components/Meta.astro` | 原样字段 |
| `_includes/nav.html` | `components/Nav.astro` | skip-link、aria、站点 pages 列表 |
| `_includes/footer.html` | `components/Footer.astro` | 版权 + 主 JS |
| `_includes/intro-header.html` | `components/IntroHeader.astro` | `type: post \| page \| keynote`；lastmod |
| `_includes/post-container.html` | `components/PostContainer.astro` | `heti spacing`、prev/next、Comment |
| `_includes/sidebar.html` | `components/Sidebar.astro` | enable 开关 |
| `_includes/featured-tags.html` | `components/FeaturedTags.astro` | tags 统计 |
| `_includes/comment.html` | `components/Comment.astro` | utterances 属性不变 |
| `_includes/sns.html` | `components/Sns.astro` | SVG |
| `_includes/katex.html` | `components/Katex.astro` | `site.katex && page.math !== false` |
| `_includes/anchorjs.html` | `components/AnchorJS.astro` | |
| `_includes/pdf-embed.html` | `components/PdfEmbed.astro` | 或 MD 短码组件 |
| `_includes/vite-assets.html` | **删除** | 由 Astro/Vite 资源管线替代 |

## 2. 页面

| 现文件 | Astro | URL |
|--------|-------|-----|
| `index.html` | `pages/index.astro` + 分页逻辑 | `/` |
| （paginator） | `pages/[page]/index.astro`，allowlist `page2+` | `/page2/` … |
| `about.html` | `pages/about/index.astro` | `/about/`；保留 APlayer、about.ts 和 `Comment.astro` pathname |
| `archive.html` | `pages/archive/index.astro` | `/archive/` |
| `tcupdate.html` | `pages/tcupdate.astro` + `build.format: preserve` | `/tcupdate.html` |
| `404.html` | `pages/404.astro` | `/404.html`；default layout 主站 CSS + 404 CSS |
| `feed.xml` | `pages/feed.xml.ts` | `/feed.xml` |
| `sitemap.xml` | `pages/sitemap.xml.ts` 自定义 endpoint | `/sitemap.xml` |

## 3. 内容

| 现 | Astro |
|----|-------|
| `_posts/YYYY-MM-DD-slug.{md,markdown}` | `src/content/posts/` 保留原扩展名，glob 显式包含两者 |
| front matter `layout: post` | 集合固定 PostLayout（可删 layout 字段） |
| `<!--more-->` / excerpt | 在 raw body 渲染前按 separator 切分；首页 truncate 256，42 篇生成摘要快照 |
| `page.path`（`_posts/...`） | 显式 `legacyPath`/`sourceFilename`；URL、lastmod、评论均不依赖 Astro 默认 id |

## 4. 配置项（`_config.yml` → `site.ts` / env）

| Jekyll | Astro |
|--------|-------|
| `title` / `SEOTitle` / `description` / `keyword` | `site.*` |
| `url` / `baseurl` | `astro.config.site` + `base`（保持 `""`） |
| `header-img` | `site.headerImg` |
| `SocialAccount` | `site.socialAccount` |
| `email` / `keyword` | `site.email` / `site.keyword` |
| `paginate: 10` | 首页 `getStaticPaths` 常量 |
| `katex` | `site.katex` |
| `particle404` | 404 页条件或常开 |
| `utteranc.*` | `Comment.astro` props |
| `anchorjs` | AnchorJS 组件开关 |
| `sidebar` / `sidebar-about-description` / `sidebar-avatar` | `site.sidebar` / `site.sidebarAboutDescription` / `site.sidebarAvatar` |
| `featured-tags` / `featured-condition-size` | `site.featuredTags` / `site.featuredConditionSize` |
| `friends` | `site.friends` |
| `google-site-verification` / `ga_measurement_id` | `Head.astro` meta/script |
| `excerpt_separator` | `site.excerptSeparator` |
| `plugins: jekyll-paginate/sitemap` | 自研分页 + `sitemap.xml.ts`；不生成 sitemap index |
| `markdown: kramdown` | Content pipeline（见 05） |
| `exclude` | 不再需要 Jekyll exclude；`.gitignore` + Astro 默认 |

## 5. 前端脚本

> **现行路径（cutover 后）**：客户端在 `src/client/{entries,features,lib}`；无 Vue；无 `window.jekyll` 桥。历史映射见上表。

| 现 | Astro |
|----|-------|
| `src/client/entries/blog.ts` | `src/client/entries/blog.ts`（路径可变） |
| `src/client/entries/page404.ts` | 404 layout 引入 |
| `src/client/entries/tcupdate.ts` | tcupdate 页引入 |
| `import "../../styles/tc-blog.scss"` | 改为 layout 引样式 **或** entry 继续引（二选一，避免重复） |
| `window.jekyll.page` | 改为 `window.__PAGE__` 或 data 属性；**同步改 post.ts 等读取方**（若仍有依赖） |
| `scripts/content/generate-lastmod.mjs` | 迁移前冻结 map；输出 `src/data/lastmod.json`，不依赖 Docker `.git` |
| `scripts/content/migrate-posts.mjs` | 新增；42 篇 front matter、Liquid include、legacyPath 转换/校验 |
| `scripts/test/compare-routes.mjs` / `compare-assets.mjs` | 新增且为 required CI check |
| `scripts/sync-asset-data.mjs` | **删除**（Astro 不需要 assets.json） |
| `vite.config.mjs` 独立多入口 | 并入 `astro.config.mjs` 的 vite 字段或废弃 |

## 6. 工程删除清单（切流后）

| 路径 | 动作 |
|------|------|
| `Gemfile` / `Gemfile.lock` | 删除 |
| `bin/with-ruby` | 删除 |
| `.ruby-version` | 删除 |
| `.gitmodules` / `package.json.submodule` script | 当前 geopattern 已是普通 tracked files；删除陈旧配置 |
| `_config.yml` | PR5 切流后删除或归档到 `mig/legacy/`；双栈期间保留并排除 `src/`/Astro 文件 |
| `_layouts/` `_includes/` | 删除（已组件化） |
| `vite.config.mjs`（若完全并入 Astro） | 删除或缩成 lib |
| `Dockerfile` multi-stage Ruby | 改为 node build → nginx |
| `package.json` 中 jekyll scripts | 替换为 `astro dev` / `astro build` |

## 7. 关键 class 契约（模板必须输出）

以下 class 被 `styles/**` 与 TS 依赖，**禁止改名**：

**壳与导航**：`navbar`、`navbar-default`、`navbar-custom`、`navbar-fixed-top`、`navbar-header`、`navbar-brand`、`navbar-toggle`、`is-collapsed`、`navbar-collapse`、`nav`、`navbar-nav`、`navbar-right`、`skip-link`、`icon-bar`、`sr-only`、`#blog_navbar`、`.in`

**栅格**：`container`、`container-fluid`、`row`、`col-lg-*`、`col-md-*`、`col-lg-offset-*`、`col-md-offset-*`、`visible-lg-block`、`hidden-sm`、`hidden-xs`、`d-none`

**文章**：`intro-header`、`post-heading`、`site-heading`、`page-heading`、`post-container`、`post-content`、`heti`、`spacing`、`post-preview`、`post-title`、`post-subtitle`、`post-meta`、`post-content-preview`、`pager`、`side-catalog`、`catalog-body`、`catalog-toggle`、`sidebar-container`、`tags`、`tag`、`tag-button`、`tag-button--all`、`js-tags`、`js-result`、`one-tag-list`、`listing-seperator`、`#tag_cloud`、`.item`、`.focus`、`.fixed`

**杂项**：`back-to-top`、`corner-buttons`、`#gotop`、`sns-icon`、`external`、`page-fullscreen`、`quote`、`quote-content`、`quote-author`、`pdf-embed`、`highlighter-rouge`、`highlight`、`#container`、`.fallback`、语言 class `language-*`

完整以 `styles/` 选择器为准；迁移 PR 禁止「顺手重命名」。

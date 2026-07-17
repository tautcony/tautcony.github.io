# 冻结契约（现行）

以下行为视为**产品契约**：可改实现，但改对外路径 / 日期 / 关键资源前必须知情更新 fixture 与调用方。

## 1. 文章 URL

- 权威：`src/lib/posts.ts` 的 `postUrl()`（及可选 front matter `permalink`）
- 文件名 `YYYY-MM-DD-slug.md` 的日期前缀是**存档 id**，可以与 URL 日期不一致
- 基线清单：[`fixtures/legacy-post-urls.txt`](./fixtures/legacy-post-urls.txt)（42 条）

新增文章：按 `publishedDate` + slug 规则生成 URL，并视需要扩展 fixture。

## 2. lastmod（「Update on」）

- 文件：`src/data/lastmod.json`
- key = 文章文件名（如 `2016-03-22-hello-github-io.md`）
- CI：`npm run lastmod:check`；重算：`npm run lastmod:refresh`
- 生成器会跳过纯 rename/copy，避免误刷新

## 3. 站点级路由

| 路径 | 说明 |
|------|------|
| `/`、`/pageN/` | 首页与分页 |
| `/archive/`、`/about/` | 归档、关于 |
| `/YYYY/MM/DD/slug/` | 文章 |
| `/404.html` | 自定义 404 |
| `/tcupdate/` 与 `/tcupdate.html` | 工具页（目录路由 + 根下静态双入口） |
| `/feed.xml`、`/sitemap.xml`、`/robots.txt` | 订阅与收录 |

全站 HTML/XML 路径历史快照：[`fixtures/routes-jekyll.txt`](./fixtures/routes-jekyll.txt)（可能略旧于双入口等有意变更）。

## 4. 静态资源 URL

- 发布树：`public/` → 站点根
- 约定前缀：`/img/`、`/attach/`、`/fonts/`、`/css/`、`/json/`、`/arknights/`、`/contents/`、`/favicon.ico`、`/CNAME`、`/robots.txt`
- 哈希基线：[`fixtures/assets-jekyll.json`](./fixtures/assets-jekyll.json)
- 构建产物 `/_astro/*` 不在该契约内（可哈希变化）

## 5. 样式与 DOM

- 样式源：`src/styles/*.scss`
- 主布局 class 体系（Bootstrap 3 栅格名等）视为视觉契约；**不随意重命名 class**
- 代码高亮：Prism（`pre.language-*`），见 `src/styles/syntax.scss`
- 评论：utterances，依赖稳定的 post pathname

## 6. 站点配置

- `src/data/site.ts`：标题、SNS、RSS 页脚开关、`baseurl` 等
- `src/data/pages.ts`：home / about / archive / 404 等页 meta
- `astro.config.mjs` 的 `site` / `base` 应与 `site.url` / `site.baseurl` 一致

## 6b. 页脚语录

- 可编辑源：`src/data/quotes.yml`
- 发布产物：`dist/json/quote.json`（Astro 路由 `src/pages/json/quote.json.ts`，`dev`/`build` 自动生成）
- 校验：CI `quotes:check` 校验 YAML；无需单独 compile 步骤
- 运行时：`src/client/features/quote.ts` fetch `/json/quote.json`

## 7. 明确不在契约内

- `mig/archive/**` 计划文档叙述
- `mig/legacy/**` 只读考古
- `scripts/test/**` 可选对照工具
- Node / Docker 基础镜像版本（可按安全需求升级）

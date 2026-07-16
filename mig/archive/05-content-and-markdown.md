> **历史档案**（`mig/archive/`）。现行说明见 [`../README.md`](../README.md)、[`../contracts.md`](../contracts.md)。

# 05 — 内容集合与 Markdown

> **Historical note (2026-07-16)**：双栈 `_posts`、`legacyPath` / S1 Rouge DOM 等描述已过时。现行：唯一内容源 `src/content/posts/`、schema 见 `src/content.config.ts`、摘要 `src/lib/excerpts.ts`、高亮 Prism。详见 [12-post-cutover-astro-native.md](./12-post-cutover-astro-native.md)。

## 1. Collection 定义

**集合名**：`posts`
**源目录**：`src/content/posts/`（双栈期由 `_posts/` 生成；PR5 后成为唯一源）

### Schema（冻结版）

```ts
// src/content.config.ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const nullableString = z.preprocess(
  value => value === null || value === "" ? undefined : value,
  z.string().optional(),
);

const posts = defineCollection({
  loader: glob({
    base: "./src/content/posts",
    pattern: "**/*.{md,markdown}",
  }),
  schema: z.object({
    title: z.string(),
    titleHtml: nullableString,
    subtitle: nullableString.default(""),
    publishedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    author: nullableString,
    headerImg: nullableString,
    headerMask: z.union([z.string(), z.number()]).nullish(),
    headerStyle: nullableString,
    catalog: z.boolean().optional().default(false),
    math: z.boolean().optional(),
    tags: z.array(z.string()).default([]),
    image: z.object({ credit: nullableString, creditlink: nullableString }).optional(),
    sourceFilename: nullableString, // 旧文精确保留 .md/.markdown 和大小写
    legacyPath: nullableString,     // 旧文为 _posts/<sourceFilename>
    permalink: nullableString,
  }),
});

export const collections = { posts };
```

### Front matter 字段映射

| Jekyll | Astro schema | 备注 |
|--------|--------------|------|
| `title` | `title` + 可选 `titleHtml` | 含 `<em>` 的现有标题拆成纯文本 meta 与受控 HTML 显示值 |
| `subtitle` | `subtitle` | |
| `date` | `publishedDate` | 迁移器规范化为 `YYYY-MM-DD` 字符串，禁止 `z.coerce.date()` 的隐式时区 |
| `author` | `author` | 默认站点作者 |
| `header-img` | `headerImg` | YAML 可用引号键或迁移时批量 rename |
| `header-mask` | `headerMask` | |
| `header-style` | `headerStyle` | |
| `catalog` | `catalog` | |
| `math` | `math` | |
| `tags` | `tags` | 过滤 YAML 空项；空列表写 `[]` |
| `image.credit` / `creditlink` | `image.*` | `null`/空值规范化为 undefined |
| `layout` | 删除 | 由路由固定 |
| `iframe`（keynote） | 若有则扩展 schema | |

**必选迁移器**：`scripts/content/migrate-posts.mjs`

1. 从 `_posts` 复制到 `src/content/posts`，不在 PR1–PR4 移走旧源。
2. 保留原扩展名和大小写，写入 `sourceFilename`、`legacyPath`。
3. 将 `header-img` 等旧键转成 camelCase；`null` → undefined，空 tag → `[]`。
4. 将 date 规范化为 date-only 字符串；含 HTML 的标题拆成 `title`/`titleHtml`。
5. 转换全部 Liquid include；完成后 `src/content/posts` 中 `{%`/`{{` 数量必须为 0。
6. 迁移后断言正好 42 篇、42 个 schema parse 成功，并输出字段 before/after 报告。

### 非文章页面数据

`about.html`、`archive.html`、`404.html`、`index.html` 的 `title`、`description`、`header-img` 不进入 posts collection。迁移器必须生成 `src/data/pages.ts`（或等价静态 manifest），逐页保存这些值；`IntroHeader` 不得在缺失时静默回退到 `site.headerImg`。该 manifest 同时记录 about 的 Comment/utterances pathname 和 404 的 default-layout CSS 依赖。

## 2. URL 生成规则

```ts
// 伪代码
function postUrl(post): string {
  if (post.data.permalink) return post.data.permalink;
  if (post.data.legacyPath) {
    if (!post.data.sourceFilename) throw new Error(`Missing sourceFilename: ${post.id}`);
    const legacyUrl = legacyMap[post.data.sourceFilename];
    if (!legacyUrl) throw new Error(`Missing legacy URL: ${post.data.sourceFilename}`);
    return legacyUrl;
  }
  return urlForNewPost(post.data.publishedDate, post.id);
}
```

### 建立 legacy URL 表（强烈推荐）

在仍能跑 Jekyll 时：

```bash
# 示例：导出 post.path -> post.url
# 写入 mig/fixtures/legacy-post-urls.json
```

`sourceFilename` 是唯一 lookup key，不能使用 Astro 默认 `post.id`。迁移旧文必须 **42/42 命中**、URL 唯一、禁止 fallback；表在 PR5 后迁入 `src/data/legacy-post-urls.json`，不是可删除的临时 fixture。新文只使用 date-only `publishedDate` + 明确 slug 规则。迁移器必须以 Jekyll `post.url`/legacy fixture 计算旧文日期；不得让 Node 本地时区改变 URL。新文 date-only 解析固定为日历日期，不调用 `new Date("YYYY-MM-DD")` 后再取本地年月日。

## 3. 正文渲染管线

### 需要兼容的 Markdown 特性

| 特性 | 现网依赖 |
|------|----------|
| GFM | 表格、删除线、任务列表等 |
| 标题 id | 侧栏 catalog 用 `h1–h6[id]` |
| fenced code + language | 高亮 + `language-*` 角标 |
| 裸 HTML | 历史文可能含 HTML |
| `<!--more-->` | 首页摘要分割（index 用 split） |
| 相对图片路径 | `/img/...` 或相对路径 |
| 数学 `$` / `$$` | KaTeX 客户端 |

### 插件栈（锁入 package-lock）

- `remark-gfm`
- 标题 slug：`rehype-slug`（id 算法与 kramdown 可能略有差异 → catalog 仍可用）
- 高亮：见下节
- 原始 HTML：`rehype-raw`；仅保留现有受信内容，新增 `<script>` 需 `allowRawScript: true` 和 review

### 摘要

复刻 `index.html`：

1. 对 raw Markdown body、在 remark/rehype 前以 `<!--more-->` 分割（42 篇均依赖该标记）
2. 取第一段 → 去 HTML → `truncate 256`
3. 展示于 `.post-content-preview`

迁移器为 42 篇生成摘要 fixture；首页每页文章 URL 序列和摘要文本都必须与 Jekyll 基线一致。同日文章按 legacy URL 表顺序作为 tie-break，不能依赖文件遍历顺序。

## 4. 代码高亮策略（模块：Markdown/Syntax）

| 方案 | 描述 | 样式风险 |
|------|------|----------|
| **S1 兼容 DOM** | 自定义 rehype 输出 `div.highlighter-rouge.language-x > div.highlight > pre > code` | 最低 |
| S2 Shiki + 双写 CSS | 新 class + 扩展 syntax.scss | 中（要改样式文件） |
| S3 构建期调 rouge 不现实 | — | — |

**默认选 S1**，以满足「样式不变化」。

## 5. lastmod 模块

| 项 | 说明 |
|----|------|
| 脚本 | 保留 `scripts/content/generate-lastmod.mjs` |
| key | 固定 `sourceFilename`，数据保留 `legacyPath` 和当前 content path |
| 显示 | `IntroHeader`：`Update on {display} with commit {short_sha}` |
| PR1–PR4 | 在搬迁前由 `_posts` 生成并提交 `src/data/lastmod.json` 基线 |
| PR5 后 | 脚本只用 Git 更新真正发生内容修改的条目；迁移提交不得覆盖 frozen baseline |
| Docker | 只消费已提交/注入的 map，不在无 `.git` 的 build context 中重新生成 |

脚本若生成少于预期文章数必须非零退出，禁止捕获 Git 错误后写空 map。PR5 记录迁移基线 commit；后续逻辑若最新 commit 仅是复制/rename，则回退 frozen 条目。`git mv` 本身不等于保留显示日期。

## 6. PDF embed

现：Liquid include + `data-pdf-embed` + `pdf-embed.ts`。

首迁不引入 MDX。`migrate-posts.mjs` 把现有 `{% include pdf-embed.html ... %}` 精确替换为 `pdf-embed.ts` 所需的静态 HTML/data 属性；`PdfEmbed.astro` 仅供未来普通页面复用。

门禁：迁移目录不得残留 Liquid；该 PDF 文章必须验证占位、点击后才请求 PDF、原生矢量 viewer，以及不支持内嵌预览时的直接打开/下载 fallback。

## 7. 草稿与未来写作

| `_drafts` | 可选 `content/drafts` 或忽略 |
| 本地预览 | `astro dev` |
| 新文章 | `src/content/posts/YYYY-MM-DD-slug.md`；front matter 使用 `publishedDate`，不再写 legacyPath |

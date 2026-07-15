# 07 — 分阶段实施步骤

每阶段结束应满足 **可构建、可预览、可回滚**。
集成分支：计划名 `astro-migration`；本仓实际分支 **`feat/astro-mig`**（见 [PROGRESS.md](./PROGRESS.md)）。
PR1–PR4 依次合入该分支，不进入 `master`；PR5 才把完整迁移合入 `master`。阶段编号 **M0–M5**。
**实施进度与接续入口以 [PROGRESS.md](./PROGRESS.md) 为准**；本文件 checklist 完成后同步勾选 PROGRESS。

---

## M0 — 脚手架与样式接入（0.5–1 天）

### 目标

空壳 Astro 能跑；主 scss 挂上；DOM 壳 class 正确。

### 步骤

1. **分支**：从最新 `master` 创建并 push `astro-migration`；后续 PR base 指向该分支。
2. **锁定依赖**：用 `npm install --save-exact` 安装 `astro@7.0.7`、`@astrojs/vue@7.0.1`、`@astrojs/check`、`vue@3.5.24`、`remark-gfm`、`rehype-slug`、`rehype-raw`；提交 `package-lock.json`。
3. **锁定运行时**：`.nvmrc`、`package.json.engines`、CI、Docker 均为 Node `>=22.12.0`。
4. **创建** `astro.config.mjs`、`src/env.d.ts`、根 `tsconfig` 扩展 Astro；配置 `build.format: 'preserve'`。
5. **双栈隔离**：`_config.yml.exclude` 临时加入 `src`、`public`、`astro.config.mjs`；Jekyll 不得复制 Astro 源。
6. **`public/`**：复制并用 `scripts/build/sync-public.mjs` 同步 `img`、`attach`、`fonts`、`css`、`json`、`CNAME`、`favicon.ico`、`arknights`、`contents`；禁止 `git mv`/删除根源。
7. **`src/data/site.ts`**：按 [03](./03-mapping-tables.md) 逐键迁移并输出 mapping report；禁止只抄配置草图。
8. **`BaseLayout.astro` + `Nav` + `Footer` + `Head`**：按 [03](./03-mapping-tables.md) 的 class/ID/state/data 契约实现。
9. **引入** 根 `styles/tc-blog.scss` + heti；不搬 `styles/`/`ts/`。
10. **验证脚本骨架**：创建 `compare-routes.mjs`、`compare-assets.mjs`、`migrate-posts.mjs`，至少带 fixture 单测和失败退出码。
11. **scripts**：增加 `dev:astro`、`build:astro`、`check:astro`；旧 Jekyll scripts 保留到 PR5。

### 交付

- [ ] `astro dev` 可见顶栏/页脚/字体
- [ ] 不破坏现有 `npm run ci`（Jekyll 仍可用）
- [ ] clean checkout + Node 22.12+ 下 `npm ci && npm run check:astro && npm run build:astro` 通过
- [ ] Jekyll `_site` 不含 `/src/`、`astro.config.mjs` 或 Astro 源文件

### 验收

固定桌面/移动 viewport，生成壳、顶栏、页脚 baseline/current/diff；截图 diff 从本阶段开始保留为 CI artifact。

---

## M1 — 内容集合与文章页（2–3 天）

### 目标

全部文章可生成；URL 与 `_site` 一致；正文 + 样式可接受。

### 步骤

1. **冻结 baseline**
   - 从当前 Jekyll `_site` 或 `site.posts` 生成 `mig/fixtures/legacy-post-urls.json`
   - key 固定为带扩展名/大小写的 `sourceFilename`；断言 42 key/42 URL/无重复
   - 生成 `legacy-post-urls.txt`、文章 HTML route fixture、`src/data/lastmod.json`
2. **复制内容**：运行 `scripts/content/migrate-posts.mjs` 将 `_posts` 生成到 `src/content/posts`；禁止移动 `_posts`。
3. **`src/content.config.ts`**：Content Layer `glob("**/*.{md,markdown}")` + [05](./05-content-and-markdown.md) schema。
4. **Markdown 管线**：GFM、slug、S1 高亮 DOM、受控 raw HTML；raw body 阶段生成 42 条摘要。
5. **强制转换**：Liquid 残留为 0；PDF include 转成静态 data HTML；含 HTML title 拆成纯文本/受控 HTML。
6. **路由** `src/pages/[year]/[month]/[day]/[slug]/index.astro`
   - 旧文 `getStaticPaths` 只读 `sourceFilename → legacy URL`；缺失映射直接失败
7. **`PostLayout` / `IntroHeader` / `PostContainer` / `Sidebar` / `Comment` / `Katex` / `AnchorJS`**。
8. **排序**：按 `publishedDate`，同日使用 legacy fixture 顺序 tie-break；首页/archive/prev-next 共用函数。
9. **lastmod**：读取 frozen map；生成少于 42 条时失败，迁移 commit 不覆盖旧显示日期。
10. **catalog**：`page.ts` 逻辑 + `catalog: true` 的帖。

### 交付

- [ ] 42 篇全部 200
- [ ] 42/42 schema parse、URL map 命中、lastmod 命中；无 fallback/重复 URL
- [ ] **仅文章 route fixture** 与 dist 文章路径 diff = 0（全站 diff 延后到 M3）
- [ ] Liquid 残留 = 0，42 条摘要 fixture 一致
- [ ] 2 篇含代码 + 1 篇含公式视觉 OK

### 验收命令（示例）

```bash
npm run build:astro
node scripts/test/compare-routes.mjs --scope posts --legacy mig/fixtures/legacy-post-urls.txt --dist dist
```

---

## M2 — 列表页与站点页（2–3 天）

### 目标

首页分页、归档、about、feed、sitemap。

### 步骤

1. **首页** `index.astro`：使用 raw-body 摘要 fixture；每页 URL/摘要序列对齐。
2. **分页** `pages/[page]/index.astro`：`getStaticPaths` 只返回 `page2` 及以上；禁止 `page/[n]`。
3. **`archive/index.astro`**：标签按钮 `data-encode`、文章 `data-tags`、`#tag_cloud`/`.item`/状态 class 对齐。
4. **`about/index.astro`**：逐页 props（title/description/header image）+ APlayer + about.ts + `Comment.astro`。
5. **`feed.xml.ts`**：固定 10 篇、RFC822 日期、self link、完整 content、tags/categories、XML escaping/content-type；与旧 feed 做结构 diff。
6. **`sitemap.xml.ts`**：自定义生成精确 `/sitemap.xml`；不产生 `/sitemap-index.xml`/`sitemap-0.xml`。
7. **Nav 链接**：Home / 各 page / Tool→`/tcupdate.html`

### 交付

- [ ] `/`、`/page2/`… 与现帖序一致
- [ ] `/archive/?tag=...` 筛选可用
- [ ] `/about/` 无 JS 报错且 utterances 绑定 `/about/`
- [ ] `/feed.xml`、`/sitemap.xml` 可解析；错误 sitemap index 路径不存在
- [ ] page-level 头图/title/description 与 Jekyll fixture 一致

---

## M3 — 特殊页与脚本收尾（1–2 天）

### 目标

404、tcupdate、pdf-embed、全局脚本无回归。

### 步骤

1. **`404.astro`**：主站 CSS + `404.scss`、fullscreen/`#container .fallback`、client-only page404 entry、Three CDN。
2. **验证** `?webGL` `?perf` `?gui`
3. **`tcupdate.astro`**：依赖已冻结的 `build.format: 'preserve'`，构建后必须存在 `dist/tcupdate.html` 且不存在 `dist/tcupdate/index.html`。
4. **Vue JSX**：`@astrojs/vue@7.0.1` + Vue 3.5.24，client-only mount 一次。
5. **pdf-embed**：验证 M1 转换后的静态 HTML、点击加载、canvas、下载 fallback 和 CDN 失败状态。
6. **quote.json** 在 public，footer 语录轮换
7. **删除** entry 内重复 scss（若已改 layout 引入）
8. **SW unregister** 策略再确认
9. **全站门禁**：运行 `compare-routes --scope all`、`compare-assets`、全路由 HTTP smoke 和六类页面 Playwright diff。

### 交付

- [ ] `/404.html` 粒子 OK
- [ ] `/tcupdate.html` 下载卡片 OK
- [ ] PDF 文可预览
- [ ] 全站 HTML/XML route diff 通过；仅显式 allowlist 有差异
- [ ] 静态资源 URL+size/hash 与 Markdown 引用检查通过

---

## M4 — CI / Docker / 切流（1–2 天）

### 目标

生产只构建 Astro；Ruby 下线。

### 步骤

1. **改** `.github/workflows/build.yml`
   - 去掉 Ruby
   - `npm ci` → `npm run lastmod:check` → `npm run ci`（Astro）
   - artifact 路径 `dist`
   - 保持 `fetch-depth: 0`
2. **Dockerfile**：node build → nginx（去 generator stage）
   - Docker 不运行 lastmod 生成器；使用仓库提交的 `src/data/lastmod.json`
   - `.dockerignore` 可排除 `.git`，但 build 必须与 Pages 产物的 lastmod 一致
3. **`package.json` scripts**
   ```json
   {
     "dev": "astro dev",
     "build": "astro build",
     "preview": "astro preview",
     "check:astro": "astro check",
     "lastmod:check": "node scripts/content/generate-lastmod.mjs --check",
     "verify:routes": "node scripts/test/compare-routes.mjs --scope all --legacy mig/fixtures/routes-jekyll.txt --dist dist",
     "verify:assets": "node scripts/test/compare-assets.mjs --legacy mig/fixtures/assets-jekyll.json --dist dist",
     "ci": "npm run eslint && npm run typecheck && npm run check:astro && npm run build && npm run verify:routes && npm run verify:assets"
   }
   ```
4. **Dependabot**：去掉 bundler ecosystem（若已无 Gemfile）
5. **README** 全面改为 Astro 说明
6. **删除** Jekyll 遗留文件（[03 §6](./03-mapping-tables.md)）
7. **docs/modernization-plan.md** 标注路径 B 完成度

### 交付

- [ ] PR CI 绿
- [ ] 预发 Pages 或 `astro preview` 全链路
- [ ] `astro check`、lint glob 覆盖最终 `src/`/`ts/` 路径
- [ ] 全量 route/resource/HTTP/截图门禁有 CI artifact
- [ ] 合并 `master` 后线上验收

### 回滚

- 切流前 push 受保护 tag `pre-astro-YYYYMMDD`，并保存最后一个 Jekyll Pages artifact
- 线上异常：revert PR5 到 `master`，触发现有 master workflow；不要依赖 tag 自动触发（当前 workflow 无 tag/workflow_dispatch）
- 局部 URL 错误：在旧路径生成静态文件并重新部署；不使用 GitHub Pages 不支持的 `public/_redirects` 方案
- 每次回滚需验证 `/`、文章、`/about/`、`/archive/`、`/tcupdate.html`、`/404.html`、`/feed.xml`、`/sitemap.xml`、`/robots.txt` 和静态资源

---

## M5 — 稳定与清理（持续）

- [ ] 仅删除 Jekyll 运行时和重复源；保留 `legacy-post-urls.json`、route/resource baseline、compare 脚本和摘要 fixture
- [ ] 以 commit/tag 写入 Sentry release，监控 7 天；页面/404/tcupdate/评论错误率不高于迁移前基线，超阈值自动回滚
- [ ] 视需要：fonts 子集、tcupdate 去 Vue、高亮优化（**单独 PR，不绑迁移**）

---

## 推荐 PR 拆分

| PR | 内容 | 是否切生产 |
|----|------|------------|
| PR1 | M0 脚手架、版本锁定、双栈隔离、验证脚本骨架 | 否，base=`astro-migration` |
| PR2 | M1 内容复制、schema、legacy URL、摘要/Liquid/lastmod baseline | 否，base=`astro-migration` |
| PR3 | M2 首页/分页/归档/about/feed/sitemap | 否，base=`astro-migration` |
| PR4 | M3 404/tcupdate/pdf/全站 route+asset+视觉门禁 | 否，base=`astro-migration` |
| PR5 | M4 CI/Docker 切换、受保护 tag、删除 Jekyll | **是，合入 `master`** |

---

## 每日自检清单（实施时）

- [ ] `npm run ci` 成功（含 `astro check`、route/resource compare）
- [ ] 全部 legacy URL smoke；至少覆盖每个页面类型和所有静态资源清单
- [ ] 未修改 `styles/**` 语义（`git diff styles` 应接近空）
- [ ] 未引入新的全局 CSS 框架
- [ ] baseline/current/diff 截图和回滚 artifact 已上传

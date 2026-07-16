# Astro 迁移实施造册（PROGRESS）

> **用途**：单一事实源。随时打开本文件可知当前阶段、已完成项、下一步与阻塞。
> **约定**：改代码的同时更新本册；状态只允许 `todo` / `doing` / `done` / `blocked` / `n/a`。
> **集成分支**：`feat/astro-mig`（计划文档中的 `astro-migration` 等价；未另建同名分支）
> **策略**：PR1–PR4 双栈并行；PR5 已将定型静态资源收口到受 Git 管理的 `public/`。

---

## 总览

| 字段 | 值 |
|------|-----|
| 当前阶段 | **完成待发布** + **M6 可并行**（M0–M5 代码完成；合 master；Astro-native 收口见 `12`） |
| 当前 PR 切片 | 开 PR → master；M4-05 / M5-02 线上；M6 见 `12-post-cutover-astro-native.md` |
| 上次更新 | 2026-07-16 |
| 可接续入口 | 见下方「下一步」；M6 从 W1 起 |
| 阻塞 | 无（合入 master 为人工门禁） |

| 阶段 | 名称 | 状态 | 备注 |
|------|------|------|------|
| M0 | 脚手架与样式接入 | **done** | PR1 |
| M1 | 内容集合与文章页 | **done** | PR2：42 文 URL diff=0 |
| M2 | 列表页与站点页 | **done** | 首页/分页/archive/about/feed/sitemap |
| M3 | 特殊页与脚本收尾 | **done** | 404/tcupdate/pdf/quote；全站 route+asset OK |
| M4 | CI / Docker / 切流 | **done*** | *除合 master |
| M5 | 稳定与清理 | **done*** | *M5-02 线上 7 日观察待部署后执行 |
| M6 | Post-cutover Astro-native | **doing** | W1–W3/W5/W6 done；W4/W7 待；明细 [`12`](./12-post-cutover-astro-native.md) |

---

## 下一步（接续指令）

任意 agent/人恢复工作时：

1. 读本文件总览 + 当前阶段 checklist。
2. 读 `07-phases.md` 对应 Mn 与 `00`–`06` 相关手册。
3. 从「下一步」第一条未完成项开始；完成后把本册勾选/改状态并写 changelog。
4. 每阶段结束跑该阶段验收命令，再把阶段状态改为 `done`。

### 此刻应做（发布）

1. **切流前**：打保护 tag `pre-astro-YYYYMMDD`，保存最后一次 Jekyll Pages artifact。
2. **发布 checklist**：`npm run ci`。
3. **开 PR** `feat/astro-mig` → `master`；CI 绿后合并。
4. **合并后**线上验收六类页 + feed/sitemap/robots。
5. **Sentry 7 日**：按 `mig/11-sentry-observe.md`；窗口结束勾 M5-02。

### 此刻可并行（M6 · Astro-native 收口）

详见 **[12-post-cutover-astro-native.md](./12-post-cutover-astro-native.md)**。建议顺序：

| 包 | 内容 | 状态 |
|----|------|------|
| W1 | 注释 Astro-first + 删 `fa-*` / `--write-jekyll` | **done** |
| W2 | `site` 单一源 + RSS 策略（`rss: false` 保页脚；feed 仍生成） | **done** |
| W3 | sitemap/nav 契约注释化/小重构（行为冻结；Tool 并入 navPages） | **done** |
| W4 | tcupdate 去 simple-line-icons → SVG | **deferred**（决策：延后） |
| W5 | mig/docs historical 标注 + 本阶段勾选 | **done** |
| W6 | styles 迁入 `src/styles/` | **done** |
| W7 | brightness/corevalue | **deferred**（决策：暂时不动） |
| — | RSS 页脚 | **done**（`rss: true`） |
| — | 删 `public/img/search.png` | **done**（已用 search.svg） |

**M6 原则**：URL / lastmod / fixtures / baselines **保留 Jekyll 时代语义**；业务源码不再用「from legacy _config」叙事。

**勿做**：改 `styles/**` 语义（除非 W6 专 PR）；无回滚计划时强推 master；Docker 内再跑 lastmod 生成器；为「干净」删除 `mig/fixtures` 或 `legacy-post-urls`。

### 一致性评估（相对 Jekyll `_site`）

设计：`mig/10-consistency-eval.md`  
Baseline：`mig/baselines/jekyll-site/`（gitignore）+ `jekyll-site.meta.json`  

| 层 | 命令 | 首轮 |
|----|------|------|
| L1–L5 | `npm run eval:consistency` | **PASS_WITH_KNOWN_DELTAS** |
| L6 视觉 | `npm run eval:visual` | **PASS** 18/18 |

报告：`mig/reports/consistency-latest.md`、`mig/reports/visual-latest.md`（gitignore）。

---

## 决策锁定（D1–D8）

| # | 议题 | 决议 | 状态 |
|---|------|------|------|
| D1 | 同仓 feature 分支 | `feat/astro-mig` 同仓替换 | done |
| D2 | Markdown = Content + remark/rehype | `@astrojs/markdown-remark` `unified()` + GFM/slug/raw | done |
| D3 | tcupdate 保留 Vue client | `@astrojs/vue@7.0.1` + Vue 3.5.24 | done |
| D4 | 双栈 diff 至 PR5 | compare 脚本骨架 + fixtures | done（骨架） |
| D5 | `html lang=en` | 保持 | done |
| D6 | Astro 7.0.7 / Node ≥22.12.0 | lockfile 已提交依赖 | done |
| D7 | `build.format: 'preserve'` | `astro.config.mjs` | done |
| D8 | PR1–4 不搬 `_posts`/根资源 | PR5 已迁入 `public/`，原 URL 不变 | done |

---

## M0 — 脚手架与样式接入

**目标**：空壳 Astro 可跑；主 scss 挂上；DOM 壳 class 正确。

| ID | 任务 | 状态 | 产物 / 备注 |
|----|------|------|-------------|
| M0-01 | 集成分支就绪 | done | `feat/astro-mig` |
| M0-02 | 锁定依赖（astro 7.0.7 等 exact） | done | + `@astrojs/markdown-remark@7.2.1`（Astro 7 必需） |
| M0-03 | Node engines / `.nvmrc` ≥22.12.0 | done | engines + `.nvmrc` → `22.12.0` |
| M0-04 | `astro.config.mjs` + `src/env.d.ts` | done | preserve + unified markdown |
| M0-05 | `_config.yml` exclude Astro 路径 | done | src/public/dist/astro/mig |
| M0-06 | `sync-public` + public 同步 | done | M0 历史方案；PR5 已删除同步脚本并提交 `public/` |
| M0-07 | `src/data/site.ts` 全量映射 | done | 站点常量；M0 审计表 `siteConfigMapping` 已于 P1 删除 |
| M0-08 | BaseLayout + Head + Meta + Nav + Footer + Sns | done | class 契约对齐 |
| M0-09 | 引入 `styles/tc-blog.scss` + heti | done | 根路径 import；不搬 styles/ |
| M0-10 | 验证脚本骨架 | done | 三脚本均 `--self-test` 绿 |
| M0-11 | package scripts | done | `dev:astro`/`build:astro`/`check:astro`/`ci:astro` |
| M0-12 | 占位首页 | done | `src/pages/index.astro` |
| M0-13 | `.gitignore` dist/.astro/public | done | M0 历史方案；M5 起提交 `public/` |
| M0-14 | 验收 dual-stack | done | 见下方交付勾选 |

### M0 交付勾选

- [x] `astro dev` / build 可见顶栏/页脚/字体（`dist/index.html` 含 navbar/footer/fonts.css）
- [x] 不破坏现有 `npm run ci` 链路：eslint、typecheck、vite build、jekyll build 均通过
- [x] `npm run check:astro && npm run build:astro` 通过
- [x] Jekyll `_site` 不含 `src/`、`astro.config.mjs`

### M0 已知备注

- `styles` 内无效 `::not` 已修正为 `:not`；构建不再产生该 lightningcss 警告。
- `blog.ts` 仍 import scss（Jekyll 需要）；Astro layout 也 import → 产物可能双链同一 CSS hash，切流前可再收敛（方案 A：样式归 layout）。
- （历史）M0 时 `migrate-posts --write` 尚未实现；M1 已落地。

---

## M1 — 内容集合与文章页

| ID | 任务 | 状态 | 备注 |
|----|------|------|------|
| M1-01 | 冻结/校验 legacy-post-urls 42 条 | done | fixtures + self-test |
| M1-02 | `migrate-posts.mjs` 生成 `src/content/posts` | done | 保留扩展名；不删 `_posts` |
| M1-03 | `content.config.ts` schema | done | + `.markdown` entry type 集成 |
| M1-04 | Markdown 管线 GFM/slug/高亮/raw | done | Astro Prism 原生 DOM（已移除 rouge-compat） |
| M1-05 | Liquid→0；PDF include；HTML title | done | 1 处 pdf-embed 静态化 |
| M1-06 | 文章路由 + legacy map | done | 含日期错位文 `/2017/04/24/...` |
| M1-07 | PostLayout 与文章组件集 | done | Intro/PostContainer/Sidebar/… |
| M1-08 | 排序 + lastmod 冻结 map | done | `src/data/lastmod.json` 42 |
| M1-09 | catalog DOM | done | `catalog: true` 输出 side-catalog |
| M1-10 | compare-routes --scope posts | done | 42/42 diff=0 |

### M1 交付勾选

- [x] 42 篇生成；schema/URL/lastmod 全命中
- [x] 文章 route diff = 0；Liquid = 0
- [x] 摘要由 `src/lib/excerpts.ts` 运行时生成（无独立 `excerpts.json` fixture）

---

## M2 — 列表页与站点页

| ID | 任务 | 状态 | 备注 |
|----|------|------|------|
| M2-01 | 首页 + 摘要 | done | `src/lib/excerpts.ts`；首/末帖序对齐 Jekyll |
| M2-02 | 分页 `page2+` | done | `/page2/`…`/page5/`；无 `/page/n` |
| M2-03 | archive 标签筛选 DOM | done | 41 tags + Show All；encode 与 Jekyll 一致 |
| M2-04 | about + APlayer + Comment | done | utterances + kon/qr 容器 |
| M2-05 | feed.xml.ts | done | 10 items、RFC822、categories |
| M2-06 | sitemap.xml.ts（非 index） | done | 54 loc；无 sitemap-index |
| M2-07 | Nav / page meta | done | `src/data/pages.ts` 头图/description |

### M2 交付勾选

- [x] `/`、`/page2/`… 帖序与 Jekyll 一致（10+10+10+10+2）
- [x] `/archive/` tag_cloud / data-encode / data-tags
- [x] `/about/` APlayer + utterances
- [x] `/feed.xml`、`/sitemap.xml` 可解析；无 sitemap index

---

## M3 — 特殊页与脚本收尾

| ID | 任务 | 状态 | 备注 |
|----|------|------|------|
| M3-01 | 404 粒子页 | done | `404.astro`：主站 CSS+`404.scss`、现代 Three.js page404 entry；body `page-fullscreen page page-404` |
| M3-02 | tcupdate.html preserve | done | `dist/tcupdate.html` 存在；无 `dist/tcupdate/index.html`；Vue JSX client mount |
| M3-03 | pdf-embed 验证 | done | 点击后挂载原生矢量 PDF viewer；`PdfEmbed.astro` 可复用 |
| M3-04 | quote.json / footer 语录 | done | `public/json/quote.json`（15 条）；Footer `.copyright` + blog.ts Quote/SW unregister |
| M3-05 | 全站 compare-routes/assets + smoke | done | routes 53/53；当前 assets 108/108；preview HTTP 200 |

### M3 交付勾选

- [x] `/404.html`：`#container .fallback` + 现代 Three.js page404 module；无 r56 classic script
- [x] `/tcupdate.html` 下载卡片 DOM + Vue entry
- [x] PDF 文静态占位 + PDF 文件可达
- [x] 全站 HTML/XML route diff = 0
- [x] 静态资源 URL+size/hash diff = 0
- [x] quote.json 在 dist；blog entry 含 Quote + SW unregister

---


## M4 — CI / Docker / 切流

| ID | 任务 | 状态 | 备注 |
|----|------|------|------|
| M4-01 | workflow 去 Ruby → Astro dist | done | `.github/workflows/build.yml`：浅克隆、Node `.nvmrc`、`npm run ci`、Pages artifact=`dist` |
| M4-02 | Dockerfile node→nginx | done | `node:22.12-bookworm` → `nginx:1.27-alpine`；无 Ruby stage |
| M4-03 | package scripts 切换默认 build | done | `dev`/`build`/`preview`/`ci` 均 Astro；别名 `*:astro` 保留 |
| M4-04 | 删 Jekyll 遗留 + README | done | 去 Gemfile/layouts/includes/根页/vite.config；`_config.yml`→`mig/legacy/`；README Astro |
| M4-05 | 合 master + 线上验收 | **todo** | **人工**：开 PR 合入 + 线上清单（本 agent 不自动 merge） |

### M4 交付勾选

- [x] CI 配置改为 Astro `dist`（待 PR 上跑绿）
- [x] Dockerfile 仅 node→nginx + frozen lastmod
- [x] `npm run ci` 本地：build + route/asset OK
- [x] Dependabot 去 bundler；CodeQL 覆盖 JavaScript/TypeScript + Actions，不扫描归档 Ruby
- [ ] 合并 `master` 后线上验收（M4-05）

### 回滚要点

- tag `pre-astro-YYYYMMDD` + 旧 Pages artifact
- revert 合入 commit 到 master 触发旧 workflow 不可用（旧 workflow 已改）；回滚需 revert 本 PR **或** 从 tag 恢复 Jekyll 树后 redeploy
- 切流前务必保存 pre-astro tag

---


## M5 — 稳定与清理

| ID | 任务 | 状态 | 备注 |
|----|------|------|------|
| M5-01 | 仅删运行时重复源；保留 fixtures/compare | **done** | 删 `_posts`/`_drafts`/`_data`；草稿→`mig/legacy/drafts`；内容唯一源 `src/content/posts` |
| M5-02 | Sentry release 观察 7 天 | **todo** | release 已注入；观察 runbook `mig/11-sentry-observe.md`（合 master 后起算） |
| M5-03 | 可选后续优化（独立 PR） | **n/a** | fonts 子集 / Shiki；**tcupdate 去 Vue 已完成**（纯 TS） |

### M5 交付勾选

- [x] `_posts` 删除；`src/content/posts` 为唯一博文源
- [x] fixtures / compare / eval 脚本保留
- [x] blog entry 去掉重复 scss 导入（样式归 BaseLayout）
- [x] Sentry `release` = `tc-blog@version+sha`
- [ ] 线上 7 日观察（M5-02）

---


## 变更日志（实施记录）

| 日期 | 阶段 | 摘要 |
|------|------|------|
| 2026-07-14 | M0 | 创建造册；完成 PR1/M0：Astro 7 脚手架、site.ts、壳组件、sync-public、三验证脚本骨架、双栈 exclude |
| 2026-07-14 | M1 | migrate-posts 42 篇、content collection、PostLayout、legacy URL 路由、lastmod 冻结、posts route diff=0 |
| 2026-07-14 | M2 | 首页分页、archive、about、feed.xml、sitemap.xml、PageLayout/PostList |
| 2026-07-14 | M3 | 404 粒子页、tcupdate preserve、PdfEmbed、assets fixture、全站 route+asset compare、HTTP smoke |
| 2026-07-14 | M4 | CI/Docker/README 切 Astro；删 Jekyll 运行时；lastmod:check；待合 master |
| 2026-07-14 | eval | 一致性 L1–L6：冻结 `_site` baseline；全文对齐 + 视觉截图门禁；非 CI 强制 |
| 2026-07-14 | M5 | 删 `_posts`/`_drafts`/`_data`；Sentry release；legacy 归档；观察 runbook |
| 2026-07-15 | M5 | Legacy 静态资源从根目录收口到受 Git 管理的 `public/`；删除构建前同步，保持 111 项资源 URL/hash 契约 |
| 2026-07-16 | 404 | 切换现代 Three.js 验收；退役 r56 专用 `disc`、`particle_tr`、`inner_bck`，当前资源契约 108 项 |
| 2026-07-16 | CI | Actions 更新至 checkout/setup-node v7、Pages v5、CodeQL v4；移除 compare fixture snapshot 上传与 full-history checkout |
| 2026-07-16 | PDF | 移除 PDF.js canvas 预览；点击后挂载浏览器原生矢量 PDF viewer，并保留打开/下载 fallback |
| 2026-07-16 | P1 | 删 r56 particle404 死代码；去 `_drafts` 重复、`.lesshintrc`、`baTrackId`、`siteConfigMapping`、`*:astro` 别名；订正 excerpts/Vue/migrate-posts 文档漂移 |

---



## 文件登记（实施中维护）

| 路径 | 阶段 | 说明 |
|------|------|------|
| `mig/PROGRESS.md` | M0 | 本造册 |
| `mig/README.md` | M0 | 指向 PROGRESS |
| `astro.config.mjs` | M0 | Astro 配置 |
| `package.json` / `package-lock.json` | M0 | 依赖与 scripts |
| `.nvmrc` | M0 | 22.12.0 |
| `_config.yml` | M0 | exclude Astro 路径 |
| `.gitignore` | M0/M5 | 忽略 dist / .astro；`public/` 自 M5 起提交 |
| `src/env.d.ts` | M0 | Astro types |
| `src/data/site.ts` | M0 | 站点常量 |
| `src/layouts/BaseLayout.astro` | M0 | 默认壳 |
| `src/components/{Head,Meta,Nav,Footer,Sns}.astro` | M0 | 壳组件 |
| `src/pages/index.astro` | M0 | 占位首页 |
| `scripts/test/compare-routes.mjs` | M0 | 路由 diff 骨架 |
| `scripts/test/compare-assets.mjs` | M0 | 资源 diff 骨架 |
| `src/content.config.ts` | M1 | posts collection schema |
| `src/content/posts/*` | M1 | 唯一博文源（`.md`） |
| `src/data/lastmod.json` | M1 | 冻结 lastmod（filename key） |
| `src/lib/posts.ts` | M1 | URL/排序/prev-next |
| ~~`src/lib/rehype-rouge-compat.mjs`~~ | M1 | 已删除；样式改为 Prism `pre.language-*` |
| `src/layouts/PostLayout.astro` | M1 | 文章布局 |
| `src/components/{IntroHeader,PostContainer,Sidebar,FeaturedTags,Comment,Katex,AnchorJS}.astro` | M1 | 文章组件 |
| `src/pages/[year]/[month]/[day]/[slug]/index.astro` | M1 | 文章路由 |
| `src/lib/excerpts.ts` | M2 | 运行时摘要（无 excerpts.json fixture） |
| `src/data/pages.ts` | M2 | 非文章页 title/description/header |
| `src/lib/pagination.ts` | M2 | 分页 |
| `src/layouts/PageLayout.astro` | M2 | page 布局 + sidebar |
| `src/components/PostList.astro` | M2 | 首页列表 + pager |
| `src/pages/index.astro` | M2 | 首页第 1 页 |
| `src/pages/[page]/index.astro` | M2 | page2+ |
| `src/pages/archive/index.astro` | M2 | 归档筛选 |
| `src/pages/about/index.astro` | M2 | About |
| `src/pages/feed.xml.ts` | M2 | RSS |
| `src/pages/sitemap.xml.ts` | M2 | 固定 `/sitemap.xml` |
| `src/pages/404.astro` | M3 | `/404.html` 粒子页 |
| `src/pages/tcupdate.astro` | M3 | `/tcupdate.html` 工具页（纯 TS，无 Vue） |
| `src/components/PdfEmbed.astro` | M3 | PDF 占位组件（帖文已静态化） |
| `src/client/features/particle404/modern-scene.ts` | M3/P1 | 现行 404 粒子；r56 bootstrap/scene/shell 已删 |
| `mig/fixtures/assets-jekyll.json` | M3+ | 当前需继续发布的静态资源 baseline（108） |
| `.github/workflows/build.yml` | M4 | Astro Pages：dist + verify |
| `Dockerfile` / `.dockerignore` | M4 | node build → nginx |
| `scripts/content/generate-lastmod.mjs` | M4 | `--check` 校验 frozen map |
| `mig/legacy/_config.yml` | M4 | 归档的 Jekyll 配置 |
| `scripts/test/eval-consistency.mjs` | eval | L1–L5 vs jekyll-site |
| `scripts/test/eval-visual.mjs` | eval | L6 Playwright 截图 diff |
| `mig/10-consistency-eval.md` | eval | 评估设计与首轮结果 |
| `mig/baselines/jekyll-site.meta.json` | eval | baseline 血统元数据 |
| `mig/fixtures/consistency-allowlist.json` | eval | 已知差异登记 |
| `public/` | M5+ | 定型静态资源（提交 Git；仅保留仍需发布的历史 URL） |
| `dist/` | M0 | Astro 构建产物（gitignore） |

---

## 常用命令

```bash
# 生产路径（Astro）
npm run dev
npm run build
npm run preview
npm run ci          # lint/typecheck/check/math/lastmod/build（CI 入口）
npm run lastmod:check
```

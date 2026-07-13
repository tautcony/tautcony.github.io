# Astro 迁移实施造册（PROGRESS）

> **用途**：单一事实源。随时打开本文件可知当前阶段、已完成项、下一步与阻塞。
> **约定**：改代码的同时更新本册；状态只允许 `todo` / `doing` / `done` / `blocked` / `n/a`。
> **集成分支**：`feat/astro-mig`（计划文档中的 `astro-migration` 等价；未另建同名分支）
> **策略**：PR1–PR4 双栈并行，不删 `_posts`/根静态源；PR5 才切 `master` 生产。

---

## 总览

| 字段 | 值 |
|------|-----|
| 当前阶段 | **M2**（M0/M1 已完成） |
| 当前 PR 切片 | PR2 主体完成；下一刀 PR3/M2 |
| 上次更新 | 2026-07-14 |
| 可接续入口 | 见下方「下一步（接续指令）」 |
| 阻塞 | 无 |

| 阶段 | 名称 | 状态 | 备注 |
|------|------|------|------|
| M0 | 脚手架与样式接入 | **done** | PR1 |
| M1 | 内容集合与文章页 | **done** | PR2：42 文 URL diff=0 |
| M2 | 列表页与站点页 | **todo** | 下一阶段 |
| M3 | 特殊页与脚本收尾 | todo | |
| M4 | CI / Docker / 切流 | todo | 合入 master |
| M5 | 稳定与清理 | todo | 持续 |

---

## 下一步（接续指令）

任意 agent/人恢复工作时：

1. 读本文件总览 + 当前阶段 checklist。
2. 读 `07-phases.md` 对应 Mn 与 `00`–`06` 相关手册。
3. 从「下一步」第一条未完成项开始；完成后把本册勾选/改状态并写 changelog。
4. 每阶段结束跑该阶段验收命令，再把阶段状态改为 `done`。

### 此刻应做（M2）

1. 首页 `index.astro`：raw-body 摘要（`mig/fixtures/excerpts.json`），每页 10 篇，排序用 `src/lib/posts.ts`。
2. 分页 `pages/[page]/index.astro`：仅 `page2+`，禁止 `/page/n`。
3. `archive/index.astro`：`#tag_cloud` / `data-encode` / `data-tags`。
4. `about/index.astro`：APlayer + about.ts + Comment pathname。
5. `feed.xml.ts`、`sitemap.xml.ts`（固定 `/sitemap.xml`，非 index）。
6. Nav 链接对齐。

**勿做**：删除 `_posts`、改 `styles/**` 语义、切 CI 到仅 Astro。

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
| D8 | PR1–4 不搬 `_posts`/根资源 | 复制/同步 | done |

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
| M0-06 | `scripts/sync-public.mjs` + public 同步 | done | gitignore `public/`；构建前同步 |
| M0-07 | `src/data/site.ts` 全量映射 | done | 含 `siteConfigMapping` |
| M0-08 | BaseLayout + Head + Meta + Nav + Footer + Sns | done | class 契约对齐 |
| M0-09 | 引入 `styles/tc-blog.scss` + heti | done | 根路径 import；不搬 styles/ |
| M0-10 | 验证脚本骨架 | done | 三脚本均 `--self-test` 绿 |
| M0-11 | package scripts | done | `dev:astro`/`build:astro`/`check:astro`/`ci:astro` |
| M0-12 | 占位首页 | done | `src/pages/index.astro` |
| M0-13 | `.gitignore` dist/.astro/public | done | |
| M0-14 | 验收 dual-stack | done | 见下方交付勾选 |

### M0 交付勾选

- [x] `astro dev` / build 可见顶栏/页脚/字体（`dist/index.html` 含 navbar/footer/fonts.css）
- [x] 不破坏现有 `npm run ci` 链路：eslint、typecheck、vite build、jekyll build 均通过
- [x] `npm run check:astro && npm run build:astro` 通过
- [x] Jekyll `_site` 不含 `src/`、`astro.config.mjs`

### M0 已知备注

- `styles` 内 `::not` 触发 lightningcss minify 警告：属既有 SCSS，**迁移期不改**。
- `blog.ts` 仍 import scss（Jekyll 需要）；Astro layout 也 import → 产物可能双链同一 CSS hash，切流前可再收敛（方案 A：样式归 layout）。
- `migrate-posts --write` 故意未实现，留给 M1。

---

## M1 — 内容集合与文章页

| ID | 任务 | 状态 | 备注 |
|----|------|------|------|
| M1-01 | 冻结/校验 legacy-post-urls 42 条 | done | fixtures + self-test |
| M1-02 | `migrate-posts.mjs` 生成 `src/content/posts` | done | 保留扩展名；不删 `_posts` |
| M1-03 | `content.config.ts` schema | done | + `.markdown` entry type 集成 |
| M1-04 | Markdown 管线 GFM/slug/高亮/raw | done | `rehype-rouge-compat` S1 |
| M1-05 | Liquid→0；PDF include；HTML title | done | 1 处 pdf-embed 静态化 |
| M1-06 | 文章路由 + legacy map | done | 含日期错位文 `/2017/04/24/...` |
| M1-07 | PostLayout 与文章组件集 | done | Intro/PostContainer/Sidebar/… |
| M1-08 | 排序 + lastmod 冻结 map | done | `src/data/lastmod.json` 42 |
| M1-09 | catalog DOM | done | `catalog: true` 输出 side-catalog |
| M1-10 | compare-routes --scope posts | done | 42/42 diff=0 |

### M1 交付勾选

- [x] 42 篇生成；schema/URL/lastmod 全命中
- [x] 文章 route diff = 0；Liquid = 0
- [x] excerpts fixture 已写 `mig/fixtures/excerpts.json`

---

## M2 — 列表页与站点页

| ID | 任务 | 状态 |
|----|------|------|
| M2-01 | 首页 + 摘要 | todo |
| M2-02 | 分页 `page2+` | todo |
| M2-03 | archive 标签筛选 DOM | todo |
| M2-04 | about + APlayer + Comment | todo |
| M2-05 | feed.xml.ts | todo |
| M2-06 | sitemap.xml.ts（非 index） | todo |
| M2-07 | Nav 链接对齐 | todo |

---

## M3 — 特殊页与脚本收尾

| ID | 任务 | 状态 |
|----|------|------|
| M3-01 | 404 粒子页 | todo |
| M3-02 | tcupdate.html preserve | todo |
| M3-03 | pdf-embed 验证 | todo |
| M3-04 | quote.json / footer 语录 | todo |
| M3-05 | 全站 compare-routes/assets + smoke | todo |

---

## M4 — CI / Docker / 切流

| ID | 任务 | 状态 |
|----|------|------|
| M4-01 | workflow 去 Ruby → Astro dist | todo |
| M4-02 | Dockerfile node→nginx | todo |
| M4-03 | package scripts 切换默认 build | todo |
| M4-04 | 删 Jekyll 遗留 + README | todo |
| M4-05 | 合 master + 线上验收 | todo |

---

## M5 — 稳定与清理

| ID | 任务 | 状态 |
|----|------|------|
| M5-01 | 仅删运行时重复源；保留 fixtures/compare | todo |
| M5-02 | Sentry release 观察 7 天 | todo |
| M5-03 | 可选后续优化（独立 PR） | todo |

---

## 变更日志（实施记录）

| 日期 | 阶段 | 摘要 |
|------|------|------|
| 2026-07-14 | M0 | 创建造册；完成 PR1/M0：Astro 7 脚手架、site.ts、壳组件、sync-public、三验证脚本骨架、双栈 exclude |
| 2026-07-14 | M1 | migrate-posts 42 篇、content collection、PostLayout、legacy URL 路由、lastmod 冻结、posts route diff=0 |

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
| `.gitignore` | M0 | dist / .astro / public |
| `src/env.d.ts` | M0 | Astro types |
| `src/data/site.ts` | M0 | 站点常量 |
| `src/layouts/BaseLayout.astro` | M0 | 默认壳 |
| `src/components/{Head,Meta,Nav,Footer,Sns}.astro` | M0 | 壳组件 |
| `src/pages/index.astro` | M0 | 占位首页 |
| `scripts/sync-public.mjs` | M0 | 根静态 → public |
| `scripts/compare-routes.mjs` | M0 | 路由 diff 骨架 |
| `scripts/compare-assets.mjs` | M0 | 资源 diff 骨架 |
| `scripts/migrate-posts.mjs` | M1 | 写盘 + PDF/Liquid/excerpt/lastmod |
| `src/content.config.ts` | M1 | posts collection schema |
| `src/content/posts/*` | M1 | 迁移副本（保留 .md/.markdown） |
| `src/data/lastmod.json` | M1 | 冻结 lastmod（sourceFilename key） |
| `src/lib/posts.ts` | M1 | URL/排序/prev-next |
| `src/lib/rehype-rouge-compat.mjs` | M1 | S1 高亮 DOM |
| `src/layouts/PostLayout.astro` | M1 | 文章布局 |
| `src/components/{IntroHeader,PostContainer,Sidebar,FeaturedTags,Comment,Katex,AnchorJS}.astro` | M1 | 文章组件 |
| `src/pages/[year]/[month]/[day]/[slug]/index.astro` | M1 | 文章路由 |
| `mig/fixtures/excerpts.json` | M1 | 摘要 fixture（供 M2） |
| `public/` | M0 | 同步产物（gitignore，构建前生成） |
| `dist/` | M0 | Astro 构建产物（gitignore） |

---

## 常用命令

```bash
# 双栈：Jekyll（现生产路径）
npm run ci

# Astro（迁移路径）
npm run sync:public
npm run dev:astro
npm run check:astro
npm run build:astro
npm run ci:astro

# 校验脚本
node scripts/compare-routes.mjs --self-test
node scripts/compare-assets.mjs --self-test
node scripts/migrate-posts.mjs --self-test

# M1 起
node scripts/migrate-posts.mjs --dry-run
node scripts/migrate-posts.mjs --write
node scripts/compare-routes.mjs --scope posts --legacy mig/fixtures/legacy-post-urls.txt --dist dist
```

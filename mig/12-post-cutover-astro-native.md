# 12 — Cutover 后：剩余「非 Astro 原生」项与改造计划

> **背景**：M0–M5 已完成 Jekyll → Astro 运行时切换；`feat/astro-mig` 代码侧 ready。  
> **问题**：大量**数据形状、注释叙事、死字段、样式/静态布局**仍按「从 Jekyll 迁过来」组织，读起来像半成品。  
> **目标**：在**不破坏历史 URL / 评论 / lastmod / 可选一致性门禁**的前提下，把业务代码与数据收成 **Astro-first**；Jekyll 只作为**冻结档案与对照基线**，不再出现在日常源码叙事里。

---

## 0. 原则

| 原则 | 含义 |
|------|------|
| **P-URL** | 文章 URL、分页 URL、`/tcupdate.html`、`/404.html`、feed/sitemap 路径 **冻结**；对照源是 `mig/fixtures/legacy-post-urls.txt` 等，不是运行时 Jekyll |
| **P-META** | `lastmod.json`、utterances `pathname`、GA / site verification **行为不变** |
| **P-ASTRO** | 业务源码（`src/**`、`styles/**`）注释与类型以「本站 Astro 实现」表述；禁止 `← _layouts/...`、`from legacy _config.yml` 作为文件头 |
| **P-ARCHIVE** | `mig/legacy/`、`mig/baselines/`、`mig/fixtures/*-jekyll*`、`scripts/test/*` **保留**，并明确标注 *historical / eval only* |
| **P-NO-DUAL** | 不再引入双栈、不再恢复 `_posts` / Liquid / Rouge 兼容层 |

**非目标（本计划不做）**

- 重写 Bootstrap 栅格 / 全站视觉 redesign  
- 删除一致性 eval（可降级为 optional，默认保留）  
- 改文章正文内容或发布时间  
- 把 `styles/` 强行搬进 `src/styles/`（单独可选切片，见 W6）

---

## 1. 剩余清单总表

按「还像不像 Astro」分类。每项：**现状 → 是否保留 Jekyll 语义 → 改造方案 → 验收**。

### A. 站点数据（配置层仍像 `_config.yml`）

| ID | 项 | 现状 | 保留的 Jekyll 语义 | 改造方案 | 验收 |
|----|----|------|-------------------|----------|------|
| A1 | `src/data/site.ts` 文件头 | 写 `from legacy _config.yml; see mig/03 §4` | 无（仅注释） | 改为：`/** Site-wide config for Astro SSG. */`；字段分组注释用英文职责名 | 无运行时 diff |
| A2 | `socialAccount[].icon: "fa-*"` | Font Awesome 死字段；Sns 用 title→SVG | 无 | **删除 `icon` 字段**；类型收窄为 `{ title, href, content? }`；Sns 仍按 `title` 选 path | `Sns` 渲染三家链接不变 |
| A3 | `navPages` 注释 | `Jekyll site.pages…` | 导航顺序 About→Archive 冻结 | 注释改为 nav 契约；可选把 Tool 并入 `navPages` 去掉 Nav 硬编码 | 导航 DOM 顺序/href 不变 |
| A4 | `rss: false` 与 feed 并存 | feed 路由仍在；开关关 RSS 链 | 历史曾关 footer RSS | **二选一**：真关则删/不生成 feed 或 robots 不指向；真开则 `rss: true` 并 footer 出链。推荐：`rss: true` 与 `/feed.xml` 对齐 | feed 200 + 页脚策略一致 |
| A5 | `baseurl: ""` | Jekyll 习惯字段 | 路径前缀能力 | 保留字段但文档写「Astro `base` 镜像」；所有拼接继续走 `site.baseurl` | 无 |
| A6 | `src/data/pages.ts` | `from Jekyll page files` | home/about/archive/404 的 title/desc/headerImg | 注释改为 page meta manifest；字段可加 `as const` 满足 IntroHeader | IntroHeader 无 silent fallback |
| A7 | `site` 与 `astro.config` 双源 | `site.url` vs `defineConfig.site` | 规范 URL | **单一来源**：`astro.config.site` 从 `site.url` import，或反之；CI 断言两者相等 | 单测或 check 脚本 |

### B. 内容模型（集合仍带迁移痕迹）

| ID | 项 | 现状 | 保留的 Jekyll 语义 | 改造方案 | 验收 |
|----|----|------|-------------------|----------|------|
| B1 | 文件名 `YYYY-MM-DD-slug.md` + `publishedDate` | 文件名日期可与 URL 日期不一致 | **URL 以 `postUrl()` / permalink 为准**（fixture 42 条） | 在 `posts.ts` 注释写清：文件名前缀仅存档 id，**不是** URL 权威；可选 `npm run verify:routes:posts` 进 PR 检查 | 42 URL diff=0 |
| B2 | `permalink?` in schema | 少数文可覆盖 URL | 与旧 `permalink` 对齐 | 保留；文档写「例外 URL」；grep 全库哪些文使用 | 有 permalink 的文 URL 不变 |
| B3 | `lastmod.json` key = 文件名 | frozen map | 「Update on」展示日期 | **保留**；`generate-lastmod.mjs` 删 `--write-jekyll` 死分支；注释去掉 M5/dual-stack | `lastmod:check` 通过 |
| B4 | 无 `legacyPath` / `sourceFilename` 字段 | 已从 schema 去掉，但 mig/05 仍写 | — | **文档修正**（D2），源码无需加回 | 文档与 schema 一致 |
| B5 | `<!--more-->` excerpt | `site.excerptSeparator` | 首页摘要切分 | 保留；实现只读 `site.excerptSeparator` | 首页摘要非空/稳定 |

### C. 页面与布局（Jekyll 谱系注释 / 契约实现）

| ID | 项 | 现状 | 保留的 Jekyll 语义 | 改造方案 | 验收 |
|----|----|------|-------------------|----------|------|
| C1 | Layout 文件头 `← _layouts/*` | Base/Page/404 | 无 | 全部改为职责说明（输入 props、挂载 client entry） | 无 |
| C2 | `sitemap.xml.ts` | 多处 “Match jekyll-sitemap” | **URL 集合 + 日期 +08:00 + attach PDF 子集** | 行为不动；注释改为「本站 sitemap 规则」并链到 `mig/fixtures` 若需 diff；常量抽出 `SITEMAP_ATTACH_PDFS` | `verify:routes` 含 sitemap 时一致 |
| C3 | `PdfEmbed.astro` 注释 | Jekyll include contract + 错误路径 | MD 内静态 HTML data 属性契约 | 注释改为 data 属性表；路径指 `src/client/features/pdf-embed.ts` | PDF 文点击仍可嵌 | 
| C4 | WeChat 0×0 图 / iOS `ontouchstart` | BaseLayout hack 注释 | 微信分享缩略图、iOS :active | **保留行为**；注释改为「Why retained」一句，不写 hack 黑话（或保留 hack 但说明平台约束） | 视觉/交互无回归 |
| C5 | `tcupdate` + simple-line-icons CDN | 与主站 SVG 体系分裂 | 下载按钮图标 | **改造**：去掉 simple-line-icons；`icon-cloud-download` → 内联 SVG（与 Sns 一致） | tcupdate 布局与下载链正常 |
| C6 | Footer Clean Blog Jekyll 链 | 主题版权 | 署名 | **保留链接**（历史事实）；文案可写 “Clean Blog (original theme)” | 无 |

### D. 客户端脚本

| ID | 项 | 现状 | 保留 | 改造方案 | 验收 |
|----|----|------|------|----------|------|
| D1 | `blog.ts` `M5: drop…` 注释 | 阶段黑话 | 无 | 删或改一句 | 无 |
| D2 | `brightness` / `corevalue` 未挂载 | 实现在 `features/`，entry 未 init | 可选彩蛋 | **二选一**：挂到 `blog.ts` 或移到 `src/client/features/_unused/` 并 README 标明；禁止半死不活 | 明确产品决策 |
| D3 | `post.ts` frozen map 长注释 | 防 GitHub API 回潮 | 有价值 | 缩成一行 + 链 `scripts/content/README` | 无 |
| D4 | 未使用 `window.jekyll` / `__TC_PAGE__` | 映射表仍写 | 无 | 确认无读取后，mig 文档删桥协议；勿引入新桥 | grep 零命中 |

### E. 样式与静态资源

| ID | 项 | 现状 | 保留 | 改造方案 | 验收 |
|----|----|------|------|----------|------|
| E1 | Prism 已原生；`search.png` 仍在 public | CSS 已用 SVG | 可删冗余 PNG | 可选删除 `public/img/search.png`（若 asset gate 报 missing 则更新 fixture 或 allowlist） | 搜索框图标正常 |
| E2 | `styles/` 在仓库根 | freeze 契约 | 路径稳定 | **可选 W6**：迁 `src/styles/` + 改 import；非本计划必做 | build OK |
| E3 | layout 注释 Font Awesome | 历史 | 无 | 改写为 “SNS circle button” | 无 |
| E4 | Bootstrap 3 类名 | 全站 DOM | **视觉契约** | 本计划**不改类名**；记入「长期债」 | — |

### F. 工具链与档案（应保留 Jekyll 语义）

| ID | 项 | 现状 | 策略 |
|----|----|------|------|
| F1 | `mig/legacy/_config.yml`、drafts | 档案 | **保留**；`mig/legacy/README` 写「只读历史，非构建输入」 |
| F2 | `mig/fixtures/*jekyll*`、`legacy-post-urls.txt` | URL/asset 门禁 | **保留**；脚本 flag 可改名 `--baseline` 别名 `--legacy`（兼容期双 flag） |
| F3 | `mig/baselines/jekyll-site` | 一致性/视觉 | **保留**直至主动退役 eval |
| F4 | `scripts/test/*` | 对照 Jekyll 树 | **保留**；package 脚本说明 “optional post-cutover gates” |
| F5 | `generate-lastmod --write-jekyll` | 死分支 | **删除** |

### G. 文档债（高优先级，低风险）

| ID | 项 | 改造方案 |
|----|----|----------|
| G1 | `mig/03` §5 路径笔误 / 过时 `tcupdate.jsx`、`window.jekyll` | 改一版「现行路径」表；旧表移到附录 Historical |
| G2 | `mig/04` Rouge/`highlighter-rouge` 要求 | 标 **superseded**：现行 Prism `pre.language-*` |
| G3 | `mig/05` 双栈、`legacyPath`、S1 DOM | 标 historical；现行 schema 与摘要流程重写一小节 |
| G4 | `mig/06` | 与 `src/client/**` 对齐；删 Vue 未完成表述若已 plain TS |
| G5 | `docs/modernization-plan.md` | 文首加 **Status: cutover done；下文大量 pre-Astro**；或拆 `docs/astro-status.md` 指到本文件 |
| G6 | `mig/PROGRESS.md` | 新增阶段 **M6 Post-cutover Astro-native** 勾选本计划 W1–W5 |

---

## 2. 改造工作包（可 PR 切片）

### W1 — 注释与死字段清理（纯 refactor，默认先做）

**范围**：A1–A3、A6、C1、C3、C4 注释、D1、D3、E3、F5  

**步骤**

1. 批量改文件头为职责说明（禁止 `← _layouts`、`from legacy _config`）。  
2. 删除 `socialAccount.icon`；修 TypeScript。  
3. 删除 `--write-jekyll` 分支。  
4. 修正 PdfEmbed / pdf-embed 路径注释。  

**风险**：极低。  
**验收**：`npm run ci`；手点首页 SNS 三图标。

### W2 — 配置单一事实源与 RSS 策略

**范围**：A4、A5、A7  

**步骤**

1. 决策 RSS：推荐 `rss: true` 与现 `/feed.xml` 对齐。  
2. `astro.config.mjs` 的 `site` 从 `src/data/site.ts` 读取（注意 config 侧 TS/加载方式；可用相对 import）。  
3. 文档：`site.url` / `baseurl` / Astro `base` 关系三行说明。  

**验收**：feed 可访问；canonical / sitemap 域名一致。

### W3 — Sitemap / 导航契约 Astro 化（行为冻结）

**范围**：A3、C2  

**步骤**

1. `sitemap.xml.ts`：抽出常量与 `formatPostLastmod`；注释不提 jekyll 包名。  
2. Nav：`navPages` 是否纳入 Tool（`/tcupdate.html`）— 若纳入，删除硬编码 `<li>Tool</li>`。  
3. 跑 `npm run verify:routes`（若本地有 fixture）。  

**验收**：sitemap URL 集合不变；导航顺序符合决策。

### W4 — tcupdate 图标 Astro/SVG 化

**范围**：C5  

**步骤**

1. 去掉 simple-line-icons CSS。  
2. ToolDownload / 动态 history 项改内联 SVG cloud-download。  
3. 微调 `tcupdate.scss` 中 `.icon` 尺寸。  

**验收**：工具页无 CDN 图标字体；下载链与 GitHub API 逻辑不变。

### W5 — 文档同步 + PROGRESS M6

**范围**：G1–G6、B4  

**步骤**

1. 本文件链入 `mig/README.md`、`PROGRESS` M6 checklist。  
2. `04`/`05` 过时 Rouge/双栈段加 **Historical** 横幅。  
3. `03` 现行路径表修正。  
4. `modernization-plan.md` 顶部状态。  

**验收**：新人只读 `12` + `PROGRESS` 不会再被指引去改 `_config.yml`。

### W6 —（可选）样式目录迁入 `src/styles/`

**范围**：E2  

**步骤**：import 路径、Docker/CI、文档一并改；**单独 PR**。  
**验收**：`npm run build`；抽检 CSS 哈希资源。

### W7 —（可选）未挂载 feature 产品决策

**范围**：D2  

- 方案 α：`blog.ts` init CoreValue + Brightness  
- 方案 β：移出主树或加 `// @internal unused`  

---

## 3. 明确「永远保留原始 Jekyll 语义」的迁移资产

以下**不是**待删除垃圾，而是 **Jekyll 时代契约的载体**；改造时只能换包装，不能改语义：

| 资产 | 语义 | 谁消费 |
|------|------|--------|
| `mig/fixtures/legacy-post-urls.txt` | 42 文最终 URL | `verify:routes:posts` |
| `mig/fixtures/routes-jekyll.txt` | 全站路由集合 | `verify:routes` |
| `mig/fixtures/assets-jekyll.json` | 静态 URL+hash 基线 | `verify:assets` |
| `src/data/lastmod.json` | 展示用更新日期 | Post 模板 / check 脚本 |
| `postUrl()` + 可选 `permalink` | 路径权威 | 列表、feed、sitemap、评论 pathname |
| `sitemap` attach PDF 子集 | 历史收录范围 | SEO 连续性 |
| `mig/baselines/jekyll-site` | 全文/视觉对照 | eval:consistency / visual |
| `mig/legacy/_config.yml` | 配置考古 | 人读；非 build |

**改造时的规则**：若 W1–W5 导致上述 diff，**必须先更新 fixture 并写原因**，禁止 silent drift。

---

## 4. 建议执行顺序与依赖

```text
W1 (注释/死字段) ──► W5 (文档)
       │
       ├──► W2 (site 单一源 / RSS)
       │
       ├──► W3 (sitemap/nav 注释与小重构)
       │
       └──► W4 (tcupdate SVG)
              │
              └──► 可选 W6 / W7
```

合 master 前：W1+W5 即可显著降低「未梳理」感。  
合 master 后：W2–W4 作为 polish PR。

---

## 5. 每项 PR 的通用验收清单

```bash
npm run ci
```

手测：首页 SNS、一篇带代码块文章、一篇 PDF、archive 标签、`/tcupdate.html`、`/404.html`。

---

## 6. 完成定义（M6 Done）

- [ ] `src/**` 文件头无 `← _layouts` / `from legacy _config.yml` / 错误路径  
- [ ] 无 `fa-*` 死字段；无 `--write-jekyll`  
- [ ] `site` 与 `astro.config.site` 单一事实源  
- [ ] RSS 策略与 feed 一致  
- [ ] tcupdate 无 simple-line-icons  
- [ ] sitemap/nav 行为不变，叙事 Astro-first  
- [ ] `mig/03–06` 过时段标 historical；`PROGRESS` 有 M6  
- [ ] 上表 F1–F4 档案仍在且 README 标明只读  

---

## 7. 与既有文档关系

| 文档 | 角色（改造后） |
|------|----------------|
| `00`–`11` | **Historical + 部分仍有效验收**；以本文件为准做 cutover 后工作 |
| `PROGRESS.md` | 增加 M6；M0–M5 保持 done |
| `docs/modernization-plan.md` | 战略考古；文首指向本文件 |

---

## 8. 附录：快速对照「上次未梳理齐」的源码命中

（执行 W1 时可当 checklist）

- `src/data/site.ts` — legacy `_config.yml` 注释；`fa-*` icon  
- `src/data/pages.ts` — Jekyll page files 注释  
- `src/layouts/BaseLayout.astro` / `PageLayout.astro` / `src/pages/404.astro` — `←` 谱系  
- `src/pages/sitemap.xml.ts` — jekyll-sitemap 叙事  
- `src/components/PdfEmbed.astro` — include contract + 路径  
- `src/client/entries/blog.ts` — M5 阶段话  
- `scripts/content/generate-lastmod.mjs` — `--write-jekyll`  
- `src/pages/tcupdate.astro` — simple-line-icons  
- `styles/layout.scss` — Font Awesome 替换说明  

---

*文档状态：plan · 2026-07-16 · W1–W3/W5/W6 done；**W4/W7 deferred**；`rss: true`；已删 `search.png`（fixture 同步 search.svg/favicon.svg）*

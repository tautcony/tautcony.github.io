# 10 — 改造前后一致性评估设计

> **状态**：已锁定决策并落地工具（`scripts/test/eval-consistency.mjs` / `scripts/test/eval-visual.mjs`）
> **基线**：`mig/baselines/jekyll-site/`（gitignore；由 `_site` 冻结）  
> **对照**：Astro 产物 `dist/`  
> **原则**：路径/资源必须严格等价；HTML 字节不必相等；DOM 契约与用户可感知行为必须等价。

### 已锁定决策（2026-07-14）

| 议题 | 决议 |
|------|------|
| Feed description | **全文对齐**（比归一化纯文本，非整段 highlighter HTML） |
| Baseline 存放 | **`mig/baselines/jekyll-site/` gitignore**；提交 `jekyll-site.meta.json` |
| CI 门禁 | **不强制**（PR 不要求 `eval:*`；`verify:routes/assets` 仍在 `ci`） |
| 视觉 L6 | **发布检查清单必做**（`npm run eval:visual`） |

---

## 0. 背景与约束

### 0.1 为何不能「再 build 一次 Jekyll」

当前 `feat/astro-mig`（M4 后）已删除：

- `Gemfile` / `bin/with-ruby` / `.ruby-version`
- `_layouts/` / `_includes/`
- 根级 Jekyll 页面（`index.html`、`about.html`、…）

因此 **无法从当前树重新 `jekyll build`**。评估必须依赖：

| 基线来源 | 说明 | 可信度 |
|----------|------|--------|
| **A. 本地 `_site/`** | 切流前最后一次 Jekyll 产物（本机仍在） | 高（完整树） |
| **B. 已入库 fixtures** | `routes-jekyll.txt`、`assets-jekyll.json`、`legacy-post-urls*`、`excerpts.json` | 高（可复现门禁） |
| **C. 线上 tautcony.xyz** | 若 master 仍是 Jekyll 部署 | 中（网络/缓存；仅作交叉验证） |
| **D. `pre-astro-*` tag 上重建** | 从保护 tag 检出再 Jekyll build | 最高（正式验收推荐） |

**设计要求**：评估流水线默认读 **A 或 D → 归一化目录 `mig/baselines/jekyll-site/`**，不要写死「在 feature 分支跑 jekyll」。

### 0.2 已确认的粗粒度结果（设计前探针）

| 层 | 结果 | 备注 |
|----|------|------|
| HTML/XML 路由集合 | **53 = 53** | 与 `routes-jekyll.txt` 一致 |
| Sitemap `<loc>` | **54 = 54** | 无差集 |
| 稳定静态资源 | **108 = 108**，抽检 PDF hash 一致 | 与退役资源清理后的 `assets-jekyll.json` 一致 |
| 首页帖序 / page5 帖序 | **一致** | |
| archive `data-encode` | **42 标签一致** | |
| feed 条目 link/title 序 | **一致** | |
| feed `<description>` 体积 | **site ≫ dist**（约 310KB → 39KB 单条） | **需定策略**（见 §3.4） |
| 文章 HTML 体积 | dist 普遍更小 | 资源路径 / 高亮 DOM / 内联差异，预期内 |
| `highlighter-rouge` 出现次数 | 不完全相同 | 需 DOM 契约比较，禁止整页 HTML 相等断言 |
| 404 body class | Jekyll 运行时 script 注入 vs Astro 静态 class | 行为等价即可 |

结论：**URL/资源层已绿；内容/DOM/交互层需要结构化评估，不能只靠 route+hash。**

---

## 1. 评估目标与非目标

### 1.1 目标（P0）

证明 Astro `dist` 相对 Jekyll `_site`：

1. **不丢 URL、不多幽灵 URL**（用户书签 / 搜索引擎）
2. **静态附件与字体等字节级一致**（PDF、图片、CNAME、robots…）
3. **列表序、摘要、标签、feed/sitemap 语义一致**
4. **关键 DOM 契约仍在**（脚本可挂载：archive tags、pdf-embed、quote、404 粒子、tcupdate）
5. **已知差异有登记**（allowlist），无未解释 diff

### 1.2 非目标（明确不比）

| 不比 | 原因 |
|------|------|
| 整页 HTML 字节 / 格式化空白 | Astro/Vite 压缩与属性顺序必然不同 |
| `/assets/build/*` vs `/_astro/*` 文件名 | 打包器哈希路径，允许变 |
| CSS/JS 包体积完全相等 | 入口合并方式不同 |
| Liquid 注释 `<!-- -->`、Jekyll 特有 meta | 已废弃运行时 |
| 完全像素级 0-diff 截图 | 允许阈值；字体 hinting/子像素有平台差 |

---

## 2. 评估架构

```text
                    ┌─────────────────────────┐
                    │  Baseline (immutable)   │
                    │  _site/ 或 tag 重建产物  │
                    │  → mig/baselines/jekyll │
                    └───────────┬─────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
   L1 路由集合              L2 静态资源              L3 结构化内容
   routes / sitemap         URL+size+sha256         列表序/摘要/标签/
   feed 条目 loc            Markdown 引用可达性       lastmod/title/meta
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                ▼
                     L4 DOM 契约（cheerio）
                     class/id/data-* 探针矩阵
                                │
                                ▼
                     L5 交互 smoke（preview + 可选 Playwright）
                     quote / pdf 点击 / tag 筛选 / 404 flags
                                │
                                ▼
                     L6 视觉（可选，六类页 × 2 viewport）
                                │
                                ▼
                     REPORT: mig/reports/consistency-YYYYMMDD.{md,json}
```

**编排入口（实施时）**：

```bash
# 设计中的统一命令（尚未实现）
npm run eval:consistency -- \
  --legacy mig/baselines/jekyll-site \
  --dist dist \
  --out mig/reports/consistency-latest
```

---

## 3. 分层规范（L1–L6）

### L1 — 路由与 SEO 文件（严格）

| 检查项 | 方法 | 通过标准 |
|--------|------|----------|
| HTML/XML 路径集合 | 规范化后 set diff（现有 `compare-routes`） | diff = 0 或仅 allowlist |
| 路径规范化 | `/foo/index.html` → `/foo/`；保留 `.html/.xml` 后缀文件 | 与现脚本一致 |
| `sitemap.xml` | 解析全部 `<loc>` | 集合相等；无 sitemap-index |
| `feed.xml` | 解析 channel + item 的 link/title/pubDate/categories | **条目集合与顺序**一致；body 见 §3.4 |
| `robots.txt` | 全文或关键行 | 含生产 sitemap URL |
| `CNAME` | 存在且内容 | `tautcony.xyz` |
| 特殊页 | 文件存在 | `/404.html`、`/tcupdate.html` 为 **文件** 非目录 |

**样本路由表（必跑）**：

| 类型 | 路径 |
|------|------|
| 首页 | `/` |
| 分页 | `/page2/` … `/page5/` |
| 站点 | `/about/` `/archive/` |
| 特殊 | `/404.html` `/tcupdate.html` |
| 数据 | `/feed.xml` `/sitemap.xml` `/robots.txt` |
| 旧帖 | `/2016/03/22/hello-github-io/` |
| 日期错位帖 | `/2017/04/24/14th-ZJ-Programming-Contest/` |
| PDF 帖 | `/2016/08/08/rubiksrevenge/` |
| 新帖 | `/2023/09/13/unpack-webpack-by-chatgpt/` |

### L2 — 静态资源（严格）

| 检查项 | 方法 | 通过标准 |
|--------|------|----------|
| 前缀清单 | `/img` `/attach` `/fonts` `/css` `/json` `/arknights` `/contents` `/favicon.ico` `/CNAME` `/robots.txt` | 现有 `compare-assets` |
| 字节+sha256 | 对 baseline 与 dist 同 path | 全等 |
| 文内引用 | 从 Markdown/HTML 抽 `/attach/*` `/img/*` 等 | HTTP 200 或文件存在 |
| 404 当前贴图 | `/img/box_bck.png`、`/img/404-bg.jpg` | 存在 |

**排除**：`/_astro/**`、`/assets/build/**`（构建产物）以及显式退役的 `/img/404/{disc.png,inner_bck.jpg,particle_tr.png}`。其余资源继续做严格 hash 对齐。

### L3 — 结构化内容（语义严格）

对每篇文章 / 列表页提取 **归一化 JSON 快照**，再 diff：

#### 3.1 文章页 snapshot 字段

```ts
type PostSnapshot = {
  route: string;
  titleText: string;          // strip tags
  subtitleText?: string;
  publishedDisplay: string;   // "March 22, 2016" 类
  lastmodDisplay: string;     // #update-date 文本
  tags: string[];             // 有序
  headerImg?: string;         // 背景 url 规范化
  bodyTextHash: string;       // 见下
  bodyTextSample: string;     // 前 200 字，报告用
  hasMath: boolean;           // katex / mathjax 痕迹
  hasPdfEmbed: boolean;
  pdfFiles: string[];
  catalog: boolean;           // side-catalog 是否出现
  highlighterBlocks: number;  // .highlight / pre>code 计数（契约，非 class 名强制）
};
```

**`bodyTextHash` 算法（必须固定）**：

1. 取正文容器（优先 `.post-container` / `.heti` 内文章主体，排除 nav/footer/sidebar/comment）
2. 去掉 `script`/`style`
3. 解码常见实体，collapse 空白
4. **可选**：去掉纯标点差异规则（登记后）
5. SHA-256

通过标准：

- `route/title/tags/lastmod/published`：**全等**
- `bodyTextHash`：**全等**；若因高亮/公式 DOM 导致纯文本仍应全等——若不等，记入缺陷而非 allowlist
- `hasPdfEmbed` / `pdfFiles`：与 baseline 一致

#### 3.2 列表 / 归档

| 页 | 提取 | 标准 |
|----|------|------|
| `/` `/pageN/` | 有序 post URL 列表 + 每帖 excerpt 文本 hash | 与 baseline 全等；excerpt 可对齐 `excerpts.json` |
| `/archive/` | `data-encode` 全集、`.js-tags`/`.js-result` 存在、每帖 `data-tags` | encode 集合相等 |

#### 3.3 页 meta

| 字段 | 页 | 标准 |
|------|-----|------|
| `<title>` 归一化 | 全部样本 | 允许尾部 SEO 拼接规则一致即可 |
| `meta[name=description]` | 首页/about/archive/404 | 与 baseline 文本相等 |
| `link[rel=canonical]` | 文章 | path 一致 |
| `html[lang]` | 主站 | `en` |

#### 3.4 Feed description 策略（决策点）

探针显示 **条目 link/title 一致，但 description 体积差一个数量级**。设计要求实施前锁定一种策略：

| 选项 | 含义 | 建议 |
|------|------|------|
| **A. 语义等价** | 比 item 的 link/title/pubDate/categories；description 仅检查「非空 + 含标题关键词」 | **推荐默认**（RSS 读者通常看摘要） |
| **B. 全文等价** | description HTML 纯文本 hash 对齐 Jekyll 全文 | 工作量大；需确认 Astro feed 是否应吐全文 |
| **C. 登记差异** | 明确「Astro feed 使用摘要/截断」并写入 allowlist | 若产品接受 |

**在未改 feed 实现前，评估报告将 L3-feed-body 标为 `known-delta`，不阻断 L1。**

### L4 — DOM 契约矩阵（脚本可运行性）

用 cheerio（或 node html parser）对 baseline 与 dist **并行探针**，比较布尔/计数，不比较 outerHTML。

| 页面 | 探针 ID | 选择器 / 条件 | 严格度 |
|------|---------|---------------|--------|
| 全局壳 | `nav.brand` | `.navbar-brand` | 必须 |
| 全局壳 | `footer.copyright` | `.copyright`（quote 挂载点） | 必须（tcupdate 除外） |
| 全局壳 | `main` | `#main-content` | 必须（tcupdate 除外） |
| 全局壳 | `gotop` | `#gotop` / `.back-to-top` | 必须 |
| 文章 | `post.tags` | `.post-heading .tag` 数量 | 必须 |
| 文章 | `post.prevnext` | pager 链接存在（非首末边界） | 必须 |
| 文章 | `post.pdf` | `.pdf-embed[data-pdf-file]` | 有则必须 |
| 文章 | `post.catalog` | `catalog: true` 文 → `.side-catalog` 或等价 | 必须 |
| 文章 | `post.code` | `pre`/`code`/`.highlight` ≥1（代码文） | 必须 |
| 归档 | `archive.cloud` | `#tag_cloud` + `.js-tags` + `.js-result` | 必须 |
| 归档 | `archive.encode` | `[data-encode]` 数 = baseline | 必须 |
| about | `about.aplayer` | APlayer 容器/脚本痕迹 | 必须 |
| about | `about.utterances` | utterances 配置 / container | 必须 |
| 404 | `404.container` | `#container` + `.fallback` | 必须 |
| 404 | `404.noLegacyThree` | 有 page404 module，且无 three.js r56 classic script | 必须 |
| 404 | `404.flags` | page404 bundle 存在 | 必须 |
| 404 | `404.bodyclass` | 最终含 `page-fullscreen`（静态或等价说明） | 必须 |
| tcupdate | `tc.section` | `#tool-downloads` | 必须 |
| tcupdate | `tc.custom` | `download-link` / `history-download` | 必须 |
| 首页 | `home.pager` | 指向 `/page2/` | 必须 |

**失败定义**：baseline 为 true、dist 为 false → **P0 缺陷**。  
dist 多出的 class（如 heti）→ 记录为 info，不失败。

### L5 — 运行时 smoke（preview）

`astro preview`（或 `npx serve dist`）上：

| ID | 步骤 | 期望 |
|----|------|------|
| H1 | GET 样本路由 | 全部 200 |
| H2 | GET `/json/quote.json` | 200，JSON 数组长度 > 0 |
| H3 | GET PDF 附件 | 200 |
| H4 | 首页 HTML 含 blog entry `/_astro/*blog*` 或 BaseLayout script | 有 module |
| H5 | 404 HTML 含 page404 module，且不含 r56 classic script | 有 |
| H6 | tcupdate HTML 含 Vue entry module | 有 |
| H7* | Playwright：点 PDF 按钮 | `object[type="application/pdf"]` 或打开/下载 fallback 出现（可选） |
| H8* | Playwright：`/archive/?tag=...` | 筛选后可见条目变化（可选） |
| H9* | Playwright：404 `?perf=true` | 无 console error（可选） |

\* 标星为二期；一期可用 curl/fetch + 静态契约代替。

### L6 — 视觉（可选，合入前建议做一次）

| 页 | viewport |
|----|----------|
| `/` `/archive/` `/about/` 一篇文 `/404.html` `/tcupdate.html` | 1440×900、390×844 |

- 工具：Playwright screenshot  
- 基线：从 jekyll-site 静态服截一次 → `mig/fixtures/visual/baseline/`  
- 阈值：像素 diff 比率登记；导航/页脚错位为 fail，字体微调为 warn

---

## 4. 基线固化流程（实施第一步）

在写比较器之前先 **冻结** Jekyll 树，避免误删 `_site`：

```bash
# 推荐：复制为仓库外或 mig 下大文件（gitignore）
mkdir -p mig/baselines
rsync -a --delete _site/ mig/baselines/jekyll-site/

# 记录血统
{
  "source": "_site",
  "capturedAt": "<ISO>",
  "gitBranch": "feat/astro-mig",
  "note": "Pre-cutover Jekyll artifact; do not rebuild from current tree",
  "htmlXmlCount": 53,
  "fileCount": 172
} > mig/baselines/jekyll-site.meta.json
```

**gitignore**：`mig/baselines/jekyll-site/`（体积大）；只提交 `*.meta.json` + 小 fixture。  
正式发布前用 **tag 重建** 再生成一份 baseline 覆盖，防本机 `_site` 过期。

从 tag 重建（合入前 runbook）：

```bash
git worktree add /tmp/pre-astro pre-astro-YYYYMMDD
cd /tmp/pre-astro
npm ci && npm run lastmod && bundle exec jekyll build
rsync -a _site/ /path/to/repo/mig/baselines/jekyll-site/
```

---

## 5. 报告格式

`mig/reports/consistency-YYYYMMDD.json`：

```json
{
  "baseline": "mig/baselines/jekyll-site",
  "candidate": "dist",
  "layers": {
    "L1_routes": { "ok": true, "legacy": 53, "dist": 53, "missing": [], "extra": [] },
    "L2_assets": { "ok": true, "legacy": 111, "changed": [] },
    "L3_content": { "ok": false, "failedPosts": [], "feedBody": "known-delta" },
    "L4_dom": { "ok": true, "failedProbes": [] },
    "L5_http": { "ok": true },
    "L6_visual": { "ok": null, "skipped": true }
  },
  "allowlist": [
    { "id": "feed-description-size", "layer": "L3", "reason": "..." }
  ],
  "summary": "PASS_WITH_KNOWN_DELTAS | FAIL | PASS"
}
```

人类可读：`consistency-YYYYMMDD.md`（表格 + 失败探针详情）。

**门禁建议**：

| 场景 | 阻断层 |
|------|--------|
| CI（已有） | L1 + L2（fixtures） |
| 合 master 前本地/PR job | L1–L4 + L5 基础 HTTP |
| 可选 nightly | L5* + L6 |

---

## 6. Allowlist 治理

所有「预期不同」必须写入 `mig/fixtures/consistency-allowlist.json`：

```json
[
  {
    "id": "asset-bundle-path",
    "layer": "L4",
    "probe": "script[src*=_astro]",
    "reason": "Vite multi-entry → Astro hashed modules",
    "severity": "permanent"
  },
  {
    "id": "feed-description-size",
    "layer": "L3",
    "reason": "TBD: excerpt vs full content policy",
    "severity": "until-feed-decision"
  },
  {
    "id": "404-body-class-static",
    "layer": "L4",
    "reason": "Astro sets body class at SSG; Jekyll used inline script — equivalent",
    "severity": "permanent"
  }
]
```

规则：**无 id 的 diff = 缺陷**；有 id 的 diff 进报告但不 fail（除非 `severity` 过期）。

---

## 7. 与现有工具的关系

| 现有 | 角色 | 缺口 |
|------|------|------|
| `compare-routes.mjs` | L1 集合 | 不能读 `_site` 目录（仅 list 文件）；可扩 `--legacy-dir` |
| `compare-assets.mjs` | L2 | 可扩 `--legacy-dir` 直接扫 `_site` |
| `excerpts.json` | L3 摘要 | 未自动 vs dist DOM |
| `legacy-post-urls.*` | L1 posts | 已绿 |
| fixtures only | CI 可复现 | 不替代完整 `_site` 内容比 |

**实施增量（建议拆 PR）**：

1. **P0**：固化 baseline 目录 + 扩展 compare 支持 `--legacy-dir _site`  
2. **P0**：`scripts/test/eval-consistency.mjs` 实现 L1–L4 + JSON 报告
3. **P1**：feed 策略决策 + 必要时改 `feed.xml.ts`  
4. **P1**：L5 HTTP smoke 并入 `npm run eval:consistency`  
5. **P2**：Playwright 视觉  

---

## 8. 执行顺序（建议）

```text
Day 0  设计评审（本文）→ 锁定 feed 策略 A/B/C
Day 1  rsync 冻结 _site → baselines；扩展 compare --legacy-dir
Day 1  实现 L1–L4 报告；修 P0 DOM/内容缺陷（若有）
Day 2  L5 smoke；feed 若选 B 则改实现
Day 2  可选 L6；更新 PROGRESS / 09-acceptance 勾选
合入前  tag 重建 baseline 再跑一遍（防本机 _site 漂移）
```

---

## 9. 成功定义（评估本身的 DoD）

- [ ] baseline 元数据可追溯（来自哪次 Jekyll / 哪个 tag）
- [ ] 一键命令产出 JSON + Markdown 报告
- [ ] L1/L2 相对 `_site` 与相对 fixtures **双绿**
- [ ] L3 文章 bodyTextHash 与列表序全绿（或仅 allowlist）
- [ ] L4 契约矩阵无 P0 失败
- [ ] feed 策略已文档化并反映在 allowlist 或实现中
- [ ] 合入清单 `09-acceptance` 中路由/资源/内容相关项可据此勾选

---

## 10. 风险

| 风险 | 缓解 |
|------|------|
| 本机 `_site` 与线上不一致 | 用 `pre-astro` tag 重建 |
| bodyTextHash 因高亮插入零宽字符失败 | 归一化步骤去掉 BOM/ZWSP；先比纯文本 |
| 误把打包路径差异当缺陷 | L2 排除 `/_astro`；allowlist |
| 评估脚本过慢 | L3 仅 42 文 + 固定样本页；L6 可选 |
| 无 Jekyll 后无法更新 baseline | baseline 冻结；新内容只相对 fixtures 演进 |

---

## 11. 已拍板并落地

| 议题 | 决议 | 落地 |
|------|------|------|
| Feed | **全文对齐**（prose 精确 + code 归一化） | `eval-consistency` L3 |
| Baseline | **gitignore** `mig/baselines/jekyll-site/` | 提交 `jekyll-site.meta.json` |
| CI | **不强制** | 未写入 `npm run ci` |
| 视觉 | **发布 checklist 必做** | `npm run eval:visual` |

### 命令

```bash
# 冻结 baseline（一次性 / tag 重建后）
rsync -a --delete _site/ mig/baselines/jekyll-site/

npm run build
npm run eval:consistency   # L1–L5 → mig/reports/consistency-latest.md
npm run eval:visual        # L6 → mig/reports/visual-latest.md（需 playwright chromium）
npm run eval:all
```

### 首轮结果（本机，2026-07-14）

| 层 | 结果 |
|----|------|
| L1 routes / sitemap | PASS 53/53 · 54 loc |
| L2 assets | PASS 108/108 |
| L3 full content | PASS_WITH_KNOWN_DELTAS（高亮/RSS 转义 near-match 入 allowlist） |
| L4 DOM | PASS |
| L5 HTTP | PASS |
| L6 visual | PASS（桌面阈值 6%，移动 14%；404 屏蔽粒子 JS、统一使用 header fallback 背景） |

---

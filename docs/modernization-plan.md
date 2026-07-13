# TC Blog 完整代码审查与现代化方案

> 文档日期：2026-07-12  
> 仓库：`tautcony/tautcony.github.io`  
> 范围：Jekyll 站点、TypeScript/Webpack 前端、CI/Docker、静态资源与模板  
> 目标：便于长期维护；按 Phase 落地，每完成一个 Phase 单独 commit

---

## 0. 已确认决策（实施依据）

| 议题 | 决策 |
|------|------|
| 总体路径 | **路径 A**：保留 Jekyll，现代化前端与工程化 |
| 实施范围 | **Phase 0–3** 全做；每 Phase 单独 commit |
| Service Worker | **删除**（不需要离线能力；清理 `sw.js` / 注册逻辑） |
| PDF.js | **保留**，改为 **按需加载**（文章内嵌 viewer，非首屏必载） |
| 数学公式 | **换成 KaTeX**（替换 MathJax 2/3 混用） |
| 字体 | **只删 `fonts/ttf`**，保留全部 woff2 |
| `tcupdate` | **暂保留 Vue**，只并入统一构建 |
| anime.js | **尽量用 CSS / `scrollTo` 替代，能删则删** |
| `html lang` | **保持 `en`** |
| 其它默认 | Sentry DSN 仍可前端公开；Title 恶搞保留；eslint 纳入 `ci` |

---

## 1. 现状总览

### 1.1 技术栈

| 层级 | 现状 | 评价 |
|------|------|------|
| 静态站点 | Jekyll + `github-pages` gem，Ruby **3.3**（显式拒绝 4.x） | 与 GitHub Pages 对齐，合理 |
| 部署 | GitHub Actions → `upload-pages-artifact` + `deploy-pages` | 已现代化，优于旧 `gh-pages` 分支流 |
| 前端语言 | TypeScript（`ts/`，约 50+ 源文件） | 方向正确；严格度与模块体系偏旧 |
| 打包 | Webpack 5 + Babel + `ts-loader(transpileOnly)` | 可用，但与现代 Vite 工具链比维护成本更高 |
| 样式 | Less 主站样式 + Sass（仅 heti）+ PostCSS | 双预处理器并存，认知负担大 |
| UI 基座 | Bootstrap **3.4.1** + bootstrap.native 2 + Font Awesome **4.7** | 严重过时 |
| 监控 | Sentry Browser + GA4 | 有可观测性，但配置硬编码 |
| 评论 | utterances | 轻量，适合个人博客 |
| 特殊页 | 404 粒子（Three.js **r56** 定制）+ `tcupdate`（Vue 3 JSX） | 功能有个性，但技术债集中 |

### 1.2 架构简图

```
Markdown posts (_posts/)
        │
        ▼
   Jekyll (Liquid + kramdown)
        │
        ├── layouts / includes  ──► HTML
        │
ts/ + less/ ── Webpack ──► js/*.min.js, css/*.min.css  (gitignore)
        │
        ▼
     _site/  ──► GitHub Pages / nginx(Docker)
```

### 1.3 已做得较好的部分（审查肯定项）

- 近期已完成一轮现代化：去掉 jQuery 依赖路径、ESLint flat config、Node 22 / Ruby 3.3 锁定、Pages 官方 Actions 部署、404 粒子 TS 化、`bin/with-ruby` 规避 Ruby 4 兼容坑。
- `npm run ci` 串起 typecheck + 前端构建 + Jekyll build，CI 路径清晰。
- 构建产物 `*.min.js/css` 已 gitignore，避免「源码与产物双轨提交」。
- 评论、分析、侧栏、特性开关大多集中在 `_config.yml`，可配置性尚可。
- 外链 JS（bootstrap.native / pace / anime / MathJax CDN）多数带了 **SRI**。

### 1.4 主要风险画像

| 风险 | 严重度 | 说明 |
|------|--------|------|
| 前端基座过旧（BS3 / FA4 / MathJax 配置错位） | 高 | 安全、无障碍、可维护性同时受影响 |
| 仓库体积膨胀（fonts ~180MB、pdfjs ~16MB） | 高 | clone / CI / 维护成本 |
| 资源无 content-hash + 大包（`tc-blog.min.js` ~680KB） | 中高 | 缓存与首屏性能 |
| TypeScript 严格度不足 + 全局污染 | 中 | 回归风险、重构阻力 |
| 死代码（SW 注册逻辑、旧入口、双配置复制） | 中 | 误导后续维护者 |
| 双工具链 + 双预处理器 | 中 | 新人上手成本 |

---

## 2. 战略选择：三条现代化路径

个人博客的现代化**不必然**等于换框架。推荐按「迁移成本 / 维护收益」权衡。

### 路径 A — 保留 Jekyll，现代化前端工具链（**推荐默认**）

**做法**：继续用 Jekyll 管内容与 HTML；把 Webpack → **Vite**；Less → **原生 CSS / 单一 Sass**；逐步换掉 BS3/FA4；清理死资源。

| 优点 | 缺点 |
|------|------|
| 不动 ~40 篇历史 Markdown 与 Liquid 模板语义 | 仍受 `github-pages` gem 版本滞后约束 |
| 与现有 CI / Ruby 工具链兼容 | 前端与 Jekyll 仍是「双进程开发」 |
| 增量改造，可 PR 拆分 | 主题骨架仍是 Clean Blog 衍生 |

**适合**：希望继续写 Markdown、继续免费 GitHub Pages、降低破坏面。

### 路径 B — 迁移到 Astro / Eleventy（内容可迁）

**做法**：`_posts` 迁到 `src/content`（Astro Content Collections 或 11ty）；组件化布局；Vite 原生；可选 SSG 到 Pages。

| 优点 | 缺点 |
|------|------|
| 单语言工具链（几乎可去掉 Ruby） | 模板、插件、permalink、分页需重写 |
| 组件、图片优化、MDX 生态更好 | 一次性迁移成本高 |
| 类型与构建体验更统一 | 需要验证历史 URL 不 404 |

**适合**：愿意花 1–2 周做「断代升级」，并长期还想写较多交互页。

### 路径 C — 极简静态（Hugo / 纯 Markdown + 最小 CSS）

**做法**：只保留文章 + 极简主题，删掉粒子 404、tcupdate、复杂前端。

| 优点 | 缺点 |
|------|------|
| 维护面最小 | 失去现有视觉与互动个性 |
| 构建极快 | 与「有特色的个人站」定位可能冲突 |

**建议结论**：  
- **短期（0–3 个月）走路径 A**，把债清干净、把基座升上去。  
- **中期再评估路径 B**：若发现 `github-pages` / Ruby 版本继续拖后腿，再迁 Astro。  
- 路径 C 仅当明确要「归档站」时考虑。

下文默认以 **路径 A** 为实施主线，并标注可复用到 B 的改动。

---

## 3. 问题清单与修复建议（按领域）

严重度：🔴 高 / 🟠 中 / 🟢 低

### 3.1 正确性 / 明显缺陷

#### 🔴 MathJax v2 配置 + v3 脚本混用

**位置**：`_layouts/post.html`

```html
<script type="text/x-mathjax-config">
  MathJax.Hub.Config({ ... });  <!-- MathJax 2 API -->
</script>
<script async src=".../mathjax/3.2.2/es5/tex-mml-chtml.min.js"></script>
```

**问题**：`MathJax.Hub` 是 v2 API；CDN 拉的是 v3。配置大概率**静默失效**，公式渲染行为不可预期。

**修复建议**：

1. 统一到 **MathJax 3**：

```html
<script>
  window.MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true,
    },
    options: {
      skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
    },
  };
</script>
<script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
```

2. 或改用 **KaTeX**（构建期或运行时），体积与首屏通常更好。  
3. 仅在含数学的文章 `layout` / front matter 里加载（按需），不要全站默认。

#### 🔴 Service Worker 处于「半死」状态

**位置**：`sw.js`、`js/sw-registration.js`、`ts/entries/blog.ts`

- 注册代码被注释 / 主动 `unregister()`。  
- 但仓库仍保留完整 SW 实现与 offline 资源列表。  
- `blog.ts` 每次访问会注销所有 SW。

**问题**：维护者容易误以为离线能力仍在；历史用户缓存策略与当前行为不一致；死代码干扰审查。

**修复建议（二选一，明确决策）**：

| 选项 | 做法 |
|------|------|
| **删除离线能力（推荐）** | 删除 `sw.js`、`sw-registration.js`、`offline.html` 中相关逻辑；保留短暂 `unregister` 迁移期（例如 3–6 个月）后也删掉 |
| **真正修好** | 用 Workbox 生成预缓存清单；content-hash 资源；只缓存静态资源，HTML 用 network-first；版本化 `CACHE` 名；在 CI 中集成 |

不要维持「有文件但不启用」的中间态。

#### 🟠 文章「最后更新」路径猜测脆弱

**位置**：`ts/pages/post.ts`

```ts
const filename = `_posts/${window.location.pathname.split("/").filter(_ => _).join("-")}.markdown`;
```

**问题**：

- 仓库同时存在 `.markdown` 与 `.md` 扩展名。  
- 依赖 GitHub Commits API（无 token 有严格 rate limit）。  
- `innerHTML` 写入日期字符串虽当前风险低，但 API 形状变化时缺少校验。

**修复建议**：

1. 优先使用 `window.jekyll.page.path`（已注入），删除路径猜测回退或仅作 last resort。  
2. 构建期用 Jekyll / 插件写入 `last_modified_at`（如 `jekyll-last-modified-at`，需确认 Pages 兼容）或 CI 生成 JSON map。  
3. 用 `textContent` 代替 `innerHTML`。  
4. 对 API 响应做 `Array.isArray` 守卫。

#### 🟠 `html lang="en"` 与主体内容语言不一致

**位置**：`_layouts/default.html` → `lang="en"`

站点标题与大量正文为中文。对 SEO / 无障碍不友好。

**修复建议**：改为 `lang="zh-Hans"`，或按 page front matter 覆盖；多语言块（如 about 的 K-ON 段）用元素级 `lang`。

---

### 3.2 依赖与前端基座

#### 🔴 Bootstrap 3.4.1 + Font Awesome 4.7

**位置**：`_includes/head.html`、大量 Less 中的栅格/组件类名

**问题**：

- Bootstrap 3 已 EOL；无障碍与现代布局能力不足。  
- FA4 图标字体全量加载；CDN CSS **无 SRI**（而脚本有）。  
- 主题 Less 与 BS3 类名深度耦合（`col-lg-offset-*`、`visible-lg-block` 等）。

**修复建议（分两阶段）**：

1. **短期减负**  
   - 给 CDN CSS 补 `integrity` + `crossorigin`。  
   - 图标改为 **SVG sprite / 内联 SVG / lucide**，去掉 FA 全量 CSS。  
   - 审计实际用到的 BS 组件，删除未用 CSS（或换 purge）。

2. **中期换基座**  
   - 用 **原生 CSS Grid/Flex + 少量自定义工具类** 替换栅格（博客页面结构简单，完全可去 BS）。  
   - 导航、分页、表格样式下沉到自有 CSS。  
   - 删除 `bootstrap.native`（若不再依赖 modal/tooltip 等）。

> 不建议「升级到 Bootstrap 5 再继续依赖一整套 UI 框架」——对个人博客收益低、类名迁移成本高。目标应是 **去框架化或极薄工具层**。

#### 🟠 anime.js 双通道依赖

- `package.json` 有 `animejs`  
- HTML 又从 CDN 以全局 `anime` 注入  
- Webpack `externals` 映射到全局

**问题**：版本可能漂移；本地类型与 CDN 运行时不对齐；离线/隐私场景 CDN 失败则动画挂。

**修复建议**：

- 选定一种：要么 **全部打包进 bundle**（去 CDN、去 externals），要么 **全部 CDN + importmap / 明确 globals 类型声明**。  
- 个人站更推荐 **打包进主 bundle 的一小块**，减少请求瀑布；或评估是否可用 CSS `scroll-behavior` 替代回顶动画。

#### 🟠 axios 用于极简单请求

**位置**：`ts/Lib/quote.ts`、`js/tcupdate.js`

现代浏览器 `fetch` 足够；axios 增加包体积与 API 面。

**修复建议**：统一 `fetch` + 薄封装 `getJSON<T>()`；`tcupdate` 同步替换。

#### 🟠 Vue 3 仅服务 `tcupdate` 一页

**位置**：`js/tcupdate.js` + `build/webpack.update.conf.js`

为单页引入 Vue + JSX Babel preset + 独立 webpack 配置，**边际维护成本极高**。

**修复建议**：

1. 用原生自定义元素 / 几十行 DOM 代码重写下载列表；或  
2. 若坚持组件化，改为 **Vite 多页入口** 下的轻量 TS 模块，去掉 Vue。  

`tcupdate` 不应再有一套「特殊构建宇宙」。

#### 🟢 重复的仓库元数据

`package.json` 的 `repository` 与根目录 `repo.json` 重复。

**修复建议**：构建时从 `package.json` 注入，或 Jekyll `site.data` 单一来源。

---

### 3.3 构建系统与工程化

#### 🔴 资源无 content-hash，缓存策略脆弱

输出固定名：`js/tc-blog.min.js`、`css/tc-blog.min.css`。

**问题**：浏览器 / CDN 强缓存时用户可能长期拿到旧 JS；反过来只能靠短缓存牺牲性能。

**修复建议**：

```
js/tc-blog.[contenthash:8].js
css/tc-blog.[contenthash:8].css
```

Jekyll 侧用 data 文件或构建脚本生成 `assets-manifest.json`，模板引用：

```liquid
<script src="{{ site.data.assets['tc-blog'].js }}"></script>
```

Vite 的 `manifest.json` 可直接支撑该模式。

#### 🟠 Webpack 配置重复、CommonJS、`transpileOnly` 无守护

**位置**：`build/webpack.*.conf.js`

- `base` 与 `update` 大量复制 babel/loader。  
- `ts-loader: { transpileOnly: true }` 意味着 **打包不会因类型错误失败**；仅靠 CI 单独 `tsc` 兜底（目前有，需保持）。  
- `require` 风格配置与 TS 源码 ESM 风格割裂。

**修复建议（路径 A 的核心）**：

1. **迁移 Vite**（或至少 webpack 配置 ESM 化 + 抽 shared config）。  
2. 多入口：`blog` / `page404` / `tcupdate` 同一配置。  
3. 类型检查：`vue-tsc`/`tsc -b` 在 CI 与 `prebuild` 强制；本地可用 `vite-plugin-checker`。  
4. 删除 `tslint` 脚本别名（名不副实，易误导）。

#### 🟠 TypeScript 编译选项偏旧、严格度不够

**位置**：`tsconfig.json`

| 选项 | 现状 | 建议 |
|------|------|------|
| `target` | `es6` | `ES2022`（与 browserslist evergreen 一致） |
| `module` | `CommonJS` | `ESNext` + bundler resolution |
| `moduleResolution` | `node` | `bundler` |
| `noImplicitAny` | `false` | 逐步 `true` |
| `strict` | 未开全 | 目标 `strict: true` |
| `jsx` | `react` | 若去掉 Vue JSX 则删除；否则 `preserve` + 明确工厂 |
| `experimentalDecorators` | `true` | 未使用则关 |

**落地策略**：先 `strictNullChecks`（已有）→ 开 `noImplicitAny` 修一波 → 全 `strict`。不要一次 PR 全开导致不可审。

#### 🟠 Babel + core-js 对 evergreen 目标过重

`useBuiltIns: "usage"` + `core-js` 对「defaults, not IE 11」目标通常可大幅削减。

**修复建议**：

- browserslist 已声明无 IE：可评估 **去掉 Babel**，仅用 esbuild/swc（Vite 默认）转译。  
- 若保留 Babel：`bugfixes: true` 已开，确认 `targets` 读 browserslist，避免无谓 polyfill。  
- 主包 ~680KB 应用 `source-map-explorer` / rollup-plugin-visualizer 做一次体积归因。

#### 🟠 `_config.yml` exclude 不完整

已排除 `eslint.config.js`，实际文件是 **`eslint.config.mjs`**；另有 `bin/`、`docs/`、`.github/`、`.nvmrc`、`.ruby-version`、`.lesshintrc` 等可能进入产物或干扰。

**修复建议**：用明确白名单思维整理 `exclude` / `include`，并在 CI 断言 `_site` 不含 `node_modules`、`Gemfile`、`docs` 等。

#### 🟢 Less 与 Sass 并存

heti 用 Sass，主题用 Less。`package.json` 同时挂 `less` 与 `sass`。

**修复建议**：主题迁到 **原生 CSS**（嵌套 + 自定义属性）或统一 Sass；删除另一套。Less 生态与新工具链结合较弱。

#### 🟢 ESLint 未进入 `ci` 脚本

有 `npm run eslint`，但 `ci` 只有 typecheck + build。

**修复建议**：`ci` = `eslint && typecheck && build && jekyll:build`；PR 门禁一致。

---

### 3.4 前端代码质量与最佳实践

#### 🟠 全局命名空间污染

```ts
window["generateCatalog"] = page.generateCatalog;
// footer 内联脚本调用 generateCatalog(...)
```

以及 `window.jekyll`、`window["$crisp"]`。

**修复建议**：

- catalog 初始化移入 `page.init()`，根据 DOM 是否存在 `.catalog-body` 自动执行。  
- 删除 footer 内联脚本与全局导出。  
- `window.jekyll` 改为 `<script type="application/json" id="page-meta">` + `JSON.parse`，避免隐式 any 全局。

#### 🟠 手写工具函数与现代 API 重复

| 代码 | 可替换 |
|------|--------|
| `Lib/utils.startsWith` | `String.prototype.startsWith` |
| `archive.queryString` | `URLSearchParams` |
| `createEvent` 旧 IE 分支（about.ts） | `new Event(...)` |
| 索引 for 循环 + eslint disable | `for...of` / `forEach` |

**修复建议**：删 polyfill 风格工具，统一现代 DOM/URL API；降低「为 IE 准备」的心理模型。

#### 🟠 `util_ui_element_creator` 使用 `any` props

类型安全弱，事件与 style 键无约束。

**修复建议**：改为小型 `h()` 类型友好实现，或直接用模板字符串 + ` DomParser` 仅限可信内容；优先可读的 `createElement` 业务代码。

#### 🟠 导航无障碍不完整

**位置**：`_includes/nav.html` + `ts/Lib/navbar.ts`

- toggle 按钮缺少 `aria-expanded` / `aria-controls`。  
- `sr-only` 文案在 icon-bar **之后**，部分读屏顺序怪异。  
- 注释仍提 FastClick（已不存在）。  
- `document` 级 click 关闭依赖 `className === "icon-bar"` 字符串相等，脆弱。

**修复建议**：

- 补 ARIA；Esc 关闭；焦点陷阱（移动菜单打开时）。  
- 用 `closest` / `data-nav-toggle` 判断点击目标。  
- 清理过时注释。

#### 🟠 滚动与动画实现

`page.ts` 用 anime 同时动画 `documentElement` 与 `body` 的 `scrollTop`（历史兼容写法）。

**修复建议**：`window.scrollTo({ top, behavior: "smooth" })`；减少依赖。

#### 🟢 Title 恶搞与可访问性

`ts/Lib/title.ts` 在 `visibilitychange` 时改 `document.title`。

对部分用户（多标签工作流、读屏）可能干扰。

**修复建议**：保留但加 `_config` / 查询参数开关；默认开也可以，需知悉代价。

#### 🟢 安全：Sentry DSN 硬编码

DSN 本身通常可公开，但环境切换不灵活。

**建议**：构建时 `define` 注入；`enabled` 逻辑保持。注意不要把 auth token 写进前端。

#### 🟢 外链与混合内容

`about.ts` 中 K-ON 链接为 `http://`。尽量改 https 或去掉失效外链。

---

### 3.5 模板 / SEO / 内容层

#### 🟠 meta description 未按页覆盖

`head.html` 中：

```html
<meta name="description" content="{{ site.description }}">
```

而 Twitter/OG 已用 page 级 description。搜索引擎描述与 OG 不一致。

**修复建议**：与 `meta.html` 同一套 capture 逻辑。

#### 🟠 `keyword` meta 已基本无 SEO 价值

可删，减少噪音。

#### 🟠 分页与归档

- 使用 `jekyll-paginate`（官方已不推荐新项目使用；`paginate-v2` 更强但不在 github-pages 默认集）。  
- 在路径 A 下可接受；若迁 Astro/Eleventy 再升级分页模型。

#### 🟢 草稿与附件

`_drafts/`、`attach/` 大文件（7z/pdf）进库是否必要？大附件更适合 **Release assets / 对象存储 / Git LFS**。

---

### 3.6 仓库体积与静态资源

#### 🔴 `fonts/` 约 180MB（ttf 158MB + woff2 22MB）

`iosevka.css` 引用大量字重；同时保留 ttf 与 woff2。

**修复建议**：

1. **只保留 woff2**；删除 ttf（或 Git LFS 且不部署）。  
2. **子集化**：博客只需 Regular/Bold + 真正用到的中日文字形（或改用系统字体栈 + 单一样式字体）。  
3. 代码字体用 CDN 可变字体或更小的 monaspace/jetbrains 子集。  
4. `font-display: swap` 已有则保留；加 `preload` 仅针对首屏 1–2 个文件。

预期：fonts 目录可压到 **数 MB 级**，clone 体验质变。

#### ✅ `js/pdfjs/` 已外置（cdnjs）

原 ~16MB 完整 vendoring 已删除。PDF 预览改为按需从 cdnjs 加载 `pdf.js@3.3.122` 并 canvas 渲染（见 `ts/Lib/pdf-embed.ts`）。

#### ✅ `js/404/independent/three.min_r56.js` 已外置（cdnjs）

锁定 2013 年代 API 仍是功能现实（CanvasRenderer / ParticleSystem），但脚本改为 cdnjs `three.js/r56`，仓库不再 vendoring。

**后续可选**：

- 中期：用 Canvas 2D / 现代 WebGL 轻量重写粒子，去掉 three r56。  
- 不要引入新 three 却不改场景代码。

#### 🟢 `_site/` 本地 200MB+

已 gitignore；确保从未被强制 add。Docker/CI 构建即可。

---

### 3.7 CI / Docker / 开发体验

#### 已有优点

- Node 22 + Ruby 3.3 + bundler-cache + npm cache。  
- PR 构建、master 部署分离。  
- CodeQL 覆盖 JS/TS 与 Ruby。  
- 多阶段 Docker（node build → jekyll → nginx）结构清晰。

#### 改进建议

| 项 | 建议 |
|----|------|
| CI 门禁 | 加入 `eslint`；可选 bundle size budget |
| 依赖审计 | 周期性 `npm audit` / Dependabot |
| Docker | generator 阶段应 `bundle install` 后只 copy 必要文件；考虑 non-root nginx |
| 本地 DX | 提供 **concurrently** 一键：`vite build -w` + `jekyll serve` |
| 文档 | `docs/` 放架构与约定；README 保持短 |
| exclude | 构建产物断言脚本（防止 secrets/配置泄漏进 `_site`） |

---

## 4. 目标架构（路径 A 落地后）

```
content/
  _posts/                 # 可暂保持根目录 _posts 以减少迁移
  pages/

src/
  scripts/
    blog.ts               # 主站入口
    page404.ts
    tcupdate.ts           # 去 Vue 后的轻量页
  styles/
    main.css              # 单一样式体系（原生 CSS 或 Sass）
  lib/                    # 现 ts/Lib 迁入，strict TS
  features/
    archive-filter.ts
    catalog.ts
    quote.ts
    particle404/          # 可选，标记为 legacy

public/                   # 原 img/ fonts(精简) attach...
jekyll/
  _layouts/ _includes/ _config.yml

vite.config.ts            # multi-page + manifest
.github/workflows/build.yml
```

**开发命令目标态**：

```bash
npm install
npm run dev          # Vite watch + Jekyll serve（一条命令）
npm run build        # Vite production + Jekyll build
npm run ci           # lint + typecheck + build
```

**模板引用目标态**：

```liquid
<link rel="stylesheet" href="{{ site.data.assets.blog.css }}">
<script type="module" src="{{ site.data.assets.blog.js }}"></script>
```

---

## 5. 分阶段实施路线图

### Phase 0 — 止血与决策（0.5–1 天）

- [x] 确认路径 A（本文默认）  
- [x] 决定 SW：**删除** 或 **Workbox 重建**（二选一写进 README）  
- [x] 盘点 `pdfjs`、fonts、attach 是否线上必需（pdfjs/three 已 CDN；fonts ttf 已删）  
- [x] 修复 MathJax 配置错位（小 PR，高收益）— 已换 KaTeX

**验收**：含公式的文章渲染正确；README 写明 SW 策略。

### Phase 1 — 仓库瘦身与死代码清理（1–3 天）

- [x] 删除或外置 `js/pdfjs`（cdnjs + canvas 渲染）  

- [ ] fonts 仅保留 woff2 子集；更新 `iosevka.css` / `fonts.css`  
- [x] 删除 SW 死链文件或标记迁移期 unregister  
- [x] 删除 `ts/tc-blog.ts` 废弃桩、无用 modernizr（若 404 未用）  
- [x] 统一 `repo.json` / `package.json` 元数据  
- [x] 修正 `_config.yml` exclude + `html lang`（`lang="en"` 按决策保留）

**验收**：仓库体积显著下降；`npm run ci` 绿。

### Phase 2 — 工程化升级（3–7 天）

- [x] Webpack → Vite 多入口 + manifest  
- [x] Jekyll 模板改为读 manifest  
- [x] `tsconfig` 现代化（ESM / bundler / `strict: true`）  
- [x] `ci` 加入 eslint；可选 size limit  
- [x] axios → fetch；去掉不必要 polyfill  
- [x] catalog 去全局变量  
- [ ] `tcupdate` 去 Vue，并入统一构建（已并入 Vite；Vue 按决策暂保留）

**验收**：本地一条 `dev` 命令；产物带 hash；主 JS 体积下降可量化。

### Phase 3 — 样式与 UI 基座（1–2 周，可拆 PR）

- [x] 梳理实际用到的 BS 类，绘制「类名 → 自有 CSS」映射表  
- [x] 实现布局/导航/分页/表格/blockquote 自有样式  
- [x] 移除 Bootstrap CSS/JS 与 FA4  
- [x] Less → CSS（或统一 Sass）— 已迁 `styles/*.scss`，移除 `less` 依赖  
- [x] 图标 SVG 化  
- [x] 基础 a11y：导航、跳过链接、对比度、焦点环

**验收**：无 BS/FA 网络请求；Lighthouse a11y 明显改善；视觉回归可接受。

### Phase 4 — 体验与内容管线（持续）

- [ ] 图片：现代格式（WebP/AVIF）+ 合理尺寸；文章内图懒加载  
- [x] Math：按需加载 KaTeX/MathJax（KaTeX；`math: false` 可关）  
- [x] 文章 lastmod 构建期生成  
- [x] 依赖 Dependabot  
- [ ] （可选）评估 Astro 迁移 ROI 

### Phase 5 — （可选）路径 B 迁移决策点

触发条件示例：

- `github-pages` 长期无法支持新 Ruby / 需要的插件；或  
- 想要组件化 MDX、图片管线、i18n 等 Jekyll 难做的功能。

迁移清单：permalink 兼容表、RSS、sitemap、utterances 路径、CNAME、404、GA。

---

## 6. 最佳实践违规速查表

| # | 位置 | 违规 / 味道 | 建议 |
|---|------|-------------|------|
| 1 | `_layouts/post.html` | MathJax 2/3 混用 | 统一 v3 或换 KaTeX |
| 2 | `head.html` | BS3 + FA4 + CSS 无 SRI | 去框架 / 补 SRI / SVG 图标 |
| 3 | `default.html` | `lang="en"` | `zh-Hans` |
| 4 | `blog.ts` + footer | 全局函数 + 内联脚本 | 模块内初始化 |
| 5 | `blog.ts` / SW 文件 | 死代码与半废弃功能 | 删或真正实现 |
| 6 | `post.ts` | 路径猜测 + `innerHTML` | 用 page.path + `textContent` |
| 7 | `utils.ts` | 自造 startsWith | 用标准库 |
| 8 | `archive.ts` | 自造 query parse | `URLSearchParams` |
| 9 | `quote.ts` | axios 过重 | `fetch` |
| 10 | `tcupdate.js` | 单页 Vue+JSX 特殊构建 | 轻量 TS 重写 |
| 11 | `webpack.*` | 配置复制 / CJS | Vite 统一 |
| 12 | `tsconfig` | 松散 + CJS 目标 | strict + bundler |
| 13 | 输出文件名 | 无 hash | contenthash + manifest |
| 14 | `fonts/`, `pdfjs/` | 巨型 vendoring | 子集 / 删除 / npm 按需 |
| 15 | `nav.html` | a11y 不足 | ARIA + 键盘 |
| 16 | `package.json` scripts | `tslint` 别名误导 | 改名或删除 |
| 17 | `ci` | 无 lint | 纳入 eslint |
| 18 | Sentry DSN | 硬编码 | 构建注入 |
| 19 | CDN vs bundle | anime 双源 | 单一来源 |
| 20 | exclude 列表 | 漏 `.mjs` 等 | 与真实文件对齐 |

---

## 7. 明确不建议做的事

1. **为了「现代化」而一次性重写所有历史文章 HTML** — 成本高、收益低。  
2. **引入 React/Next「因为流行」** — 个人静态博客过重，且与 GitHub Pages 模型别扭。  
3. **升级 Three.js 大版本却不改粒子实现** — 必炸。  
4. **继续叠加 polyfill「以防万一」** — 与已声明的 evergreen 目标矛盾。  
5. **把 `node_modules` 或 `_site` 提交进 git**。  
6. **在未瘦身 fonts 前做微优化（把 gzip 参数调来调去）** — 优先砍体积。

---

## 8. 成功度量（建议写进后续 PR 描述）

| 指标 | 当前观察 | 目标（路径 A 完成后） |
|------|----------|----------------------|
| 仓库主要静态资源 | fonts ~180MB + pdfjs ~16MB | fonts &lt; 5MB；无 pdfjs 或不进仓库 |
| 主包 `tc-blog` JS | ~680KB min | 视依赖削减后显著下降（先建立 baseline 报告） |
| 首屏第三方 CSS 框架 | BS3 + FA4 | 0 |
| CI | typecheck + build | lint + typecheck + build +（可选）size |
| TS | `noImplicitAny: false` | `strict: true` |
| 缓存 | 固定文件名 | contenthash |
| Math | 配置错误风险 | 抽检文章公式正确 |
| 开发启动 | 双终端手动 | 单命令 dev |

---

## 9. 建议的 PR 拆分顺序（便于 review）

1. `fix(mathjax): align config with v3`  
2. `chore: remove dead service worker / pdfjs / unused assets`  
3. `chore(fonts): keep woff2 subset only`  
4. `build: migrate webpack to vite + asset manifest`  
5. `refactor: drop vue from tcupdate; fetch instead of axios`  
6. `refactor(ts): strictness wave 1 + remove globals`  
7. `feat(css): replace bootstrap grid with local layout`  
8. `feat(a11y): nav landmarks and aria`  
9. `ci: eslint on PR + size budget`

每个 PR 保持可独立回滚；视觉相关 PR 附前后截图（首页 / 文章 / 归档 / 404）。

---

## 10. 总结

这是一个 **「内容层稳定、前端层中度现代化但仍背着 2016 主题基座」** 的个人博客：

- **Jekyll + GitHub Pages + Actions** 作为发布内核仍然合理，不必为了赶时髦整站换框架。  
- 真正拖维护效率的是：**过时 UI 基座、巨型字体/PDF 依赖、Webpack 双轨配置、TS 严格度不足、以及若干正确性坑（MathJax、SW 半废弃）**。  
- 推荐 **路径 A**：先修正确性 → 瘦身 → Vite/工程化 → 去 Bootstrap → 再谈是否迁 Astro。  

按本文 Phase 0–3 推进后，日常改文章与改样式的心智负担会明显下降；粒子 404、语录、归档筛选等「个性功能」可以在更干净的地基上保留。

---

## 附录 A — 关键时重点文件索引

| 路径 | 角色 |
|------|------|
| `_config.yml` | 站点与插件配置 |
| `_layouts/*`, `_includes/*` | HTML 骨架与 CDN 依赖 |
| `ts/entries/blog.ts` | 主前端入口 |
| `ts/pages/*`, `ts/Lib/*` | 业务与工具 |
| `ts/particle404/*` | 404 粒子（legacy three） |
| `less/*` | 主题样式源 |
| `build/webpack.*` | 当前打包 |
| `js/tcupdate.js` | 工具页（Vue） |
| `sw.js`, `js/sw-registration.js` | 已停用 SW |
| `.github/workflows/build.yml` | CI/CD |
| `Dockerfile` | 可选镜像发布 |
| `Gemfile` | github-pages 锁定 |
| `package.json` | Node 脚本与依赖 |

## 附录 B — 路径 B（Astro）若启动时的最小迁移清单

> **完整可执行计划已落到仓库 [`mig/`](../mig/README.md)**（模块盘点、映射表、样式冻结、分阶段 checklist、验收与风险）。

1. URL 兼容：`permalink: pretty` → Astro 路由映射表，旧链接 301/同路径。  
2. 内容：front matter 字段（`catalog`、`header-img`、`subtitle`、tags）schema 化。  
3. 评论：utterances `issue-term: pathname` 保持路径不变。  
4. 搜索资源：CNAME、`robots.txt`、`sitemap`、`feed`。  
5. 构建：仅 Node CI，移除 Ruby（或保留过渡期双建）。  
6. 自定义页：404、about、archive、tcupdate 改为 Astro pages。  

---

*本文为审查与方案文档。路径 A 实施见仓库提交历史；路径 B 实施以 `mig/` 为准。*

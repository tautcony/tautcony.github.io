# 06 — 前端脚本模块

## 1. 入口矩阵

| 入口 | 现文件 | 引入样式 | 挂载布局 | 迁移动作 |
|------|--------|----------|----------|----------|
| 主站 | `ts/entries/blog.ts` | tc-blog + heti | BaseLayout | client `<script type="module">`；Sentry 保留 |
| 404 | `ts/entries/page404.ts` | tc-blog + 404.scss | 404.astro | client script；主站 CSS 与 404 CSS 叠加 |
| 工具 | `ts/entries/tcupdate.jsx` | tcupdate.scss | tcupdate.astro | `@astrojs/vue`；client-only 挂载 |

## 2. 页面模块

| 模块 | 文件 | 行为 | 迁移注意 |
|------|------|------|----------|
| post | `ts/pages/post.ts` | GeoPattern 头图、`//` 注释色、外链 `external` | lastmod 已构建期；勿恢复 GitHub API |
| page | `ts/pages/page.ts` | catalog、表格 wrap、回顶、导航 scroll | `el()` 生成的 catalog DOM class 不变 |
| archive | `ts/pages/archive.ts` | tag 筛选 + URL `?tag=` | 依赖 `.js-tags` / `.js-result` / `data-encode` |
| about | `ts/pages/about.ts` | 多语言/语录块等 | 与 about 页 DOM id 契约 |

## 3. Lib 模块

| 模块 | 职责 | 迁移 |
|------|------|------|
| `utils.ts` (`el`, `isExternal`) | DOM 与外链 | 原样 |
| `navbar.ts` | 移动菜单 | 依赖 nav class |
| `quote.ts` | 页脚语录 | fetch `/json/quote.json`（public） |
| `pdf-embed.ts` | PDF.js CDN | 不改 CDN API 则原样 |
| `title.ts` | 恶搞 title | 原样 |
| `tagcloud.ts` | 标签字号颜色 | archive |
| `corevalue.ts` | 点击彩蛋 | 原样 |
| `brightness.ts` | Alt+方向键亮度 | 原样 |
| `geopattern/*` | 无头图时背景 | 原样 |
| `particle404/*` | 404 场景 | npm Three.js WebGL；`perf` / `gui` query flags |

## 4. 与 HTML 的数据桥

### 现状

```html
<script>
  window.jekyll = { page: { title, date, path, id } };
</script>
```

### 迁移协议

```html
<script>
  window.__TC_PAGE__ = { title, date, path, id };
</script>
```

所有值用 JSON serializer 输出，不拼接未经转义的字符串。若 `post.ts` 已不再读取此桥，可在独立 PR 删除；首迁不同时保留两套桥。

`meta[name=baseurl]`：baseurl 为空时保持空字符串。

## 5. Service Worker

现状：仅 unregister 迁移残留。Astro 后 **继续保留一段时间** 或按原计划删除；不引入 Workbox。

## 6. Vue / tcupdate

| 项 | 做法 |
|----|------|
| 构建 | 固定 `@astrojs/vue@7.0.1` + `vue@^3.5.24`；删除旧 `@vitejs/plugin-vue-jsx@4` |
| 运行 | 页面 load 后 `createApp` 挂载（现逻辑） |
| 样式 | 仅该页 import `tcupdate.scss` |
| 后续 | 不在本次迁移重写无 Vue 版 |

## 7. 第三方脚本加载顺序

保持与现站一致，避免 FOUC / 竞态：

1. Head：meta、pace css、**主 CSS**、字体、modulepreload
2. Body 底：主 **JS module**
3. Post 额外：AnchorJS、KaTeX（defer）
4. 404：主站 CSS → 404 CSS → page404 module（内含现代 Three.js）
5. about：APlayer css/js、about module、`Comment.astro`（pathname `/about/`）

## 8. Client-only 挂载规则

- 禁止在 Astro frontmatter `import "../ts/entries/blog.ts"`；entry 顶层读取 `location`、`navigator`、`document`，SSG 会失败。
- 每页只输出一个对应的 `<script type="module" src="...">`，不得同时由 layout 和 entry 重复挂载。
- build 后用 preview 验证主站、404、tcupdate 各执行一次；console 无 `document is not defined`、重复 Vue mount 或未处理 rejection。

## 9. TypeScript / ESLint

- 延续 `strict: true`
- 首迁保留根 `ts/**`；`tsconfig` 覆盖 `ts/**`、`src/**`
- ESLint glob 覆盖 `ts/**/*.{ts,tsx,jsx}` 与 `src/**/*.{ts,tsx,jsx,astro}`
- `npm run check:astro` 固定执行 `astro check`，与 `tsc --noEmit`、ESLint 并行

## 10. 模块实施顺序（脚本侧）

1. 主站 entry 在 BaseLayout 跑通（nav + quote + 无报错）
2. post + page（catalog / external）
3. archive
4. about
5. pdf-embed 抽检
6. 404 粒子 + query flags
7. tcupdate Vue

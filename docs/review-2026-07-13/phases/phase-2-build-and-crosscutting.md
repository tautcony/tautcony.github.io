# Phase 2 审查报告: 构建、发布与横切约束

> 日期: 2026-07-13  
> 文件数: `mig/02`、`mig/06`、`mig/08`、`mig/09`、CI/Docker/样式入口  
> 发现: P0(0) / P1(0) / P2(4) / INFO(0)  
> 导航: [返回 review index](../index.md) | [查看修复 checklist](../fix-checklist.md)

## 已审查文件

- `mig/02-astro-architecture.md`、`mig/06-frontend-scripts.md`、`mig/08-ci-deploy-docker.md`、`mig/09-acceptance-and-risks.md`
- `vite.config.mjs`、`ts/entries/*`、`styles/*`、`.github/workflows/*`、`Dockerfile`、`.dockerignore`

## Findings

### P2-P2-1: [P2] 样式物理搬迁和 404 样式隔离会破坏视觉依赖

- 位置: `mig/02-astro-architecture.md:76-77`、`mig/04-styles-freeze.md:8-11`；`styles/404.scss:22`、`styles/tc-blog.scss:1027-1031`
- 触发条件: 将 `styles/` 移到 `src/styles/` 后，`../img/404/inner_bck.jpg` 和 `../img/search.png` 会解析到不存在的 `src/img`，而图片被计划放在 `public/img`；同时现 `404.html` 先继承 default layout 的主站 CSS，再叠加 `404.scss`，不能简单只引 404.scss。
- 影响: 404 背景、搜索框图标或 intro/footer 栅格丢失，视觉冻结验收无法通过。
- 修复方向: 迁移期保留样式根目录，或统一改成 `/img/...` public URL，并明确 404 的主站 CSS 依赖；加入 CSS URL 解析检查和 404/搜索框截图。

### P2-P2-2: [P2] Astro 模板检查和迁移后 lint 范围没有进入最终 CI 合同

- 位置: `mig/08-ci-deploy-docker.md:5-15`、`mig/07-phases.md:144-151`
- 触发条件: 08 说 `typecheck / astro check`，但目标 `ci` 脚本只列 `eslint && typecheck && build`，未明确安装/执行 `@astrojs/check`；现有 `eslint` 仍是 `eslint ./ts`，而方案又允许把脚本移到 `src/scripts`。
- 影响: `.astro` props、路由和模板类型错误可能绕过 CI，迁移后的客户端也可能不再被 lint，只由现有 `tsc` 检查旧 `.ts`。
- 修复方向: 固定 `astro check`/版本和 lint glob，在本地 `ci` 与 workflow 使用同一命令，覆盖最终脚本路径并保存输出。

### P2-P2-3: [P2] 安装命令与遗留元数据清理不具备可复制性

- 位置: `mig/07-phases.md:16-20`、仓库 `.gitmodules`、`.github/workflows/build.yml:17-22`
- 触发条件: M0 的 `npx sq/*` 不是可执行的安装命令；`.gitmodules` 已无对应 gitlink，但 checkout 仍使用 `submodules: true`。
- 影响: 新环境无法按文档启动，遗留 submodule 配置掩盖真实依赖；Node/Astro 版本漂移进一步放大问题。
- 修复方向: 使用锁定版本的 `npm install`/`npm ci`，删除陈旧 `.gitmodules`、无效 `submodule` script，并在 clean checkout 运行 build。

### P2-P2-4: [P2] P0 视觉冻结却没有可重复的截图门禁

- 位置: `mig/00-overview.md:37-47`、`mig/04-styles-freeze.md:89-110`、`mig/07-phases.md:34-36,191-196`
- 触发条件: 成功标准要求截图 diff，但方案把 Playwright diff 标为“非必须”，没有基准截图、viewport 矩阵、像素阈值或 CI 门禁。
- 影响: CSS/高亮 DOM/响应式/字体回归只能靠人工抽检，P0 视觉目标无法客观验收。
- 修复方向: 固定六类页面和桌面/移动 viewport 的基准截图、差异阈值和产物保留规则；至少在切流 PR required check。

## 漏检复盘

- 默认分支/未知输入：检查了 CI 触发、产物目录、Docker 入口和错误的静态路径。
- 异步失败/前提失效：检查 client entry 的 browser-only 前提；实现时必须以 `<script>` client 方式挂载并跑 SSG build。
- 半完成状态/重建窗口：检查 Docker/Pages 双产物和 rollback，主要 P1 已在 baseline 记录。
- 渲染/导出/编码：检查样式 URL、资源复制和第三方 CSS/JS；未运行浏览器截图。

## 未覆盖区域

- 未执行 Docker build、GitHub Actions 或 Playwright；这些是方案实现后的验证项。

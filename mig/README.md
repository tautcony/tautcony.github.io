# TC Blog → Astro 迁移计划

> 状态：**完成待发布**（代码侧 M0–M5 done；见 [PROGRESS.md](./PROGRESS.md)）
> 原则：**视觉样式冻结** — 现有 `styles/*.scss`、class 名与静态资源视为只读契约
> 对应战略：现代化方案路径 B（见 `docs/modernization-plan.md`）
> 仓库：`tautcony/tautcony.github.io`
> 集成分支：`feat/astro-mig`

> 2026-07-13 修订：已锁定 Astro 7/Node 22.12+、preserve 路由输出、双栈复制策略、Content Layer/schema、全量 route/resource compare 和可演练回滚。
>
> 2026-07-14：开始 M0/PR1 实施；**进度与接续入口统一写在 [PROGRESS.md](./PROGRESS.md)**。
>
> 2026-07-16：P1 清债后以 **PROGRESS 为准**。下列分册（`00`–`09`）保留双栈期设计叙述（如 `migrate-posts.mjs`、`@astrojs/vue`、excerpts fixture）；**现状事实**：内容唯一源 `src/content/posts/`，`tcupdate` 为纯 TS（无 Vue），摘要由 `src/lib/excerpts.ts` 运行时生成，404 仅 `modern-scene.ts`。

---

## 文档索引

| 文档 | 内容 |
|------|------|
| **[PROGRESS.md](./PROGRESS.md)** | **实施造册**：阶段状态、任务勾选、下一步、变更日志（先读这个） |
| [00-overview.md](./00-overview.md) | 目标、非目标、约束、成功标准、总工期 |
| [01-module-inventory.md](./01-module-inventory.md) | 现站模块盘点（Jekyll / 前端 / 静态 / CI） |
| [02-astro-architecture.md](./02-astro-architecture.md) | 目标目录树、技术选型、构建图 |
| [03-mapping-tables.md](./03-mapping-tables.md) | 文件 / 组件 / 路由 / 配置 对照表 |
| [04-styles-freeze.md](./04-styles-freeze.md) | 样式不变化的具体策略与验收 |
| [05-content-and-markdown.md](./05-content-and-markdown.md) | Content Collections、front matter、Markdown/高亮 |
| [06-frontend-scripts.md](./06-frontend-scripts.md) | TypeScript 入口、client 脚本、特殊页 |
| [07-phases.md](./07-phases.md) | **分阶段实施步骤**（可执行 checklist） |
| [08-ci-deploy-docker.md](./08-ci-deploy-docker.md) | CI / Pages / Docker / 域名 |
| [09-acceptance-and-risks.md](./09-acceptance-and-risks.md) | 验收清单、风险、回滚 |

**建议阅读顺序**：`PROGRESS` → `00` → `01` → `03` → `04` → `07`，实施时按 `07` 推进并**同步更新 PROGRESS**，其余作查阅手册。

**实施前置**：先完成 `00` 的 D1–D8 决策和 `07/M0` 的版本、fixture、compare 脚本门禁；PR1–PR4 只进入集成分支，PR5 才切换 `master`。

---

## 一句话

用 **Astro SSG** 替换 **Jekyll**，保留现有 Sass/class/静态资源与 TypeScript 行为；通过 **DOM class 契约 + URL 兼容表** 做到用户侧「样式与链接几乎无感」。

---

## 不做的事（迁移期）

- 不重写主题视觉、不改 class 命名体系
- 不升级 Three.js、不重写粒子 404 算法
- 不强制去掉 Vue（`tcupdate` 可先以 client 挂载）
- 不把历史 Markdown 改写成 MDX（除非个别页需要）
- 不引入 React/Next 全栈

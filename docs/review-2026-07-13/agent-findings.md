# Sub Agent 候选发现与核验记录

> 日期: 2026-07-13  
> 范围: `mig/` 迁移方案及其必要上下游

## 分派概览

- `mig_scope`: 方案结构、范围、配置/路由/验收覆盖。
- `mig_risk`: 迁移执行、失败恢复、双栈、资源和发布风险。
- `mig_verification`: 独立反证与跨文件一致性（结果在本次汇总前纳入复核）。

## 候选发现

| 候选 | 来源 | 主 agent 核验 | 最终 finding |
|---|---|---|---|
| Astro 最新版本与旧 Content API/Node 约束 | mig_scope / mig_risk | 当前 npm registry 为 Astro 7.0.7，Node engine 与方案不一致 | P0-P1-1 |
| tcupdate、分页、sitemap 输出未闭环 | 三个 agent | 对照 fixture 和 `build.format: directory`，确认 | P0-P1-2 |
| 双栈搬迁破坏 Jekyll | mig_risk | 复读 M0/M1 清单与 `_posts`/public 约束，确认 | P0-P1-3 |
| legacy URL key/id 不一致 | mig_scope / mig_risk | fixture key 含扩展名，方案 lookup 未定义归一化，确认 | P0-P1-4 |
| lastmod rename/Docker 空 map | mig_scope / mig_risk | 复读现有脚本和 `.dockerignore`，确认 | P0-P1-5 |
| schema null/空 tag 失败 | mig_risk | 复读代表性 front matter，确认 | P0-P1-6 |
| config/page front matter 遗漏 | mig_scope | 对照 `_config.yml` 与三个页面 front matter，确认 | P0-P1-7 |
| compare 脚本不存在、资源 fixture 不全 | mig_scope / mig_risk | `scripts/compare-routes.mjs` 不存在，确认 | P0-P1-8 |
| tag rollback 无 workflow 入口 | mig_risk | 复读 workflow trigger，确认 | P0-P1-9 |
| browser-only entry 的挂载边界 | mig_risk | 复读 entry 顶层副作用与 Astro 两种引入写法，确认 | P0-P1-10 |
| 标题 HTML、Liquid/raw HTML、排序、时区 | mig_scope / mig_risk | 均有真实 fixture；降为 P2，分别记录 | P1-P2-1..4 |
| 样式相对 URL、astro check、安装命令 | mig_scope / mig_risk | 复读源文件和 phase 命令，确认 | P2-P2-1..3 |

## 被驳回或降级的候选

- “geopattern 是移动后会断的 submodule”被降级/修正：当前文件是普通 tracked files，`git submodule status` 为空；只保留陈旧 `.gitmodules` 清理为 P2。
- “路径 A/B 已完全战略冲突”降为文档状态疑点：`docs/modernization-plan.md` 已链接 `mig/`，但顶部仍未明确 B 的批准状态，属于执行前决策澄清，不直接判为阻断缺陷。

## 双人核验记录

- 所有 P1 候选均由主 agent 复读方案行号及至少一个实际仓库入口；`mig_scope` 或 `mig_risk` 提供独立确认。
- 未发现 P0；P1 结论集中在“按当前文本执行会失败/验收假绿/无法回滚”，不是风格意见。

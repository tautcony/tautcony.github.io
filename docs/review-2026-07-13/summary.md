# 代码审查汇总

> 日期: 2026-07-13  
> 范围: `mig/` 全部方案、fixture，以及为验证方案而读取的 Jekyll/Vite/CI/Docker/内容入口  
> Phase 数: 3  
> Sub agent: 已使用 `mig_scope`、`mig_risk`、`mig_verification`

## 结论

方案在“要迁什么”上较全面，在“按什么确定协议、失败时如何恢复、如何证明等价”上还不够完善。当前不建议直接进入 M0；至少 10 个 P1 需先收敛，否则首轮构建可能失败，或双栈/验收/回滚不能按文档执行。

## 统计

- P0: 0
- P1: 10
- P2: 8
- INFO: 0

## 高优先级问题

- [P1] [P0-P1-1](./fix-checklist.md#p0-p1-1) 版本/API/Node 基线不兼容。
- [P1] [P0-P1-2](./fix-checklist.md#p0-p1-2) URL 输出形状未闭环。
- [P1] [P0-P1-3](./fix-checklist.md#p0-p1-3) 双栈阶段搬迁会破坏 Jekyll。
- [P1] [P0-P1-4](./fix-checklist.md#p0-p1-4) URL fixture lookup key 未固定。
- [P1] [P0-P1-5](./fix-checklist.md#p0-p1-5) lastmod/Docker 结果不可靠。
- [P1] [P0-P1-6](./fix-checklist.md#p0-p1-6) 现有 front matter 不能直接过 schema。
- [P1] [P0-P1-7](./fix-checklist.md#p0-p1-7) site/page 配置映射不完整。
- [P1] [P0-P1-8](./fix-checklist.md#p0-p1-8) 对比门禁不存在且漏检静态资源。
- [P1] [P0-P1-9](./fix-checklist.md#p0-p1-9) rollback runbook 不可执行。
- [P1] [P0-P1-10](./fix-checklist.md#p0-p1-10) browser-only entry 挂载边界未固定。

## 各 Phase 摘要

- Phase 0: 发现全部 9 个 P1，证明方案当前不能直接实施。
- Phase 1: 内容渲染的标题 HTML、Liquid、排序和日期时区需要补协议/门禁。
- Phase 2: 样式路径、Astro 模板检查和安装/遗留配置需要补可复制步骤。

## 已覆盖且暂无明确缺陷

目标/非目标、样式冻结边界、模块盘点、主要交互清单、第三方运行时、Pages artifact/CNAME 方向、PR 分阶段结构均已检查；这些章节可作为后续修订的骨架。

## 跨模块问题

- “URL 冻结”必须同时覆盖文章、分页、特殊 HTML 页、sitemap、robots、canonical、utterances pathname，而不是只比较文章 HTML。
- “视觉冻结”依赖 HTML class、page-level front matter、标题 HTML、Markdown 高亮 DOM、CSS 相对资源；缺一项都可能出现局部白屏或样式回归。
- “lastmod”同时受 Git rename、Docker context、Content entry sourcePath 影响，不能只靠 `git mv` 说明。
- `feed.xml` 当前包含 RFC822 日期、完整 content、categories、self link 等字段；方案只写“字段对齐”，应建立 XML contract fixture。
- 42 篇文章都使用 `<!--more-->`；摘要必须在 raw body 阶段切分并做全量快照，不能依赖 remark 渲染后仍保留 HTML 注释。

## 差异化反证复盘

- 默认分支/交互协议：复查了分页参数、特殊页后缀、sitemap/robots 和未知缺失 front matter。
- 异步失败/超时/取消：复查了 tcupdate GitHub API、quote、PDF、第三方脚本；实现阶段仍需浏览器负向测试。
- 状态写入/半完成：复查了双栈复制/删除顺序、lastmod 生成、Docker/Pages 产物和 rollback。
- 渲染/导出/编码/时间：复查了 raw HTML、Liquid include、标题 HTML、摘要、URL key、同日排序、时区、RSS 和静态资源。
- 本轮新增发现：无 P0；所有 P1 已由主 agent 和至少一个 sub agent 交叉核验。

## 修复跟踪

`fix-checklist.md` 是逐问题主记录，当前 18 个 finding 均未开始；`fixes-plan.md` 给出先收敛协议、再实施脚手架的顺序。

## 未覆盖区域与验证限制

- 未运行不存在的 Astro 实现、Docker build、GitHub Actions 或浏览器截图；不能据此证明视觉/运行时已经通过。
- 当前 `_site` 是工作区已有产物，部分 fixture 需以一次干净 Jekyll build 重新生成并记录 commit。

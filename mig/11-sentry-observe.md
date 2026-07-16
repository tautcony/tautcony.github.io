# 11 — Sentry 观察 runbook（M5）

> **窗口**：合入 `master` 并完成首次 Astro 生产部署后 **7 天**。  
> **Release 格式**：`tc-blog@<package.version>+<git-short-sha>`（`astro.config.mjs` 注入 `PUBLIC_SENTRY_RELEASE`；CI 可覆盖 env）。

## 1. 部署时

1. 确认 Pages 部署使用本次 commit 的 `dist`。
2. 打开任意主站页 → DevTools → 搜索构建产物中的 release 字符串，或在 Sentry **Releases** 列表确认新 release 出现。
3. （可选）CI 显式设置：
   ```bash
   export PUBLIC_SENTRY_RELEASE="tc-blog@1.1.0+$(git rev-parse --short HEAD)"
   npm run build
   ```

## 2. 每日检查（7 天）

| 项 | 阈值 / 动作 |
|----|-------------|
| 全站 error 率 | 不高于迁移前 7 日均值；超 1.5× 则调查 |
| `/404.html` / `page404` | 粒子页无新增 unhandled rejection 尖峰 |
| `/tcupdate.html` | Vue mount / GitHub API 失败可忽略限流；白屏级 error 需修 |
| `/about/` utterances | 第三方 script 失败单独记，不归因于 SSG |
| 新 release 关联 issue | 优先修 P0/P1 |

## 3. 回滚触发

若出现：

- 大面积 5xx / 空白页
- 文章 URL 系统性 404
- 错误率持续 > 基线 2× 且无法 24h 内止血

则：

1. Revert 合入 master 的 Astro PR（或从 `pre-astro-*` tag 恢复可部署树）。
2. 重新部署 Pages artifact。
3. 在 Sentry 将该 release 标为 regression。

## 4. 窗口结束

- [ ] 7 日无回滚
- [ ] 本文件勾选完成日期：________
- [ ] M5-02 在 `PROGRESS.md` 标 `done`

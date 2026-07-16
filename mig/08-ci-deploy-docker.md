# 08 — CI、部署与 Docker

## 1. 目标流水线

```text
push/PR → checkout (shallow)
        → setup-node 22.12+
        → npm ci
        → npm run ci      # lint/typecheck/check/math/lastmod/build
        → upload-pages-artifact (path: dist)
        → (master) deploy-pages
```

**移除**：`ruby/setup-ruby`、`bundle exec jekyll build`。PR1–PR4 的 compare job 仍可单独运行 Jekyll，PR5 后删除 Jekyll 步骤。

## 2. `build.yml` 变更要点

| 项 | 现 | 目标 |
|----|----|------|
| Ruby job steps | 有 | 无 |
| 产物目录 | `_site` | `dist`（或 `astro.config` 的 `outDir`） |
| lastmod | 已有 node 脚本 | PR1–PR4 冻结/校验；Docker 消费提交的 map |
| fetch-depth | 0 | 使用 checkout 默认浅克隆；CI 只校验冻结的 lastmod，不读取 Git 历史 |
| Node | 22.12+ | 与 Astro 7 engine 一致 |
| 并发 group | `pages-${{ github.ref }}` | 保持 |
| compare fixtures snapshot | 每次额外上传 | 删除；fixture 已入库，Pages artifact 只含 `dist` |
| Action major | checkout/setup-node v4、Pages v3/v4 | checkout/setup-node v7、Pages v5 |

## 3. 环境变量

| 变量 | 用途 |
|------|------|
| `PUBLIC_SENTRY_DSN` 等 | 可选：未来把 Sentry DSN 移出硬编码 |
| `JEKYLL_ENV` | **删除** |
| `ASTRO_*` | 一般不需要 |

## 4. Docker

### 当前

```dockerfile
FROM node:22.12-bookworm AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# 可选: non-root, 自定义 nginx.conf
```

`.dockerignore`：排除 `node_modules`、`_site`、`vendor`、`.git`。Docker 不得在无 Git 历史时运行 lastmod 生成器，必须消费提交的 `src/data/lastmod.json`。

## 5. 域名与 Pages

| 项 | 处理 |
|----|------|
| `CNAME` → `tautcony.xyz` | 放 `public/CNAME`，确保进 dist |
| 自定义域 DNS | 不变 |
| `url` in config | `https://tautcony.xyz` 与 `astro.config.site` 一致 |
| github.io 镜像 | 若仍启用，sitemap 以主域为准 |

## 6. CodeQL / Dependabot

| 配置 | 动作 |
|------|------|
| `codeql.yml` | `javascript-typescript` + `actions`、`build-mode: none`；归档 Jekyll 配置不需要 Ruby 分析 |
| dependabot npm | 保留；可 group `astro` |
| dependabot bundler | Gemfile 删除后移除 |
| dependabot github-actions | 保留 |

## 7. 本地命令对照

| 旧 | 新 |
|----|----|
| `npm start` (jekyll serve) | `npm run dev` (astro dev) |
| `npm run build` (vite only) | `npm run build` (astro build；lastmod 由 CI 单独校验) |
| `npm run jekyll:build` | 删除 |
| `npm run ci` | eslint + typecheck + astro check + math + lastmod + build |

## 8. 切流当日 runbook

1. 打 tag 并 push：`git tag pre-astro-$(date +%Y%m%d) && git push origin <tag>`；保存旧 Pages artifact。
2. 合并 PR5；确认 deploy、route/resource compare、HTTP smoke、截图 diff 全部成功。
3. 打开全部页面类型：`/`、`/page2/`、`/page5/`、`/archive/`、`/about/`、一篇 2016 文、一篇 2023 文、`/tcupdate.html`、`/404.html`、`/feed.xml`、`/sitemap.xml`、`/robots.txt`。
4. 抽检旧帖和 `/about/` utterances pathname；检查字体、PDF、quote、404 资源。
5. 若失败：revert PR5 到 `master` 触发旧 workflow；不依赖 tag 自动触发。必要时部署已保存的旧 artifact。

## 9. 必选：双产物对比 job（PR1–PR4）

```text
job compare:
  - build jekyll → _site (临时保留)
  - build astro → dist
  - node scripts/test/compare-routes.mjs --scope posts   # M1
  - node scripts/test/compare-routes.mjs --scope all     # M3/M4
  - node scripts/test/compare-assets.mjs
  - 42 篇内容/摘要/front matter fixture
  - 失败则 PR 不可合并
```

PR5 后保留 fixture/resource compare；仅删除 Jekyll 构建步骤。

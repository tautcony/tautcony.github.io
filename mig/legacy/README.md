# Legacy 档案（只读）

Astro 切流时归档的 Jekyll 侧文件。**不参与** `npm run build` / CI / Docker。

| 路径 | 说明 |
|------|------|
| `_config.yml` | 旧站配置（现行配置在 `src/data/site.ts`） |
| `drafts/` | 未发布草稿 |
| `lastmod-jekyll.json` | 旧 key 形态的 lastmod 快照（现行为 `src/data/lastmod.json`） |

内容与静态资源的现行位置：

| 角色 | 路径 |
|------|------|
| 文章 | `src/content/posts/` |
| lastmod | `src/data/lastmod.json` |
| 静态 URL | `public/` |

不要恢复 `_posts/` 双写路径。

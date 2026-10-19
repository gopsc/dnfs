# DNFS 桌面版（Electron）

用 Electron 封装的 DNFS 树状笔记桌面客户端，加载 `https://qsont.me`，完整复刻站点的全部页面与体验（首页 / 登录 / 注册 / 树状笔记 / 文件浏览 / aibox / 调色板等）。

## 运行

系统已通过 nvm 安装 Node，先进入正确的 Node 环境再启动：

```bash
export PATH="$HOME/.nvm/versions/node/v24.22.0/bin:$PATH"
cd dnfs
npm start          # 启动
npm run dev        # 开发模式（传 --dev，可自行扩展 DevTools 等逻辑）
```

## 设计说明

- **页面与 API**：默认直接加载线上站点 `https://qsont.me`。登录态（HttpOnly `q4_token` Cookie）、WebSocket（aibox）、CSP、CORS 与网页版完全一致，前端零改动。
- **`public/`**：从 `blackbird/fsys/public` 复制的站点源码，用作窗口图标与本地参考；未来如需「本地 UI + 远程 API」的离线打包模式可在此基础上扩展。
- **外链处理**：备案号、`target=_blank` 等外部链接统一用系统默认浏览器打开，不在应用内新增窗口。
- **单实例**：重复启动时聚焦已有窗口。
- **登录态持久**：会话数据存于系统用户目录，重启后保持登录。

## 配置

| 环境变量 | 作用 | 默认值 |
|----------|------|--------|
| `DNFS_URL` | 加载地址 | `https://qsont.me` |

## 打包（可选）

后续可接入 `electron-builder` 生成 Linux / Windows / macOS 安装包。
## License

本项目采用 [ISC License](LICENSE)。
# DNFS 客户端（Electron 桌面 + Capacitor 移动端）

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

## 打包

已接入 `electron-builder`（配置在 `package.json` 的 `build` 字段），当前生成 Windows x64 两种产物：

```bash
npm run dist
```

| 产物 | 说明 |
|------|------|
| `dist/DNFS Setup 1.0.0.exe` | NSIS 安装包（可选安装目录、创建桌面快捷方式） |
| `dist/DNFS 1.0.0.exe` | Portable 单文件版，免安装直接运行 |
| `dist/win-unpacked/DNFS.exe` | 未压缩的目录版，便于调试 |

如需下载 electron / NSIS 二进制失败，可走国内镜像：

```bash
ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" \
ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/" \
npm run dist
```

Linux / macOS 安装包可在对应平台追加 `--linux` / `--mac` 生成。

## 移动端（Capacitor）

同一套站点用 [Capacitor](https://capacitorjs.com/) 封装为 Android App，启动后同样加载 `https://qsont.me`（`capacitor.config.json` 的 `server.url`），debug APK 约 4 MB。

Android 原生工程放在仓库外的同级目录 `../dnfs.android`（由 `capacitor.config.json` 的 `android.path` 指定），本仓库只保存 Web 入口与配置。

```bash
npm run mobile:sync            # 同步 mobile-web/ 与配置到 ../dnfs.android
npm run mobile:build:android   # 同步并构建 debug APK
npm run mobile:android         # 用 Android Studio 打开工程
node generate-icons.js         # 从 public/favicon.ico 生成各密度启动图标
```

产物：`../dnfs.android/app/build/outputs/apk/debug/app-debug.apk`

构建要求：

- JDK 21（Gradle 8.14 不支持 JDK 25 及以上）；系统默认 JDK 更高时，在 `../dnfs.android/gradle.properties` 设置 `org.gradle.java.home`
- Android SDK（首次构建会自动安装所需 Build-Tools）

全新环境下没有 `../dnfs.android` 时，执行 `npm install && npx cap add android && node generate-icons.js` 重新生成。更多说明见 [MOBILE.md](MOBILE.md)。

## License

本项目采用 [ISC License](LICENSE)。
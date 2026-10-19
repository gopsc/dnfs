# DNFS 移动端 App（Capacitor）

DNFS 树状笔记的 Android/iOS 移动端应用，基于 Capacitor 封装。

## 架构说明

当前采用**远程加载模式**：App 启动后加载 `https://qsont.me`，与桌面版 Electron 行为一致。

- **优势**：零前端改动，后端更新即时生效
- **限制**：需要网络连接才能使用

## 前置要求

### Android 开发
- [Android Studio](https://developer.android.com/studio)
- Android SDK（API 22+）
- JDK 21（Gradle 8.14 不支持 JDK 25 及以上；在 `../dnfs.android/gradle.properties` 用 `org.gradle.java.home` 指定）

### iOS 开发（仅 macOS）
- Xcode 14+
- macOS 13+
- CocoaPods（`sudo gem install cocoapods`）

## 快速开始

### 1. 同步 Web 资源到原生项目

```bash
npm run mobile:sync
```

这会把 `mobile-web/` 的内容复制到 `../dnfs.android/`（以及添加 iOS 后的 `ios/`）。

### 2. 打开原生 IDE

**Android：**
```bash
npm run mobile:android
```
会在 Android Studio 中打开项目。

**iOS（macOS）：**
```bash
npm run mobile:ios
```
会在 Xcode 中打开项目。

### 3. 构建和运行

#### Android

在 Android Studio 中：
1. 等待 Gradle 同步完成
2. 选择设备/模拟器
3. 点击 Run (▶) 按钮

或者命令行构建：
```bash
npm run mobile:build:android
```
产物位置：`../dnfs.android/app/build/outputs/apk/debug/app-debug.apk`

#### iOS（macOS）

在 Xcode 中：
1. 选择 Team（签名）
2. 选择设备/模拟器
3. 点击 Run (▶) 按钮

## 项目结构

```
GitHub/
├── dnfs/                      # 本仓库
│   ├── mobile-web/            # 移动端 Web 资源
│   │   └── index.html         # 入口页面（加载远程 URL）
│   ├── capacitor.config.json  # Capacitor 配置（android.path 指向 ../dnfs.android）
│   ├── generate-icons.js      # 从 favicon.ico 生成 Android 启动图标
│   └── package.json           # 包含 mobile:* 脚本
└── dnfs.android/              # Android 原生项目（仓库外，npx cap add android 生成）
```

## 配置说明

`capacitor.config.json` 关键字段：

| 字段 | 值 | 说明 |
|------|-----|------|
| `appId` | `me.qsont.dnfs` | 应用包名 |
| `appName` | `DNFS 树状笔记` | 应用显示名称 |
| `webDir` | `mobile-web` | Web 资源目录 |
| `server.url` | `https://qsont.me` | 加载的远程 URL |

## 添加 iOS 平台（macOS）

```bash
npm install @capacitor/ios --save
npx cap add ios
npx cap sync ios
```

## 开发工作流

### 修改 Web 资源后

```bash
# 1. 编辑 mobile-web/index.html
# 2. 同步到原生项目
npm run mobile:sync
# 3. 在 IDE 中重新运行
```

### 调试

**Android：**
- Chrome DevTools：`chrome://inspect`
- 选择设备上的 WebView

**iOS：**
- Safari → 开发 → 模拟器/设备
- 选择对应的 WebView

## 切换到本地资源模式（可选）

如果需要离线支持，可以：

1. 把 `public/` 的内容复制到 `mobile-web/`
2. 修改 `capacitor.config.json`，删除 `server.url`
3. 调整前端代码，API 请求指向远程服务器

```json
{
  "appId": "me.qsont.dnfs",
  "appName": "DNFS 树状笔记",
  "webDir": "mobile-web"
  // 删除 server.url，使用本地资源
}
```

## 原生功能扩展

Capacitor 提供了丰富的原生 API，可以按需添加：

```bash
# 相机
npm install @capacitor/camera

# 文件系统
npm install @capacitor/filesystem

# 推送通知
npm install @capacitor/push-notifications

# 本地存储
npm install @capacitor/preferences
```

使用时同步：
```bash
npx cap sync
```

## 发布

### Android

1. 在 Android Studio 中：Build → Generate Signed Bundle / APK
2. 选择 APK 或 Android App Bundle
3. 配置签名密钥
4. 生成产物上传到应用商店

### iOS

1. 在 Xcode 中：Product → Archive
2. 在 Organizer 中验证并上传
3. 在 App Store Connect 中提交审核

## 故障排查

### Android 构建失败

```bash
cd ../dnfs.android
gradlew clean
cd ../dnfs
npm run mobile:sync
```

### WebView 加载空白

检查：
- 网络连接
- `capacitor.config.json` 中的 `server.url` 是否正确
- Android 的 `AndroidManifest.xml` 是否允许网络权限

### 热更新不生效

Capacitor 默认不支持热更新，每次修改后需要：
```bash
npm run mobile:sync
```

## 相关文档

- [Capacitor 官方文档](https://capacitorjs.com/docs)
- [Android 开发指南](https://capacitorjs.com/docs/android)
- [iOS 开发指南](https://capacitorjs.com/docs/ios)

## License

ISC License

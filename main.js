const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

const DEFAULT_URL = 'https://qsont.me';
const APP_URL = process.env.DNFS_URL || DEFAULT_URL;

let mainWindow = null;

function originOf(url) {
  try { return new URL(url).origin; } catch { return null; }
}

const appOrigin = originOf(APP_URL);

// 单实例锁：重复启动时聚焦已有窗口
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 760,
    minHeight: 560,
    title: 'DNFS 树状笔记',
    icon: path.join(__dirname, 'public', 'favicon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webviewTag: false
    },
    show: false
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // 新窗口 / 新标签（window.open、target=_blank）：交给系统默认浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // 同窗口导航到站外：拦截并用系统浏览器打开（保留站内相对路径导航）
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (appOrigin && originOf(url) !== appOrigin) {
      event.preventDefault();
      if (url.startsWith('http://') || url.startsWith('https://')) {
        shell.openExternal(url);
      }
    }
  });

  mainWindow.loadURL(APP_URL);

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
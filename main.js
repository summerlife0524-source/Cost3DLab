const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let logPath = null;

/* 打包后是没有控制台的，往 stdout 写日志会触发 EPIPE 并弹错误框。
   统一改成只写本地日志文件，写失败也绝不抛错。 */
function dbg() {
  try {
    if (!logPath) return;
    var parts = [];
    for (var i = 0; i < arguments.length; i++) parts.push(String(arguments[i]));
    fs.appendFileSync(logPath, '[' + new Date().toISOString() + '] ' + parts.join(' ') + '\n', 'utf8');
  } catch (e) { /* 忽略 */ }
}

process.on('uncaughtException', function (err) {
  dbg('[uncaught]', (err && err.stack) || err);
});
process.on('unhandledRejection', function (reason) {
  dbg('[rejection]', (reason && reason.stack) || reason);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 940,
    minWidth: 1200,
    minHeight: 720,
    title: '造价3D学堂',
    backgroundColor: '#070d15',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', function () {
    mainWindow.show();
  });

  // 只记录渲染进程的报错，且写文件、不写 stdout
  mainWindow.webContents.on('console-message', function (e, level, message, line, sourceId) {
    if (level >= 3) dbg('[renderer]', message, '(' + sourceId + ':' + line + ')');
  });

  mainWindow.webContents.on('did-fail-load', function (e, code, desc) {
    dbg('[load-fail]', code, desc);
  });

  // 外链用系统浏览器打开
  mainWindow.webContents.setWindowOpenHandler(function (details) {
    if (/^https?:/i.test(details.url)) shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // F11 全屏
  mainWindow.webContents.on('before-input-event', function (event, input) {
    if (input.key === 'F11' && input.type === 'keyDown') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
  });
}

app.whenReady().then(function () {
  try { logPath = path.join(app.getPath('userData'), 'cost3d.log'); } catch (e) {}
  dbg('[boot] app ready, log =', logPath);
  Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

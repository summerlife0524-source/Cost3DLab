const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('appInfo', {
  name: '造价3D学堂',
  electron: process.versions.electron,
  platform: process.platform
});

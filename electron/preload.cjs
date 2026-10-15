const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  isMac: process.platform === 'darwin',
  setDockBadge: (text) => ipcRenderer.invoke('set-dock-badge', text),
  showNotification: (payload) => ipcRenderer.invoke('show-notification', payload),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  onMenuTrigger: (callback) => {
    ipcRenderer.on('menu-trigger', (_event, action) => callback(action));
  },
});

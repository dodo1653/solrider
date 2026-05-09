const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('minimize'),
  maximize: () => ipcRenderer.send('maximize'),
  close: () => ipcRenderer.send('close'),
  isMaximized: () => ipcRenderer.invoke('is-maximized'),
  onMaximizedChange: (callback) => {
    ipcRenderer.on('maximized-change', (event, maximized) => callback(maximized));
  },
});
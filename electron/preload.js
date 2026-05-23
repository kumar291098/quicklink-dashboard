const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('quicklink', {
  openExternalUrl: (url) => ipcRenderer.invoke('open-external-url', url),
})

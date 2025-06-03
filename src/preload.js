const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  renderTemplate: (templatePath, data = {}) => ipcRenderer.invoke('render-template', templatePath, data),

  onMenuDemoAction: (callback) => {
    ipcRenderer.on('menu-demo-action', (event, message) => callback(message));
  }
});
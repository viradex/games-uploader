const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onLogUpdate: (callback) => ipcRenderer.on("log-update", (event, details) => callback(details)),
  onLogInit: (callback) => ipcRenderer.on("log-init", (event, details) => callback(details)),
  openLogFile: () => ipcRenderer.send("open-log"),
});

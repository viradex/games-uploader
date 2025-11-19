const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Log file updated
  onLogUpdate: (callback) => ipcRenderer.on("log-update", (event, details) => callback(details)),

  // Log file created
  onLogInit: (callback) => ipcRenderer.on("log-init", (event, details) => callback(details)),

  // Request to show log file in file explorer (Finder on macOS, Explorer on Windows)
  openLogFile: () => ipcRenderer.send("open-log"),
});

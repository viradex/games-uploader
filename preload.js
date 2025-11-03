const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectVideo: () => ipcRenderer.send("select-video"),
  onNewUpload: (callback) => ipcRenderer.on("new-upload", callback),
});

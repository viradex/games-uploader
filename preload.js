const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectVideo: () => ipcRenderer.send("select-video"),
  newUpload: (callback) => ipcRenderer.on("new-upload", callback),
});

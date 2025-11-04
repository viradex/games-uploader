const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectVideo: () => ipcRenderer.send("select-video"),
  onVideoDetails: (callback) =>
    ipcRenderer.on("video-details", (event, details) => callback(details)),
  showDialog: (options) => ipcRenderer.invoke("show-dialog", options),
});

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectVideo: () => ipcRenderer.send("select-video"),
  onVideoDetails: (callback) =>
    ipcRenderer.on("video-details", (event, details) => callback(details)),
  startUpload: (details) => ipcRenderer.send("start-upload", details),
  onUploadProgress: (callback) => ipcRenderer.on("upload-progress", callback),
  cancelUpload: (uuid) => ipcRenderer.send("cancel-upload", uuid),
  showDialog: (options) => ipcRenderer.invoke("show-dialog", options),
});

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectVideo: () => ipcRenderer.send("select-video"),
  onVideoDetails: (callback) =>
    ipcRenderer.on("video-details", (event, details) => callback(details)),

  updateConfig: (updatedValues) => ipcRenderer.send("update-config", updatedValues),
  onUpdateCheckboxes: (callback) =>
    ipcRenderer.on("update-checkboxes", (event, states) => callback(states)),

  startUpload: (details) => ipcRenderer.send("start-upload", details),
  onUploadProgress: (callback) =>
    ipcRenderer.on("upload-progress", (event, details) => callback(details)),
  onUploadRemoval: (callback) => ipcRenderer.on("remove-upload", (event, uuid) => callback(uuid)),
  cancelUpload: (uuid) => ipcRenderer.send("cancel-upload", uuid),

  showDialog: (options) => ipcRenderer.invoke("show-dialog", options),
});

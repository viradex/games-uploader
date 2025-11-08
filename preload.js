const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Clicked button for choosing videos
  selectVideo: () => ipcRenderer.send("select-video"),

  // Adds an upload card in the renderer
  onVideoDetails: (callback) =>
    ipcRenderer.on("video-details", (event, details) => callback(details)),

  // Clicked checkbox, update configuration file to reflect changes
  updateConfig: (updatedValues) => ipcRenderer.send("update-config", updatedValues),

  // Change states of checkboxes when configuration file loads
  onUpdateCheckboxes: (callback) =>
    ipcRenderer.on("update-checkboxes", (event, states) => callback(states)),

  // Sent when upload card is rendered
  startUpload: (details) => ipcRenderer.send("start-upload", details),

  // When a progress update on the current upload is received
  // Used for changing status and progress/percentage
  onUploadProgress: (callback) =>
    ipcRenderer.on("upload-progress", (event, details) => callback(details)),

  // When the upload is canceled (not from UI)
  onUploadRemoval: (callback) => ipcRenderer.on("remove-upload", (event, uuid) => callback(uuid)),

  // When the upload is canceled from the UI
  cancelUpload: (uuid) => ipcRenderer.send("cancel-upload", uuid),

  // Helper function for UI, to show a native Electron message box
  showDialog: (options) => ipcRenderer.invoke("show-dialog", options),
});

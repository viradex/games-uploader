const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

const { getConfig, setConfig } = require("./src/backend/config.js");
const createAppMenu = require("./src/backend/menu.js");
const { getVideoDetails } = require("./src/backend/selectVideo.js");
const { getTokens } = require("./src/backend/auth/googleAuth.js");
const { confirmCloseApp } = require("./src/utils.js");
const Upload = require("./src/backend/upload.js");

let config;
let win; // So other functions can access it
let tokens;

const uploads = new Map();

const createWindow = () => {
  win = new BrowserWindow({
    width: 900,
    height: 640,
    resizable: false,
    backgroundColor: "#1e1e1e",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "assets", "icon.ico"),
  });

  win.on("close", async (e) => {
    confirmCloseApp(uploads, win, e);
  });

  win.loadFile("index.html");
  createAppMenu(win);
};

app.whenReady().then(async () => {
  try {
    config = getConfig();
    createWindow();

    tokens = await getTokens(win);
    console.log("YouTube tokens obtained successfully!");

    win.webContents.on("did-finish-load", () => {
      win.webContents.send("update-checkboxes", {
        showCompletionPopup: config.showCompletionPopup,
        shutDownOnComplete: config.shutDownOnComplete,
      });
    });
  } catch (err) {
    console.log("An unexpected error occurred! Please report this to the developer:");
    console.log(err);
    app.quit();
  }
});

ipcMain.on("select-video", async (event) => {
  getVideoDetails(win, config);
});

ipcMain.on("start-upload", async (event, details) => {
  const uploadInstance = new Upload(
    details.uuid,
    details.videoPath,
    details.filename,
    details.title,
    details.duration,
    details.totalSize,
    details.playlist,
    tokens,
    win,
    config.showCompletionPopup ?? true
  );

  uploads.set(details.uuid, uploadInstance);
  console.log(`Upload started for ${details.title} with UUID ${details.uuid}`);

  try {
    await uploadInstance.startUpload((progress) => {
      if (!win || win.isDestroyed()) return;
      win.webContents.send("upload-progress", progress);
    });
  } catch (err) {
    console.log(`Upload failed for video ${details.title} with UUID ${details.uuid}`);
    console.log(err);
  } finally {
    uploads.delete(details.uuid);
    if (win && !win.isDestroyed()) {
      win.webContents.send("remove-upload", details.uuid);
    }
  }
});

ipcMain.on("cancel-upload", async (event, uuid) => {
  const upload = uploads.get(uuid);
  if (upload) {
    upload.cancel();
  }
});

ipcMain.on("update-config", (event, newValues) => {
  setConfig(newValues);
});

ipcMain.handle("show-dialog", async (event, options) => {
  const result = await dialog.showMessageBox(win, options);
  return result;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

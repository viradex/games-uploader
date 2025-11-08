const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

const { getConfig, setConfig } = require("./src/backend/config.js");
const { createAppMenu, updateCancelMenuItems } = require("./src/backend/menu.js");
const getVideoDetails = require("./src/backend/selectVideo.js");
const { getTokens, getClientSecrets } = require("./src/backend/auth/googleAuth.js");
const { confirmCloseApp, shutDownComputer } = require("./src/backend/utils.js");
const Upload = require("./src/backend/upload.js");
const QueueManager = require("./src/backend/queue.js");

/**
 * Configuration file contents
 * @type {Object}
 */
let config;

/**
 * Main window reference for dialogs (instance of `BrowserWindow`)
 * @type {BrowserWindow}
 */
let win;

/**
 * Tokens file contents
 * @type {Object}
 */
let tokens;

/**
 * Client secrets file contents
 * @type {Object}
 */
let clientSecrets;

/**
 * All uploads, instance of `QueueManager`
 * @type {QueueManager}
 */
let queueManager;

/**
 * All uploads, referenced by UUID. All values are an instance of `Upload`.
 */
const uploads = new Map();

/**
 * Creates the main Electron window. Also initializes queue manager and menu.
 */
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

  // If uploads are ongoing, confirm before closing
  win.on("close", async (e) => {
    confirmCloseApp(queueManager, win, e);
  });

  win.loadFile("index.html");

  queueManager = new QueueManager(win, uploads, (queue, current) => {
    // Updates app menu disabled/enabled states
    updateCancelMenuItems(queueManager, queue, current);

    // If no remaining or current uploads, attempt to shut down computer
    if (!current && !queue.length && getConfig().shutDownOnComplete) {
      shutDownComputer(win, 60);
    }
  });

  createAppMenu(win, queueManager);
};

app.whenReady().then(async () => {
  try {
    config = getConfig();
    createWindow();

    // For notifications
    if (process.platform === "win32") {
      app.setAppUserModelId("Games Uploader");
    }

    tokens = await getTokens(win);
    clientSecrets = getClientSecrets();

    // Once the webpage has loaded, update checkboxes to whatever the config is
    win.webContents.on("did-finish-load", () => {
      win.webContents.send("update-checkboxes", {
        showCompletionNotification: config.showCompletionNotification,
        shutDownOnComplete: config.shutDownOnComplete,
      });
    });
  } catch (err) {
    console.log("An unexpected error occurred!");
    console.log(err);
    app.quit();
  }
});

// UI sends request to upload video
ipcMain.on("select-video", async (event) => {
  getVideoDetails(win, config);
});

ipcMain.on("start-upload", async (event, details) => {
  // Creates new instance of Upload
  const uploadInstance = new Upload(
    details.uuid,
    details.videoPath,
    details.filename,
    details.title,
    details.duration,
    details.totalSize,
    details.playlist,
    tokens,
    clientSecrets,
    win
  );

  // Adds a new value to the Map and queue manager
  uploads.set(details.uuid, uploadInstance);
  queueManager.add(uploadInstance);
});

// UI sends request to cancel upload
ipcMain.on("cancel-upload", async (event, uuid) => {
  queueManager.cancelSpecific(uuid);
});

ipcMain.on("update-config", (event, newValues) => {
  // When checkboxes change
  setConfig(newValues);
});

ipcMain.handle("show-dialog", async (event, options) => {
  // Show message box dialog for renderer, since it cannot access Electron methods
  const result = await dialog.showMessageBox(win, options);
  return result;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

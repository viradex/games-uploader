const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

const getConfig = require("./src/backend/config.js");
const createAppMenu = require("./src/backend/menu.js");
const selectVideo = require("./src/backend/selectVideo.js");
const getDetails = require("./src/backend/getDetails.js");
const { getTokens } = require("./src/backend/auth/googleAuth.js");
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

  win.loadFile("index.html");
  createAppMenu(win);
};

app.whenReady().then(async () => {
  try {
    config = getConfig();
    createWindow();

    tokens = await getTokens(win);
    console.log("YouTube tokens obtained successfully!");
  } catch (err) {
    console.log("An unexpected error occurred! Please report this to the developer:");
    console.log(err);
    app.quit();
  }
});

ipcMain.on("select-video", async (event) => {
  const videos = await selectVideo(win);
  const details = [];

  // Use for..of instead of forEach due to async functions
  for (const video of videos) {
    const info = await getDetails(video, config);
    details.push(info);
  }

  if (!details.length) return;
  console.log(details);
  win.webContents.send("video-details", details);
});

ipcMain.on("start-upload", async (event, details) => {
  const uploadInstance = new Upload(
    details.uuid,
    details.videoPath,
    details.filename,
    details.title,
    details.duration,
    details.totalSize,
    details.playlist
  );

  uploads.set(details.uuid, uploadInstance);
  console.log("Upload started kinda");
  console.log(uploads);
});

ipcMain.on("cancel-upload", async (event, uuid) => {
  uploads.delete(uuid);

  console.log("Deleted, new Map");
  console.log(uploads);
});

ipcMain.handle("show-dialog", async (event, options) => {
  const result = await dialog.showMessageBox(win, options);
  return result;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

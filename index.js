const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

const getConfig = require("./src/config.js");
const createAppMenu = require("./src/menu.js");
const selectVideo = require("./src/selectVideo.js");
const getDetails = require("./src/getDetails.js");

let config; // Config data
let win; // So other functions can access it

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

app.whenReady().then(() => {
  try {
    config = getConfig();
    createWindow();
  } catch (err) {
    console.error(`Error! ${err.message}`);
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

ipcMain.handle("show-dialog", async (event, options) => {
  const result = await dialog.showMessageBox(win, options);
  return result;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

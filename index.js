const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const createAppMenu = require("./src/menu.js");
const selectVideo = require("./src/selectVideo.js");
const getDetails = require("./src/getDetails.js");

let win; // So other functions can access it

const createWindow = () => {
  win = new BrowserWindow({
    width: 900,
    height: 650,
    resizable: true,
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

ipcMain.on("select-video", async (event) => {
  const videos = await selectVideo(win);
  const details = [];

  // Use for..of instead of forEach due to async functions
  for (const video of videos) {
    const info = await getDetails(video);
    details.push(info);
  }

  console.log(details);
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

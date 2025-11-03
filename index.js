const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");

const createAppMenu = require("./src/menu.js");

const createWindow = () => {
  const win = new BrowserWindow({
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
  const result = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "Videos", extensions: ["mp4", "mov", "avi", "mkv"] }],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    result.filePaths.forEach((filePath) => {
      event.sender.send("new-upload", {
        title: path.parse(filePath).name,
        filename: path.basename(filePath),
        length: "Unknown",
        size: "Unknown",
      });
    });
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

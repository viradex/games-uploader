const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

const getConfig = require("./src/config.js");
const createAppMenu = require("./src/menu.js");
const selectVideo = require("./src/selectVideo.js");
const getDetails = require("./src/getDetails.js");
const {
  getSavedTokens,
  tokensExpired,
  startOAuthFlow,
  exchangeCodeForTokens,
  saveTokens,
} = require("./src/auth/googleAuth");

let config; // Config data
let win; // So other functions can access it
let tokens;

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

    tokens = getSavedTokens();
    if (!tokens || tokensExpired(tokens)) {
      await dialog.showMessageBox(win, {
        type: "warning",
        buttons: ["OK"],
        defaultId: 0,
        title: "Google Authentication Required",
        message:
          "Your token has expired or does not exist. Please sign in to your Google account that you want to upload videos to.\n\nA webpage should open after closing this message. If it doesn't, see the console for the URL and enter it manually.",
      });

      const code = await startOAuthFlow();
      tokens = await exchangeCodeForTokens(code);
      saveTokens(tokens);
    }

    console.log(`YouTube tokens obtained successfully!`);
  } catch (err) {
    console.error(`Error! ${err.message}`);

    // throw err;
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

ipcMain.handle("yt-auth", async () => {
  return await startOAuthFlow();
});

ipcMain.handle("show-dialog", async (event, options) => {
  const result = await dialog.showMessageBox(win, options);
  return result;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

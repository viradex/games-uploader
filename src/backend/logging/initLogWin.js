const { BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");

const watchLogs = require("./logListen");
const logger = require("./loggerSingleton");

let logWin = null;

/**
 * Creates (or focuses) the log viewer window.
 */
const createLogWindow = () => {
  if (logWin && !logWin.isDestroyed()) {
    logWin.focus();
    return logWin;
  }

  // TODO attempt to group this with main window in taskbar
  logWin = new BrowserWindow({
    width: 800,
    height: 570,
    title: "Games Uploader Logs",
    backgroundColor: "#1e1e1e",
    resizable: false,
    modal: false,
    skipTaskbar: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preloadLog.js"),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false,
    },
    icon: path.join(__dirname, "..", "..", "..", "assets", "icon.ico"),
  });

  logWin.loadFile(path.join(__dirname, "log.html"));

  logWin.webContents.on("did-finish-load", () => {
    watchLogs(logWin);
  });

  // Clean up reference when closed
  logWin.on("closed", () => {
    logWin = null;
  });

  return logWin;
};

ipcMain.on("open-log", async (event) => {
  await logger.addLog("Received 'open log' request");
  shell.showItemInFolder(logger.logPath);
});

module.exports = { createLogWindow };

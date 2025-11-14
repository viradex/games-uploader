const { BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");

const watchLogs = require("./logListen");
const logger = require("./loggerSingleton");

let logWin = null;

/**
 * Creates (or focuses) the log viewer window.
 *
 * @param {BrowserWindow} parent Optional parent window
 */
const createLogWindow = (parent) => {
  if (logWin && !logWin.isDestroyed()) {
    logWin.focus();
    return logWin;
  }

  logWin = new BrowserWindow({
    width: 800,
    height: 570,
    title: "Games Uploader Logs",
    backgroundColor: "#1e1e1e",
    resizable: false,
    parent: parent ?? null,
    modal: false,
    autoHideMenuBar: true,
    menuBarVisible: false,
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
  shell.openPath(logger.logPath);
});

module.exports = { createLogWindow };

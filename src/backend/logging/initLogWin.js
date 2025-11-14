const { BrowserWindow } = require("electron");
const path = require("path");

let logWin = null;

/**
 * Creates (or focuses) the log viewer window.
 * @param {BrowserWindow} parent Optional parent window
 */
function createLogWindow(parent) {
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
      preload: path.join(__dirname, "..", "..", "..", "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, "..", "..", "..", "assets", "icon.ico"),
  });

  logWin.loadFile(path.join(__dirname, "log.html"));

  // Clean up reference when closed
  logWin.on("closed", () => {
    logWin = null;
  });

  return logWin;
}

module.exports = {
  createLogWindow,
};

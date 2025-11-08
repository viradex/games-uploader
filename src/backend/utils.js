const { dialog } = require("electron");
const { exec } = require("child_process");

const { getConfig } = require("./config.js");

/**
 * Pauses execution for a given number of milliseconds.
 *
 * @param {number} ms Number of milliseconds to pause for
 */
const sleep = async (ms) => {
  return new Promise((res) => setTimeout(res, ms));
};

/**
 * Opens a file selection dialog window for uploading videos.
 *
 * Allowed file formats are mp4, mov, avi, and mkv. Multiple selections are permitted.
 *
 * @param {string} title Title of file selection dialog window
 * @param {string} buttonName Text of confirmation button. Defaults to `"OK"`
 * @returns An empty array if the prompt was canceled or no videos were selected, or an array with absolute paths to videos
 */
const selectVideos = async (title, buttonName = "OK") => {
  // Gets default directory from configuration, or the previously opened folder
  const defaultPath = getConfig().defaultDirectory || "";

  const files = await dialog.showOpenDialog({
    title,
    defaultPath,
    buttonLabel: buttonName,
    filters: [{ name: "Videos", extensions: ["mp4", "mov", "avi", "mkv"] }],
    properties: ["openFile", "multiSelections"],
  });

  // If prompt was canceled or no files were selected, return empty array
  if (files.canceled || !files.filePaths.length) return [];
  else return files.filePaths;
};

/**
 * Confirms with the user before closing the app if there are active or pending uploads.
 *
 * @param {any} queueManager Instance of QueueManager
 * @param {any} win Instance of BrowserWindow for dialogs
 * @param {any} event Event object from listener
 */
const confirmCloseApp = async (queueManager, win, event) => {
  // If ongoing uploads, prevent default execution of closing window
  if (queueManager.hasActiveOrPendingUploads()) {
    event.preventDefault();

    const result = await dialog.showMessageBox(win, {
      type: "warning",
      title: "Uploads in Progress",
      message: "Are you sure you want to exit?",
      detail:
        "Closing the app will stop all ongoing uploads. These videos will be have to be manually removed in YouTube Studio.",
      buttons: ["OK", "Cancel"],
      defaultId: 1,
    });

    if (result.response === 0) {
      // Cancel all uploads and close windows
      queueManager.cancelAll();
      win.destroy();
    }
  }
};

/**
 * Runs the appropriate shut down command depending on the OS.
 */
const _shutDownOnDifferentOS = () => {
  const _handleErr = (err) => {
    if (err) {
      console.log("Error shutting down!");
      console.log(err);
    }
  };

  if (process.platform === "win32") exec("shutdown /s /t 0", _handleErr);
  else if (process.platform === "darwin") exec("sudo shutdown -h now", _handleErr);
  else if (process.platform === "linux") exec("shutdown now", _handleErr);
  else console.log(`Unsupported platform: ${process.platform}`);
};

/**
 * Shuts down the computer after a configurable delay.
 *
 * Checking configuration file is not done in the function and must be done separately.
 *
 * @param {any} win Instance of BrowserWindow
 * @param {number} seconds Seconds between the dialog box showing and the computer shutting down.
 * @returns
 */
const shutDownComputer = async (win, seconds = 60) => {
  let canceled = false;

  dialog
    .showMessageBox(win, {
      type: "warning",
      title: "Shutting Down Computer",
      message: `Computer will shut down in ${seconds} seconds`,
      detail: `All uploads have been completed, and the computer will shut down in ${seconds} seconds.\n\nPress OK to shut down immediately, or Cancel to abort shutdown.`,
      buttons: ["OK", "Cancel"],
      defaultId: 1,
    })
    .then((result) => {
      if (result.response === 0) {
        // OK clicked
        _shutDownOnDifferentOS();
      } else {
        canceled = true;
      }
    });

  // Wait certain delay before shutting down
  await sleep(seconds * 1000);

  if (!canceled) {
    _shutDownOnDifferentOS();
  }
};

module.exports = { sleep, selectVideos, confirmCloseApp, shutDownComputer };

const { dialog } = require("electron");
const { exec } = require("child_process");
const { google } = require("googleapis");

const { refreshAccessToken } = require("./auth/googleAuth.js");
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
 * Checks if the YouTube video title already exists.
 * Only checks the last amount of uploads as defined in `limit`
 * to prevent mass API requests and reaching quota.
 *
 * Returns the following values if any of the following cases occur:
 * - If the video does not exist, returns `false`
 * - If the video exists, but the user wishes to proceed, returns `false`
 * - If the video exists and the user wishes to cancel the upload, returns `true`
 *
 * @param {Object} tokens The OAuth tokens object
 * @param {string} title Title to check
 * @param {any} win The main BrowserWindow
 * @param {number} limit Maximum number of recent videos to check (default 50)
 * @returns {Promise<boolean>} See conditions above.
 */
const videoExists = async (tokens, title, win, limit = 50) => {
  try {
    // Refresh tokens if it doesn't exist or expired
    if (!tokens.access_token || Date.now() > tokens.expiry_date) {
      tokens = await refreshAccessToken(tokens);
    }

    // Set up credentials for YouTube API
    const oauth2Client = new google.auth.OAuth2(
      tokens.client_id,
      tokens.client_secret,
      tokens.redirect_uri
    );
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    // Fetch last few uploads as defined in 'limit' from the channel
    const res = await youtube.search.list({
      part: "snippet",
      forMine: true,
      type: "video",
      maxResults: limit,
      order: "date",
    });

    // Checks if the video title already exists
    const videos = res.data.items || [];
    const exists = videos.some((v) => v.snippet.title === title);

    if (exists) {
      const result = await dialog.showMessageBox(win, {
        type: "warning",
        title: "Video Already Exists",
        message: `A video on your YouTube channel was found with the same title of "${title}". Are you sure you want to proceed with the upload?\n\nUploading this video won't overwrite your previous one.`,
        buttons: ["OK", "Cancel"],
        defaultId: 1,
      });

      // Returns 'false' if OK was selected
      return result.response === 1;
    } else return false;
  } catch (err) {
    // Catch API errors
    dialog.showMessageBox(this.win, {
      type: "error",
      title: "Failed to Check if Video Exists",
      message: `An error occurred while checking if the provided video already existed. The console has more detailed error information that can be reported to the developer if necessary.\n\nError message: ${
        err.message || "N/A"
      }`,
      buttons: ["OK"],
    });

    console.log(`Checking if ${title} existed has failed!`);
    console.log(err);
  }
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

module.exports = { sleep, selectVideos, videoExists, confirmCloseApp, shutDownComputer };

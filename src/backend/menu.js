const { Menu, dialog, shell } = require("electron");
const path = require("path");

const combineVideos = require("./combineVideos.js");
const getVideoDetails = require("./selectVideo.js");

/**
 * Instance of Menu
 * @type {Menu}
 */
let menu;

/**
 * Confirm cancelling uploads of video(s).
 *
 * @param {any} win Instance of main BrowserWindow
 * @param {boolean} multiple Whether or not the text should change to be grammatically correct for multiple videos. Defaults to `false`
 * @returns A boolean that is `true` if the user accepted cancelling uploads
 */
const confirmRemoval = async (win, multiple = false) => {
  const result = await dialog.showMessageBox(win, {
    message: `Are you sure you want to cancel ${
      multiple ? "these uploads" : "this upload"
    }? This cannot be undone!`,
    type: "warning",
    buttons: ["OK", "Cancel"],
    title: "Cancel Upload",
  });

  return result.response === 0;
};

/**
 * Builds and applies the top menu bar for the app.
 *
 * Format:
 * `File | View | Window`
 *
 * @param {any} win Instance of main BrowserWindow to apply menu bar to
 * @param {any} queueManager Instance of QueueManager
 */
const createAppMenu = (win, queueManager) => {
  const menuTemplate = [
    {
      label: "File",
      submenu: [
        {
          label: "Upload Videos",
          click: async () => {
            // Opens file selection and starts upload process
            await getVideoDetails(win);
          },
        },
        {
          label: "Combine Videos",
          click: async () => {
            // Opens file selection and merges clips with FFmpeg, optionally allowing uploads
            await combineVideos(win);
          },
        },
        { type: "separator" },
        {
          label: "Cancel Current Upload",
          id: "cancel-current",
          enabled: false,
          click: async () => {
            // Disabled by default; when an upload is in progress, cancels the current upload
            if (await confirmRemoval(win)) {
              queueManager.cancelCurrent();
            }
          },
        },
        {
          label: "Cancel Pending Uploads",
          id: "cancel-pending",
          enabled: false,
          click: async () => {
            // Disabled by default; when uploads are in queue, cancels all uploads other than current uploading one
            if (await confirmRemoval(win)) {
              queueManager.cancelAllPending();
            }
          },
        },
        {
          label: "Cancel All Uploads",
          id: "cancel-all",
          enabled: false,
          click: async () => {
            // Disabled by default; when any upload is in queue or uploading, cancels both
            if (await confirmRemoval(win)) {
              queueManager.cancelAll();
            }
          },
        },
        { type: "separator" },
        {
          label: "Settings",
          click: async () => {
            // Shows message explaining that settings must be edited manually
            await dialog.showMessageBox(win, {
              message:
                "Editing settings must be done manually in the config.json file. Once this window is closed, the config.json file will open where you can edit settings.\nYou must restart the app for changes to apply.\n\nFor more information on how to use this file, see the README.",
              title: "Editing Settings",
              type: "info",
              buttons: ["OK"],
              defaultId: 0,
            });

            // Opens file for user's convenience
            shell.openPath(path.join(process.cwd(), "config.json"));
          },
        },
        { role: "quit" },
      ],
    },
    {
      role: "viewMenu",
    },
    {
      role: "windowMenu",
    },
  ];

  // Set as app's global menu bar
  menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
};

/**
 * Updates the enabled/disabled state of certain menu items in the menu app bar (the _Cancel Upload_ options).
 *
 * Ensures the state reflects the current progress of uploads:
 * - If there is a current upload: _Cancel Current Upload_
 * - If there are uploads in queue: _Cancel Pending Uploads_
 * - If there are multiple uploads, whether or not in current or pending: _Cancel All Uploads_
 *
 * Disables options once these are no longer the case as well.
 *
 * @param {any} queueManager Instance of QueueManager
 * @param {any[]} queue Array of Upload instances, excluding currently uploading one
 * @param {boolean} current Whether or not there is a current upload
 */
const updateCancelMenuItems = (queueManager, queue, current) => {
  // If the app hasn't built the menu yet
  if (!menu) return;

  // Enable/disable certain selections depending on state, then set as menu bar
  menu.getMenuItemById("cancel-current").enabled = current;
  menu.getMenuItemById("cancel-pending").enabled = queue.length > 0;
  menu.getMenuItemById("cancel-all").enabled = queueManager.hasActiveOrPendingUploads();
  Menu.setApplicationMenu(menu);
};

module.exports = { createAppMenu, updateCancelMenuItems };

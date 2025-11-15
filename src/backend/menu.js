const { Menu, dialog, shell } = require("electron");
const path = require("path");

const combineVideos = require("./combineVideos.js");
const { getVideoDetails } = require("./utils.js");
const { createLogWindow } = require("./logging/initLogWin.js");
const logger = require("./logging/loggerSingleton.js");

/**
 * Instance of Menu
 * @type {Menu}
 */
let menu;

/**
 * Confirm canceling uploads of video(s).
 *
 * @param {any} win Instance of main BrowserWindow
 * @param {boolean} multiple Whether or not the text should change to be grammatically correct for multiple videos. Defaults to `false`
 * @returns A boolean that is `true` if the user accepted canceling uploads
 */
const confirmRemoval = async (win, multiple = false) => {
  await logger.addLog(`Prompting user to cancel ${multiple ? "multiple" : "single"} upload(s)`);

  const result = await dialog.showMessageBox(win, {
    message: `Are you sure you want to cancel ${
      multiple ? "these uploads" : "this upload"
    }? This cannot be undone!`,
    type: "warning",
    buttons: ["OK", "Cancel"],
    title: "Cancel Upload",
  });

  await logger.addLog(`User selected: ${result.response === 0 ? "Confirm cancel" : "Cancel"}`);

  return result.response === 0;
};

/**
 * Builds and applies the top menu bar for the app.
 *
 * Format:
 * `File | Videos | Window`
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
          label: "View Logs",
          click: async () => {
            await logger.addLog("User opened log window");
            createLogWindow(win);
          },
        },
        { type: "separator" },
        {
          label: "Settings",
          click: async () => {
            await logger.addLog("User opened Settings dialog");

            // Shows message explaining that settings must be edited manually
            const result = await dialog.showMessageBox(win, {
              message:
                "Editing settings must be done manually in the config.json file. Would you like to open the file?\n\nFor more information on how to use this file, see the README.",
              title: "Editing Settings",
              type: "info",
              buttons: ["OK", "Cancel"],
              defaultId: 0,
            });

            if (result.response === 0) {
              const configPath = path.join(process.cwd(), "config.json");
              await logger.addLog(`Opening config.json at: ${configPath}`);
              shell.openPath(configPath);
            }
          },
        },
        { role: "quit" },
      ],
    },
    {
      label: "Videos",
      submenu: [
        {
          label: "Upload Videos",
          click: async () => {
            await logger.addLog("User selected: Upload Videos");
            await getVideoDetails(win);
          },
        },
        {
          label: "Combine Videos",
          click: async () => {
            await logger.addLog("User selected: Combine Videos");
            await combineVideos(win);
          },
        },
        { type: "separator" },
        {
          label: "Cancel Current Upload",
          id: "cancel-current",
          enabled: false,
          click: async () => {
            await logger.addLog("User clicked: Cancel Current Upload");

            if (await confirmRemoval(win)) {
              await logger.addLog("Confirmed: cancel current upload");
              await queueManager.cancelCurrent();
            }
          },
        },
        {
          label: "Cancel Pending Uploads",
          id: "cancel-pending",
          enabled: false,
          click: async () => {
            await logger.addLog("User clicked: Cancel Pending Uploads");

            if (await confirmRemoval(win, true)) {
              await logger.addLog("Confirmed: cancel pending uploads");
              queueManager.cancelAllPending();
            }
          },
        },
        {
          label: "Cancel All Uploads",
          id: "cancel-all",
          enabled: false,
          click: async () => {
            await logger.addLog("User clicked: Cancel All Uploads");

            if (await confirmRemoval(win, true)) {
              await logger.addLog("Confirmed: cancel all uploads");
              await queueManager.cancelAll();
            }
          },
        },
      ],
    },
    { role: "windowMenu" },
  ];

  menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
};

/**
 * Updates the enabled/disabled state of certain menu items in the menu app bar (the _Cancel Upload_ options).
 *
 * @param {any} queueManager Instance of QueueManager
 * @param {any[]} queue Array of Upload instances, excluding currently uploading one
 * @param {boolean} current Whether or not there is a current upload
 */
const updateCancelMenuItems = (queueManager, queue, current) => {
  if (!menu) return;

  // is 'await' needed here?
  logger.addLog(
    `Updating cancel menu items: current=${current}, pending=${
      queue.length
    }, anyActiveOrPending=${queueManager.hasActiveOrPendingUploads()}`,
    "debug"
  );

  menu.getMenuItemById("cancel-current").enabled = current;
  menu.getMenuItemById("cancel-pending").enabled = queue.length > 0;
  menu.getMenuItemById("cancel-all").enabled = queueManager.hasActiveOrPendingUploads();

  Menu.setApplicationMenu(menu);
};

module.exports = { createAppMenu, updateCancelMenuItems };

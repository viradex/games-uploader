const { Menu, dialog, shell } = require("electron");
const path = require("path");

const combineVideos = require("./combineVideos.js");
const { getConfig } = require("../backend/config.js");
const { getVideoDetails } = require("./selectVideo.js");

let menu;

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

const createAppMenu = (win, queueManager) => {
  const menuTemplate = [
    {
      label: "File",
      submenu: [
        {
          label: "Upload Videos",
          click: async () => {
            await getVideoDetails(win, getConfig());
          },
        },
        {
          label: "Combine Videos",
          click: async () => {
            await combineVideos(win);
          },
        },
        { type: "separator" },
        {
          label: "Cancel Current Upload",
          id: "cancel-current",
          enabled: false,
          click: async () => {
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
            if (await confirmRemoval(win)) {
              queueManager.cancelAll();
            }
          },
        },
        { type: "separator" },
        {
          label: "Settings",
          click: async () => {
            await dialog.showMessageBox(win, {
              message:
                "Editing settings must be done manually in the config.json file. Once this window is closed, the config.json file will open where you can edit settings.\n\nFor more information on how to use this file, see the README.",
              title: "Editing Settings",
              type: "info",
              buttons: ["OK"],
              defaultId: 0,
            });

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

  menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
};

const updateCancelMenuItems = (queueManager, queue, current) => {
  if (!menu) return;

  menu.getMenuItemById("cancel-current").enabled = current;
  menu.getMenuItemById("cancel-pending").enabled = queue.length > 0;
  menu.getMenuItemById("cancel-all").enabled = queueManager.hasActiveOrPendingUploads();
  Menu.setApplicationMenu(menu);
};

module.exports = { createAppMenu, updateCancelMenuItems };

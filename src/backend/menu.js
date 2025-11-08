const { Menu, dialog, shell } = require("electron");
const path = require("path");

const combineVideos = require("./combineVideos.js");
const { getConfig } = require("../backend/config.js");
const { getVideoDetails } = require("./selectVideo.js");

const createAppMenu = (win) => {
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

            shell.openPath(path.join(__dirname, "../../config.json")); // TODO change?
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

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
};

module.exports = createAppMenu;

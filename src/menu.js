const { Menu, dialog } = require("electron");

const createAppMenu = (win) => {
  const menuTemplate = [
    {
      label: "File",
      submenu: [
        // {
        //   label: "Upload Video",
        //   click: () => {
        //     win.webContents.send("select-video"); // TODO fix, currently does nothing
        //   },
        // },
        {
          label: "Settings",
          click: () => {
            dialog.showMessageBox(win, {
              message:
                "To edit settings, find the config.json file and change settings there.\n\nMore information can be found in the README.",
              title: "Editing Settings",
              type: "info",
              buttons: ["OK"],
              defaultId: 0,
            });
          },
        },
        { type: "separator" },
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

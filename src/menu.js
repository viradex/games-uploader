const { Menu } = require("electron");

const createAppMenu = (win) => {
  const menuTemplate = [
    {
      role: "fileMenu",
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

const { dialog } = require("electron");

const sleep = async (ms) => {
  return new Promise((res) => setTimeout(res, ms));
};

// TODO does this function belong here?
const confirmCloseApp = async (uploads, win, event) => {
  if (uploads.size > 0) {
    event.preventDefault();

    const result = await dialog.showMessageBox(win, {
      type: "warning",
      title: "Uploads in Progress",
      message: "Are you sure you want to exit?",
      detail:
        "Closing the app will stop all ongoing uploads. These videos will be have to be manually removed in YouTube Studio.",
      buttons: ["OK", "Cancel"],
      defaultId: 1,
      cancelId: 1,
    });

    if (result.response === 0) {
      win.destroy();
    }
  }
};

module.exports = { sleep, confirmCloseApp };

const { dialog } = require("electron");

const sleep = async (ms) => {
  return new Promise((res) => setTimeout(res, ms));
};

// TODO does this function belong here?
const confirmCloseApp = async (queueManager, win, event) => {
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
      cancelId: 1,
    });

    if (result.response === 0) {
      queueManager.cancelAll();
      win.destroy();
    }
  }
};

module.exports = { sleep, confirmCloseApp };

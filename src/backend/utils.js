const { dialog } = require("electron");
const { exec } = require("child_process");

const { getConfig } = require("./config.js");

const sleep = async (ms) => {
  return new Promise((res) => setTimeout(res, ms));
};

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
    });

    if (result.response === 0) {
      queueManager.cancelAll();
      win.destroy();
    }
  }
};

const shutDownComputer = async (win, seconds = 60) => {
  if (!getConfig().shutDownOnComplete) return;

  const result = await dialog.showMessageBox(win, {
    type: "warning",
    title: "Shutting Down Computer",
    message: `Computer will shut down in ${seconds} seconds`,
    detail: `All uploads have been completed, and the computer will shut down in ${seconds} seconds.\n\nPress OK to shut down immediately, or Cancel to abort shutdown`,
    buttons: ["OK", "Cancel"],
    defaultId: 1,
  });

  if (result.response === 1) return;
  await sleep(seconds * 1000);

  const _handleErr = (err) => {
    if (err) {
      console.log("Error shutting down!");
      console.log(err);
    }
  };

  if (process.platform === "win32") {
    // Windows
    exec("shutdown /s /t 0", _handleErr);
  } else if (process.platform === "darwin") {
    // macOS
    exec("sudo shutdown -h now", _handleErr);
  } else if (process.platform === "linux") {
    // Linux
    exec("shutdown now", _handleErr);
  } else {
    console.log(`Unsupported platform: ${process.platform}`);
  }
};

module.exports = { sleep, confirmCloseApp, shutDownComputer };

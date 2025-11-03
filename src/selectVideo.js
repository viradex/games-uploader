const { dialog } = require("electron");

const selectVideo = async (win) => {
  const files = await dialog.showOpenDialog({
    title: "Choose videos to upload",
    // defaultPath: "", // for future setting
    buttonLabel: "Upload",
    filters: [{ name: "Videos", extensions: ["mp4", "mov", "avi", "mkv"] }],
    properties: ["openFile", "multiSelections"],
  });

  if (files.canceled || !files.filePaths.length) {
    dialog.showMessageBox(win, {
      type: "warning",
      title: "Warning",
      message: "No videos were selected!",
      buttons: ["OK"],
      defaultId: 0,
    });
  } else {
    return files.filePaths;
  }
};

module.exports = selectVideo;

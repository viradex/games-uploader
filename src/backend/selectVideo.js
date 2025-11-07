const { dialog } = require("electron");
const { getConfig } = require("./config");

const selectVideo = async () => {
  const defaultPath = getConfig().defaultDirectory || "";

  const files = await dialog.showOpenDialog({
    title: "Choose videos to upload",
    defaultPath,
    buttonLabel: "Upload",
    filters: [{ name: "Videos", extensions: ["mp4", "mov", "avi", "mkv"] }],
    properties: ["openFile", "multiSelections"],
  });

  if (files.canceled || !files.filePaths.length) return [];
  else return files.filePaths;
};

module.exports = selectVideo;

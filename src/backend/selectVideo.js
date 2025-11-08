const { dialog } = require("electron");

const { getConfig } = require("../backend/config.js");
const getDetails = require("../backend/getDetails.js");

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

const getVideoDetails = async (win, config, videos = []) => {
  if (!videos.length) {
    videos = await selectVideo();
  }
  const details = [];

  // Use for..of instead of forEach due to async functions
  for (const video of videos) {
    const info = await getDetails(video, config);
    details.push(info);
  }

  if (!details.length) return;
  win.webContents.send("video-details", details);
};

module.exports = { selectVideo, getVideoDetails };

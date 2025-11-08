const { dialog } = require("electron");
const fs = require("fs");
const { execFile } = require("child_process");
const path = require("path");
const ffmpegPath = require("ffmpeg-static");

const { getConfig } = require("./config.js");
const { getVideoDetails } = require("./selectVideo.js");

const fileSelection = async () => {
  const defaultPath = getConfig().defaultDirectory || "";

  const files = await dialog.showOpenDialog({
    title: "Choose videos to combine",
    defaultPath,
    buttonLabel: "Combine",
    filters: [{ name: "Videos", extensions: ["mp4", "mov", "avi", "mkv"] }],
    properties: ["openFile", "multiSelections"],
  });

  if (files.canceled || !files.filePaths.length) return [];
  else return files.filePaths;
};

const sortVideos = (videos) => {
  return videos.sort((a, b) => {
    // Numbers can exceed 2^53, causing precision loss in a regular number
    const numA = BigInt(a.replace(/\D/g, ""));
    const numB = BigInt(b.replace(/\D/g, ""));

    // As sort() can't handle BigInt, use comparisons
    // See https://stackoverflow.com/questions/65435403/array-sorting-is-broken-with-bigint-in-js
    if (numA < numB) return -1;
    if (numA > numB) return 1;
    return 0;
  });
};

/**
 * There are only two hard things in computer science: cache invalidation and naming things.
 *
 * This runs the ffmpeg concatenator. It's different from `combineVideos()`, the main function!
 */
const concatVideos = async (fileListPath, outputPath) => {
  return new Promise((resolve, reject) => {
    execFile(
      ffmpegPath,
      // Damn Prettier ruining my array >:(
      [
        "-v",
        "error", // Suppress warnings and info messages
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        fileListPath,
        "-c",
        "copy",
        outputPath,
      ],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

const _handleErrorFS = (err) => {
  if (err) {
    console.log("Error with", file);
    console.log(err);
  }
};

const combineVideos = async (win) => {
  const files = await fileSelection();
  if (!files.length) {
    return;
  } else if (files.length === 1) {
    await dialog.showMessageBox(win, {
      message: "At least two videos must be selected to be combined.",
      title: "Too Few Videos Selected",
      type: "warning",
      buttons: ["OK"],
      defaultId: 0,
    });

    return;
  }

  const sortedFiles = sortVideos(files);
  const videosFolder = path.dirname(sortedFiles[0]);
  const fileListPath = path.join(videosFolder, "file_list.txt");

  sortedFiles.forEach((file) => {
    const text = `file '${path.basename(file)}'\n`;
    fs.appendFile(fileListPath, text, _handleErrorFS);
  });

  const combinedFile = path.join(videosFolder, "combined.mp4");
  await concatVideos(fileListPath, combinedFile);

  fs.rm(fileListPath, _handleErrorFS);
  sortedFiles.forEach((file) => {
    fs.rm(file, _handleErrorFS);
  });

  fs.rename(combinedFile, sortedFiles[0], _handleErrorFS);
  const uploadConfirm = await dialog.showMessageBox(win, {
    message: `All videos were successfully combined into "${path.basename(
      sortedFiles[0]
    )}"!\n\nWould you like to upload this video to YouTube?`,
    title: "Successfully Combined Videos",
    type: "info",
    buttons: ["OK", "Cancel"],
    defaultId: 1,
    cancelId: 1,
  });

  if (uploadConfirm.response === 0) {
    await getVideoDetails(win, getConfig(), [sortedFiles[0]]);
  }
};

module.exports = combineVideos;

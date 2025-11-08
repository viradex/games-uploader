const { dialog } = require("electron");
const fs = require("fs");
const { execFile } = require("child_process");
const path = require("path");
const ffmpegPath = require("ffmpeg-static");

const { getConfig } = require("./config.js");
const getVideoDetails = require("./selectVideo.js");
const { selectVideos } = require("./utils.js");

/**
 * Sorts videos based on date/time in title.
 *
 * @param {string[]} videos List of video titles
 * @returns The sorted list of absolute video file paths
 */
const sortVideos = (videos) => {
  return videos.sort((a, b) => {
    // Numbers can exceed 2^53, causing precision loss in a regular number
    const numA = BigInt(path.basename(a).replace(/\D/g, ""));
    const numB = BigInt(path.basename(b).replace(/\D/g, ""));

    // As sort() can't handle BigInt, use comparisons
    // See https://stackoverflow.com/questions/65435403/array-sorting-is-broken-with-bigint-in-js
    if (numA < numB) return -1;
    if (numA > numB) return 1;
    return 0;
  });
};

/**
 * This runs the FFmpeg concatenator. It's different from `combineVideos()`, the main function!
 *
 * > There are only two hard things in computer science: cache invalidation and naming things.
 *
 * @param {string} fileListPath The path the file containing all videos to concatenate
 * @param {string} outputPath The folder to output the final video to
 * @returns {Object | void} The error if failed, else nothing
 */
const concatVideos = async (fileListPath, outputPath) => {
  return new Promise((resolve, reject) => {
    execFile(
      ffmpegPath,
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

/**
 * Function to handle repetitiveness of `fs` callbacks.
 *
 * @param {any} err Error
 */
const _handleErrorFS = (err) => {
  if (err) {
    console.log("An error occurred while using the file system!");
    console.log(err);
  }
};

/**
 * Complete workflow for selecting, sorting, combining, and optionally starting an upload for multiple videos.
 *
 * @param {any} win Instance of BrowserWindow for dialogs
 */
const combineVideos = async (win) => {
  // Select videos, and exit if <2 files were selected
  const files = await selectVideos("Select videos to combine", "Combine");
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

  // Sort files based on filename date/time
  const sortedFiles = sortVideos(files);

  // Prepare settings for FFmpeg
  const videosFolder = path.dirname(sortedFiles[0]);
  const fileListPath = path.join(videosFolder, "file_list.txt");

  // Add each video file to a temporary text file for FFmpeg
  sortedFiles.forEach((file) => {
    const text = `file '${file}'\n`;
    fs.appendFile(fileListPath, text, _handleErrorFS);
  });

  // Final combined file name and location for FFmpeg, and combine videos
  const combinedFile = path.join(videosFolder, "combined.mp4");
  await concatVideos(fileListPath, combinedFile);

  // Remove temporary text file and original videos
  fs.rm(fileListPath, _handleErrorFS);
  sortedFiles.forEach((file) => {
    fs.rm(file, _handleErrorFS);
  });

  // Rename combined video to oldest original video
  fs.rename(combinedFile, sortedFiles[0], _handleErrorFS);

  // Confirm uploading the new combined video
  const uploadConfirm = await dialog.showMessageBox(win, {
    message: `All videos were successfully combined into "${path.basename(
      sortedFiles[0]
    )}"!\n\nWould you like to upload this video to YouTube?`,
    title: "Successfully Combined Videos",
    type: "info",
    buttons: ["OK", "Cancel"],
    defaultId: 1,
  });

  if (uploadConfirm.response === 0) {
    await getVideoDetails(win, getConfig(), [sortedFiles[0]]);
  }
};

module.exports = combineVideos;

const { dialog } = require("electron");
const fs = require("fs").promises;
const { execFile } = require("child_process");
const path = require("path");
const ffmpegPath = require("ffmpeg-static");

const { selectVideos, getVideoDetails } = require("./utils.js");
const logger = require("./logging/loggerSingleton.js");

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
  await logger.addLog(`Starting FFmpeg concatenation to: ${outputPath}`);

  return new Promise((resolve, reject) => {
    execFile(
      ffmpegPath,
      ["-v", "error", "-f", "concat", "-safe", "0", "-i", fileListPath, "-c", "copy", outputPath],
      async (err) => {
        if (err) {
          await logger.addLog(`FFmpeg concatenation failed: ${err.message}`, "error");
          return reject(err);
        }
        await logger.addLog(`FFmpeg concatenation completed: ${outputPath}`);
        resolve();
      }
    );
  });
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
    await logger.addLog("Only one video selected, cannot combine", "warning");
    await dialog.showMessageBox(win, {
      message: "At least two videos must be selected to be combined.",
      title: "Too Few Videos Selected",
      type: "warning",
      buttons: ["OK"],
      defaultId: 0,
    });

    return;
  }

  const confirm = await dialog.showMessageBox(win, {
    message: "Are you sure you want to combine these videos?",
    detail: "Combining the videos will cause the original videos to be deleted!",
    title: "Confirm Combining Videos",
    type: "question",
    buttons: ["OK", "Cancel"],
    defaultId: 0,
  });

  if (confirm.response === 1) return;

  await logger.addLog(`Selected ${files.length} videos for combination`);
  const sortedFiles = sortVideos(files);
  await logger.addLog(`Sorted videos: ${sortedFiles.join(", ")}`);

  // Prepare settings for FFmpeg
  const videosFolder = path.dirname(sortedFiles[0]);
  const fileListPath = path.join(videosFolder, "file_list.txt");

  // Add each video file to a temporary text file for FFmpeg
  for (const file of sortedFiles) {
    const text = `file '${file}'\n`;
    await fs.appendFile(fileListPath, text);
  }
  await logger.addLog(`Created temporary FFmpeg file list: ${fileListPath}`);

  // Final combined file name and location for FFmpeg, and combine videos
  const combinedFile = path.join(videosFolder, "combined.mp4");
  try {
    await concatVideos(fileListPath, combinedFile);
  } catch (err) {
    await logger.addError(err, "error");
    return;
  }

  // Remove temporary text file and original videos
  await fs.rm(fileListPath);
  await logger.addLog(`Deleted temporary file list: ${fileListPath}`);

  for (const file of sortedFiles) {
    await fs.rm(file);
    await logger.addLog(`Deleted original video: ${file}`);
  }

  // Rename combined video to oldest original video
  await fs.rename(combinedFile, sortedFiles[0]);
  await logger.addLog(`Renamed combined video to: ${path.basename(sortedFiles[0])}`);

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
    await logger.addLog("Uploading video...");
    await getVideoDetails(win, [sortedFiles[0]]);
  }
};

module.exports = combineVideos;

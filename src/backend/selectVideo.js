const { selectVideos } = require("./utils.js");
const getDetails = require("./getDetails.js");

/**
 * Gathers information about multiple videos and sends to UI.
 *
 * @param {any} win Main BrowserWindow instance
 * @param {Object} config Configuration object
 * @param {string[]} videos Optionally, a list of pre-selected videos. If not provided, requests the user for videos
 */
const getVideoDetails = async (win, config, videos = []) => {
  // Gets videos if none were passed
  if (!videos.length) {
    videos = await selectVideos("Select videos to upload", "Upload");
  }

  const details = [];

  // Use for..of instead of forEach due to async functions
  for (const video of videos) {
    const info = await getDetails(video, config);
    details.push(info);
  }

  // If any videos were processed, send details to renderer
  if (!details.length) return;
  win.webContents.send("video-details", details);
};

module.exports = getVideoDetails;

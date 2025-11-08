const path = require("path");
const fs = require("fs").promises;
const { execFile } = require("child_process");
const crypto = require("crypto");
const ffmpegPath = require("ffmpeg-static");

const { getConfig } = require("./config.js");

/**
 * Receives a video filename and attempts to convert it into a clean, readable title.
 *
 * Supports three types of filenames:
 * - Medal.tv files (format of `<Game>YYYYMMDDHHMMSS`)
 * - Android game screen recorder (format of `<Game>_YYYY-MM-DD-HH-MM-SS`)
 * - OBS recording (format of `YYYY-MM-DD HH-MM-SS`)
 *
 * Converts it into this format: `<Game> YYYY/MM/DD HH:MM:SS`
 *
 * If none match, returns the original filename without the extension.
 *
 * @param {string} filename The filename to convert
 * @returns {string} The newly formatted title
 */
const parseVideoTitle = (filename) => {
  // Remove file extension
  filename = filename.replace(/\.[^/.]+$/, "");

  // Case 1: Video from Medal.tv
  if (filename.startsWith("MedalTV")) {
    const rest = filename.slice(7); // Remove "MedalTV"
    const gameMatch = rest.match(/^([A-Za-z]+)(\d{14})(\d{3})?$/);

    if (gameMatch) {
      const game = gameMatch[1]; // First A-Z characters for game (never has spaces)
      const dateStr = gameMatch[2]; // Rest of the characters (time/date)

      const formattedDate = `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(
        6,
        8
      )} ${dateStr.slice(8, 10)}:${dateStr.slice(10, 12)}:${dateStr.slice(12, 14)}`;
      return `${game} ${formattedDate}`;
    }
  }

  // Case 2: OBS recording
  const recordingMatch = filename.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}-\d{2}-\d{2})$/);
  if (recordingMatch) {
    const datePart = recordingMatch[1].replace(/-/g, "/"); // Replaces dashes in date to slashes
    const timePart = recordingMatch[2].replace(/-/g, ":"); // Replaces dashes in time to colons
    return `Recording ${datePart} ${timePart}`;
  }

  // Case 3: Mobile game recorder
  const gameMatch = filename.match(/^([\w ]+)[_-](\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})$/);
  if (gameMatch) {
    const gameName = gameMatch[1].replace(/\s+/g, ""); // Remove spaces from game name
    const dateStr = gameMatch[2]; // Time/date

    const dateParts = dateStr.split("-"); // Both time and dates are split only by dashes
    const formatted = `${dateParts[0]}/${dateParts[1]}/${dateParts[2]} ${dateParts[3]}:${dateParts[4]}:${dateParts[5]}`;
    return `${gameName} ${formatted}`;
  }

  return filename;
};

/**
 * Runs FFmpeg on a video file, extracting the video duration from its output and returning a formatted duration.
 *
 * The formatted duration can either be `HH:MM:SS` or `MM:SS` if the duration is less than an hour.
 * If the duration is less than a minute, it still follows the `MM:SS` format.
 *
 * @param {string} filePath The path to the video file to check the duration of
 * @returns {Promise<string | Error>} The formatted duration or an error if the parsing failed
 */
const getVideoDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    // Executes FFmpeg binary with -i flag for information
    execFile(ffmpegPath, ["-i", filePath], (err, stdout, stderr) => {
      // FFmpeg prints duration in stderr rather than stdout
      const match = stderr.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d+)/);

      if (match) {
        // Finds duration text from output
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseFloat(match[3]);

        // Directly format into string
        const hh = hours;
        const mm = String(minutes).padStart(2, "0");
        const ss = String(Math.floor(seconds)).padStart(2, "0");

        // Gives different formats depending on hours
        resolve(hours > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`);
      } else {
        reject(new Error("Could not parse duration"));
      }
    });
  });
};

/**
 * Gets the size of a file in megabytes to two decimal places of precision.
 *
 * @param {string} filePath The file to get the size of
 * @returns {Promise<string>} The size of the file in megabytes
 */
const getSize = async (filePath) => {
  const stats = await fs.stat(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
};

/**
 * Selects the correct YouTube playlist ID based on the video title date.
 *
 * Gets playlist IDs from `config.json`, or the default value if none are provided or fit the criteria.
 *
 * Assumes config such as:
 * ```json
 * "playlists": {
 *   "2025/12": "PLExamplePlaylistID202512", // Videos for December 2025
 *   "default": "PLExampleDefaultPlaylistID"
 * }
 * ```
 *
 * @param {string} title The title of the video to find the playlist for
 * @param {Object} config The entire configuration object
 * @returns The playlist ID the video belongs to based on the config
 */
const getPlaylist = (title, config) => {
  const playlists = config.playlists;

  // Gets the year and month from the date pattern
  const match = title.match(/\d{4}\/\d{2}/);
  const configKey = match ? match[0] : "default";

  // Loop through playlists and find matching playlist ID based on date
  let playlistID = "";
  for (const playlist in playlists) {
    if (playlist === configKey) {
      playlistID = playlists[playlist];
    }
  }

  return playlistID;
};

/**
 * Given a video file path, gathers all information the uploader needs to upload a video.
 *
 * Includes:
 * - Randomly generated UUID
 * - Extracted video filename
 * - Parsed video title
 * - Video duration
 * - File size in MB
 * - Playlist ID
 *
 * @param {string} videoPath Path to video to get the details of
 * @returns {{videoPath: string, uuid: string, filename: string, title: string, duration: string, totalSize: string, playlist: string }} Retrieved details of file
 */
const getDetails = async (videoPath) => {
  const uuid = crypto.randomUUID(); // For identifying different upload cards from each other
  const filename = path.basename(videoPath);
  const title = parseVideoTitle(filename);

  const duration = await getVideoDuration(videoPath);
  const totalSize = await getSize(videoPath);
  const playlist = getPlaylist(title, getConfig());

  return {
    videoPath,
    uuid,
    filename,
    title,
    duration,
    totalSize,
    playlist,
  };
};

module.exports = getDetails;

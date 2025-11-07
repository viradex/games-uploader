const path = require("path");
const fs = require("fs").promises;
const { execFile } = require("child_process");
const crypto = require("crypto");

const ffprobePath = require("ffprobe-static").path; // Binary location

const parseVideoTitle = (filename) => {
  // Remove file extension
  filename = filename.replace(/\.[^/.]+$/, "");

  // Case 1: Video from Medal.tv
  if (filename.startsWith("MedalTV")) {
    const rest = filename.slice(7); // Remove "MedalTV"
    const gameMatch = rest.match(/^([A-Za-z]+)(\d{14})(\d{3})?$/);

    if (gameMatch) {
      const game = gameMatch[1];
      const dateStr = gameMatch[2];

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
    const datePart = recordingMatch[1].replace(/-/g, "/");
    const timePart = recordingMatch[2].replace(/-/g, ":");
    return `Recording ${datePart} ${timePart}`;
  }

  // Case 3: Mobile game recorder
  const gameMatch = filename.match(/^([\w ]+)[_-](\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})$/);
  if (gameMatch) {
    const gameName = gameMatch[1].replace(/\s+/g, ""); // Remove spaces
    const dateStr = gameMatch[2];

    const dateParts = dateStr.split("-");
    const formatted = `${dateParts[0]}/${dateParts[1]}/${dateParts[2]} ${dateParts[3]}:${dateParts[4]}:${dateParts[5]}`;
    return `${gameName} ${formatted}`;
  }

  return filename;
};

const getVideoDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    execFile(
      ffprobePath,
      [
        "-v",
        "error", // Sets verbosity to error only, suppressing warnings and info messages
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1", // Sets output format
        filePath,
      ],
      (err, stdout) => {
        if (err) return reject(err);
        resolve(parseFloat(stdout)); // Duration in seconds
      }
    );
  });
};

const formatDuration = (seconds) => {
  seconds = Math.floor(seconds);

  const hours = Math.floor(seconds / 3600);
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const finalSeconds = String(seconds % 60).padStart(2, "0");

  if (hours > 0) return `${hours}:${minutes}:${finalSeconds}`;
  else return `${minutes}:${finalSeconds}`;
};

const getSize = async (filePath) => {
  const stats = await fs.stat(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
};

const getPlaylist = (title, config) => {
  const playlists = config.playlists;
  const match = title.match(/\d{4}\/\d{2}/);
  const configKey = match ? match[0] : "default";

  let playlistID = "";
  for (const playlist in playlists) {
    if (playlist === configKey) {
      playlistID = playlists[playlist];
    }
  }

  if (!playlistID) {
    playlistID = playlists["default"];
  }

  return playlistID;
};

const getDetails = async (videoPath, config) => {
  const uuid = crypto.randomUUID(); // For identifying different upload cards from each other
  const filename = path.basename(videoPath);
  const title = parseVideoTitle(filename);

  const durationSecs = await getVideoDuration(videoPath);
  const duration = formatDuration(durationSecs);

  const totalSize = await getSize(videoPath);

  const playlist = getPlaylist(title, config);

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

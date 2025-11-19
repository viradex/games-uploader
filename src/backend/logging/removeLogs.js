const fs = require("fs").promises;
const path = require("path");

const { getConfig } = require("../config");
const logger = require("./loggerSingleton.js");

/**
 * Gets the time and date the log file was created.
 *
 * @param {string} filename The log file name
 * @returns A `Date` instance of the date from the log file
 */
const parseLogTimestamp = (filename) => {
  const base = filename.replace(".log", "");
  const [datePart, timePart] = base.split("_");

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split("-").map(Number);

  return new Date(year, month - 1, day, hour, minute, second, 0);
};

/**
 * Checks if the given log filename is older than a given number of weeks.
 *
 * @param {string} filename The log file name
 * @param {number} weeks The number of weeks until file deletion
 * @returns If the file is older than the weeks requested, returns `true`
 */
const isOlderThanWeeks = (filename, weeks) => {
  const logDate = parseLogTimestamp(filename);
  const now = new Date();

  const secondsInWeek = 7 * 24 * 60 * 60;
  const requiredAge = weeks * secondsInWeek;

  const ageInSeconds = Math.floor((now - logDate) / 1000);

  return ageInSeconds >= requiredAge;
};

/**
 * Lists all log files in a directory (files that end in `.log`).
 *
 * @param {string} dir Full path to the directory to search
 * @returns Array of paths to log files
 */
const listLogFiles = async (dir) => {
  const files = await fs.readdir(dir, { withFileTypes: true });

  return files
    .filter((file) => file.isFile() && file.name.toLowerCase().endsWith(".log"))
    .map((file) => path.join(dir, file.name));
};

/**
 * Main function for deleting logs. Automatically gets the log retention weeks from
 * the configuration file and deletes the log files accordingly.
 */
const checkAndDeleteLogs = async () => {
  const logRetentionWeeks = getConfig().logRetentionWeeks;
  if (!logRetentionWeeks) return;

  const allLogs = await listLogFiles(logger.logFolder);
  const oldLogs = allLogs.filter((filePath) =>
    isOlderThanWeeks(path.basename(filePath), logRetentionWeeks)
  );

  for (const log of oldLogs) {
    await fs.rm(log);
    await logger.addLog(`Deleted log file ${path.basename(log)}`);
  }
};

module.exports = checkAndDeleteLogs;

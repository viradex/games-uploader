const fs = require("fs").promises;
const path = require("path");

const { getConfig } = require("../config");
const logger = require("./loggerSingleton.js");

const parseLogTimestamp = (filename) => {
  const base = filename.replace(".log", "");
  const [datePart, timePart] = base.split("_");

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split("-").map(Number);

  return new Date(year, month - 1, day, hour, minute, second, 0);
};

const isOlderThanWeeks = (filename, weeks) => {
  const logDate = parseLogTimestamp(filename);
  const now = new Date();

  const secondsInWeek = 7 * 24 * 60 * 60;
  const requiredAge = weeks * secondsInWeek;

  const ageInSeconds = Math.floor((now - logDate) / 1000);

  return ageInSeconds >= requiredAge;
};

const listLogFiles = async (dir) => {
  const files = await fs.readdir(dir, { withFileTypes: true });

  return files
    .filter((file) => file.isFile() && file.name.toLowerCase().endsWith(".log"))
    .map((file) => path.join(dir, file.name));
};

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

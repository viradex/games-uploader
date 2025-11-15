const path = require("path");
const fs = require("fs").promises;

class Logger {
  /**
   * Initializes the logger. Used to output verbose log messages to a log file.
   *
   * @param {string} logFile A specific filename for the log file. This can be created using the static `Logger.createLogFilename()` method
   * @param {boolean} logToConsole Whether or not to log each line to stdout
   */
  constructor(logFile, logToConsole = true) {
    this.logFile = logFile;
    this.logFolder = path.join(process.cwd(), "logs");
    this.logPath = path.join(this.logFolder, logFile);
    this.logToConsole = logToConsole;
  }

  /**
   * Check if a file exists
   *
   * @returns Whether the file exists or not
   */
  async #fileExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Pre-defined text for either header or footer.
   *
   * @param {"header" | "footer"} location Either "header" or "footer"
   */
  #headerFooterMessage(location) {
    const date = new Date();

    const pad = (num) => String(num).padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());

    const formattedDate = `${year}-${month}-${day}_${hour}-${minute}-${second}`;

    if (location === "header") {
      return [
        "Games Uploader Verbose Log",
        "==========================",
        "",
        `Started: ${formattedDate}`,
        `Running from: ${process.cwd()}`,
        "",
        "--- START LOGGING ---",
        "",
        "",
      ].join("\n");
    } else if (location === "footer") {
      return ["", "--- END LOGGING ---", "", `Finished: ${formattedDate}`, ""].join("\n");
    } else {
      throw new TypeError(
        `Parameter 'location' did not match expected values "header" or "footer", received "${location}"`
      );
    }
  }

  /**
   * Format the current time into `HH:MM:SS.MS` for example `15:45:23.967`.
   *
   * @returns The formatted time
   */
  #formatTime() {
    const pad = (num, length = 2) => String(num).padStart(length, "0");
    const now = new Date();

    const hour = pad(now.getHours());
    const minute = pad(now.getMinutes());
    const second = pad(now.getSeconds());
    const millisecond = pad(now.getMilliseconds(), 3);

    return `${hour}:${minute}:${second}.${millisecond}`;
  }

  /**
   * Creates a filename for the log file, based on local time.
   * Filename is in format `YYYY-MM-DD_HH-MM-SS.log`.
   *
   * The file is not actually created, only the name is returned.
   *
   * @returns The filename for the log file
   */
  static createLogFilename() {
    const date = new Date();

    const pad = (num) => String(num).padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());

    return `${year}-${month}-${day}_${hour}-${minute}-${second}.log`;
  }

  /**
   * Creates the log file as specified in `logPath`.
   * If it already exists, the file is not created.
   *
   * @returns `true` if the file was created, or `false` if an error occurred or the file exists
   */
  async createLogFile() {
    try {
      if (!(await this.#fileExists(this.logFolder))) {
        await fs.mkdir(this.logFolder, { recursive: true });
      }

      if (await this.#fileExists(this.logPath)) return false;

      await fs.writeFile(this.logPath, this.#headerFooterMessage("header"), "utf-8");
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  /**
   * Adds finishing message to log file.
   */
  async endLogFile() {
    if (await this.#fileExists(this.logFolder)) {
      await fs.appendFile(this.logPath, this.#headerFooterMessage("footer"), "utf-8");
    }
  }

  /**
   * Adds a log message to the log file.
   *
   * @param {string} message The message
   * @param {"debug" | "info" | "warning" | "error" | "critical"} level The severity level of the message, defaults to 'info'
   */
  async addLog(message, level = "info") {
    if (!(await this.#fileExists(this.logPath))) await this.createLogFile();

    const line = `[${this.#formatTime()}] [${level.toUpperCase()}] ${message}\n`;
    if (this.logToConsole) console.log(line.trimEnd());

    await fs.appendFile(this.logPath, line, "utf-8");
  }

  /**
   * Adds an error message with stack trace to the log file.
   *
   * @param {Error} error The Error object
   * @param {"warning" | "error" | "critical"} level The severity level of the error, defaults to 'error'
   * @param {string} message The message before the stack trace, defaults to 'an error occurred'
   */
  async addError(error, level = "error", message = "An error occurred!") {
    if (!(await this.#fileExists(this.logPath))) await this.createLogFile();

    const line = [
      `[${this.#formatTime()}] [${level.toUpperCase()}] ${message}`,
      "",
      "--- BEGIN ERROR MESSAGE ---",
      "",
      `${error.stack ?? error.message}`,
      "",
      "--- END ERROR MESSAGE ---",
      "",
      "",
    ].join("\n");

    if (this.logToConsole) console.log(line.trimEnd());
    await fs.appendFile(this.logPath, line, "utf-8");
  }
}

module.exports = Logger;

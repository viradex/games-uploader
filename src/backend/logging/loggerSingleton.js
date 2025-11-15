const Logger = require("./logger");

/**
 * A singleton `Logger` for easy access across multiple files.
 * @type {Logger}
 */
const logger = new Logger(Logger.createLogFilename());

module.exports = logger;

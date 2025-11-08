const fs = require("fs");
const path = require("path");
const { dialog } = require("electron");

/**
 * Gets the configuration file from disk.
 *
 * @returns {Object} The configuration file and its settings and an object
 * @throws An error if the file does not exist or has invalid JSON
 */
const getConfig = () => {
  const configPath = path.join(process.cwd(), "config.json");

  if (!fs.existsSync(configPath)) {
    dialog.showErrorBox(
      "Missing Configuration File",
      `The required configuration file could not be found at the following path: ${configPath}\n\nPlease verify that the file exists and try again.\nInformation on how to create the config.json file can be found in the README.`
    );
    throw new Error("Missing configuration file");
  }

  try {
    const data = fs.readFileSync(configPath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    // If the file has invalid JSON, usually
    dialog.showErrorBox(
      "Invalid Configuration File",
      `An unexpected error occurred while reading the configuration file: ${configPath}\n\nError details: ${err.message}\nPlease correct the issue and try again.`
    );
    throw err;
  }
};

/**
 * Changes certain settings in configuration file.
 *
 * @param {Object} obj Object containing only the settings to be changed in config file
 * @returns {boolean} Success state of saving settings
 */
const setConfig = (obj) => {
  const configPath = path.join(process.cwd(), "config.json");
  const config = getConfig();

  // New config overwrites only certain values of old config
  const newConfig = { ...config, ...obj };

  try {
    fs.writeFileSync(configPath, JSON.stringify(newConfig), "utf8");
    return true;
  } catch (err) {
    console.log("An error occurred while writing the config file!");
    console.log(err);
    return false;
  }
};

module.exports = { getConfig, setConfig };

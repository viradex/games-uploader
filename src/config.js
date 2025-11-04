const fs = require("fs");
const path = require("path");
const { dialog, app } = require("electron");

const getConfig = () => {
  // const configPath = path.join(app.getPath("userData"), "config.json");
  const configPath = path.join(__dirname, "../config.json"); // temporary TODO remove for prod
  let config;

  if (!fs.existsSync(configPath)) {
    dialog.showErrorBox(
      "Missing Configuration File",
      `The required configuration file could not be found at the following path: ${configPath}\n\nPlease verify that the file exists and try again.\nInformation on how to create the config.json file can be found in the README.`
    );
    throw new Error("Missing configuration file");
  }

  try {
    const data = fs.readFileSync(configPath, "utf8");
    config = JSON.parse(data);

    console.log("Configuration file loaded:", configPath); // debug, remove later
    return config;
  } catch (err) {
    dialog.showErrorBox(
      "Invalid Configuration File",
      `An unexpected error occurred while reading the configuration file: ${configPath}\n\nError details: ${err.message}\nPlease correct the issue and try again.`
    );
    throw err;
  }
};

module.exports = getConfig;

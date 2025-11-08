const fs = require("fs");
const path = require("path");
const { dialog } = require("electron");

const getConfig = () => {
  // const configPath = path.join(app.getPath("userData"), "config.json");
  const configPath = path.join(__dirname, "../../config.json"); // temporary TODO remove for prod

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
    dialog.showErrorBox(
      "Invalid Configuration File",
      `An unexpected error occurred while reading the configuration file: ${configPath}\n\nError details: ${err.message}\nPlease correct the issue and try again.`
    );
    throw err;
  }
};

const setConfig = (obj) => {
  const configPath = path.join(__dirname, "../../config.json");
  const config = getConfig();
  const newConfig = { ...config, ...obj };

  try {
    fs.writeFileSync(configPath, JSON.stringify(newConfig), "utf8");
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

module.exports = { getConfig, setConfig };

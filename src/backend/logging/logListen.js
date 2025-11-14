const chokidar = require("chokidar");
const fs = require("fs");

const logger = require("./loggerSingleton");

// Track last known size
let lastSize = 0;

/**
 * Sends updates to UI for log file updates.
 *
 * @param {any} win Log window `BrowserWindow`
 */
const watchLogs = (win) => {
  fs.stat(logger.logPath, (err, stats) => {
    if (err) return;

    lastSize = stats.size;

    // Read entire log file once
    if (stats.size > 0) {
      fs.readFile(logger.logPath, "utf8", (err, data) => {
        if (!err) {
          win.webContents.send("log-init", data);
        }
      });
    } else {
      // Send empty file
      win.webContents.send("log-init", "");
    }
  });

  // Watch for changes
  const watcher = chokidar.watch(logger.logPath, {
    persistent: true,
    ignoreInitial: false,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100,
    },
  });

  watcher.on("change", async () => {
    try {
      const stats = await fs.promises.stat(logger.logPath);

      if (stats.size < lastSize) {
        // Rotated or truncated
        console.log("Log file truncated or rotated — restarting from top");

        lastSize = 0;

        // Send entire new file
        fs.readFile(logger.logPath, "utf8", (err, data) => {
          if (!err) {
            win.webContents.send("log-init", data);
          }
        });

        return;
      }

      // Only read new chunks
      if (stats.size > lastSize) {
        const stream = fs.createReadStream(logger.logPath, {
          start: lastSize,
          end: stats.size,
        });

        stream.on("data", (chunk) => {
          win.webContents.send("log-update", chunk.toString());
        });

        lastSize = stats.size;
      }
    } catch (err) {
      console.log(err);
    }
  });
};

module.exports = watchLogs;

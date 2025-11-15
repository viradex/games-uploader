const logger = require("./logging/loggerSingleton.js");

class QueueManager {
  /**
   * Manages the queue system, holding pending uploads in a queue and only allowing one upload at a time.
   *
   * Functions of the queue manager:
   * - Throttle and queue uploads
   * - Only allow one upload at a time, using a FIFO system
   * - Gives UI updates
   * - Cancels pending or current uploads
   *
   * @param {any} win Instance of BrowserWindow, for dialogs
   * @param {Map<string, any>} uploads Map of the uploads, with UUID as the key and an instance of `Upload` as the value
   * @param {(queue: any[], current: boolean) => void} queueChangeCallback Called when the `queue` array changes, providing a copy of the array and if there is a current upload
   */
  constructor(win, uploads, queueChangeCallback = () => {}) {
    this.queue = [];
    this.current = null;
    this.isProcessing = false;
    this.win = win;
    this.uploads = uploads;
    this.queueChangeCallback = queueChangeCallback;
  }

  /**
   * Adds a new upload to the queue and updates the UI
   *
   * @param {any} upload Instance of `Upload`
   */
  async add(upload) {
    // Add to end of queue and callback
    this.queue.push(upload);
    this.queueChangeCallback(this.queue, !!this.current);
    await logger.addLog(`Added upload with UUID ${upload.uuid} to queue`);

    if (this.win && !this.win.isDestroyed()) {
      // Requests frontend to create new upload card
      this.win.webContents.send("upload-progress", {
        uuid: upload.uuid,
        status: "queue",
        percentDone: 0,
        sizeDone: 0,
        totalSize: upload.totalSize,
        speed: 0,
        eta: "...",
      });
    }

    // Start upload if none are currently in queue, or continue through queue
    this.processNext();
  }

  /**
   * Starts the next upload if no upload is running.
   * Gives updates to UI, handles success, failures, and cleanup, and automatically continues through uploads.
   */
  async processNext() {
    // Checks if anything is in queue
    if (this.isProcessing || !this.queue.length) return;

    // Takes first item from queue and removes it, notifying callback
    this.isProcessing = true;
    this.current = this.queue.shift();
    this.queueChangeCallback(this.queue, !!this.current);
    await logger.addLog(`Starting next upload (UUID ${this.current.uuid})`);

    try {
      // Starts the upload (uses function from Upload class)
      await this.current.startUpload((progress) => {
        if (!this.win || this.win.isDestroyed()) return;
        this.win.webContents.send("upload-progress", progress);
      });
    } catch (err) {
      // Logs failed errors
      // Dialog errors are handled in Upload class
      await logger.addError(
        err,
        "error",
        `Upload failed for video "${this.current.title}" with UUID ${this.current.uuid}`
      );
    } finally {
      // Cleanup after upload, removing from Map and UI
      if (this.current) {
        this.uploads.delete(this.current.uuid);
        if (this.win && !this.win.isDestroyed()) {
          this.win.webContents.send("remove-upload", this.current.uuid);
        }
        await logger.addLog(`Removed upload with UUID ${this.current.uuid} from queue and UI`);
      }
    }

    // Reset states and inform callback
    this.current = null;
    this.isProcessing = false;
    this.queueChangeCallback(this.queue, !!this.current);

    // Process next upload in queue
    this.processNext();
  }

  /**
   * Cancels only the upload currently in progress.
   */
  async cancelCurrent() {
    if (this.current) await this.current.cancel();
  }

  /**
   * Cancels all uploads waiting in the queue. Doesn't affect the current upload.
   */
  cancelAllPending() {
    // Informs UI to remove each queued upload
    this.queue.forEach((upload) => {
      if (this.win && !this.win.isDestroyed()) {
        this.win.webContents.send("remove-upload", upload.uuid);
      }
    });

    // Resets queue and informs callback
    this.queue = [];
    this.queueChangeCallback(this.queue, !!this.current);
  }

  /**
   * Cancels a specific upload identified by its UUID.
   *
   * @param {string} uuid The unique identifier for the upload.
   */
  async cancelSpecific(uuid) {
    if (this.current && this.current.uuid === uuid) {
      await logger.addLog(
        "Determined that the upload to be canceled is currently working, attempting cancelation"
      );
      await this.cancelCurrent();
      return;
    }

    // Prevents a race condition when canceling the first element in
    // queue during an ongoing upload (where this.current is not null)
    for (const [index, upload] of this.queue.entries()) {
      // Finds a matching UUID, then removes it from queue and UI, notifying callback
      if (upload.uuid === uuid) {
        await upload.cancel();
        const canceledUpload = this.queue.splice(index, 1)[0];
        this.queueChangeCallback(this.queue, !!this.current);

        await logger.addLog(`Found upload with UUID ${uuid} and canceled it`);

        if (this.win && !this.win.isDestroyed()) {
          this.win.webContents.send("upload-progress", {
            uuid: canceledUpload.uuid,
            status: "cancel",
            percentDone: 0,
            sizeDone: 0,
            totalSize: canceledUpload.totalSize,
            speed: 0,
          });

          this.win.webContents.send("remove-upload", canceledUpload.uuid);
          await logger.addLog("Removed upload from UI");
        }
        break;
      }
    }
  }

  /**
   * Cancels everything, both the active and pending uploads.
   */
  async cancelAll() {
    await this.cancelCurrent();
    this.cancelAllPending();
  }

  /**
   * Checks if there are any current or pending uploads.
   *
   * @returns Whether or not there are any uploads at all
   */
  hasActiveOrPendingUploads() {
    return this.isProcessing || this.queue.length > 0;
  }
}

module.exports = QueueManager;

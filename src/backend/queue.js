class QueueManager {
  constructor(win, uploads) {
    this.queue = [];
    this.current = null;
    this.isProcessing = false;
    this.win = win;
    this.uploads = uploads;
  }

  add(upload) {
    this.queue.push(upload);

    if (this.win && !this.win.isDestroyed()) {
      this.win.webContents.send("upload-progress", {
        uuid: upload.uuid,
        status: "queue",
        percentDone: 0,
        sizeDone: 0,
        totalSize: upload.totalSize,
        speed: 0,
      });
    }

    this.processNext();
  }

  async processNext() {
    if (this.isProcessing || !this.queue.length) return;

    this.isProcessing = true;
    this.current = this.queue.shift();

    try {
      await this.current.startUpload((progress) => {
        if (!this.win || this.win.isDestroyed()) return;
        this.win.webContents.send("upload-progress", progress);
      });
    } catch (err) {
      console.log(`Upload failed for video ${this.current.title} with UUID ${this.current.uuid}`);
      console.log(err);
    } finally {
      if (this.current) {
        this.uploads.delete(this.current.uuid);
        if (this.win && !this.win.isDestroyed()) {
          this.win.webContents.send("remove-upload", this.current.uuid);
        }
      }
    }

    this.current = null;
    this.isProcessing = false;

    this.processNext();
  }

  cancelCurrent() {
    if (this.current) this.current.cancel();
  }

  cancelAllPending() {
    this.queue.forEach((upload) => {
      // Cancels all pending uploads
      return upload.cancel?.();
    });
    this.queue = [];
  }

  cancelSpecific(uuid) {
    if (this.current && this.current.uuid === uuid) {
      this.cancelCurrent();
    } else {
      this.queue.forEach((upload) => {
        if (upload.uuid === uuid) {
          upload.cancel();
        }
      });
    }
  }

  cancelAll() {
    this.cancelCurrent();
    this.cancelAllPending();
  }

  hasPendingOrActiveUploads() {
    return this.isProcessing || this.queue.length > 0;
  }
}

module.exports = QueueManager;

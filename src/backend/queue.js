class QueueManager {
  constructor(win, uploads, queueChangeCallback = () => {}) {
    this.queue = [];
    this.current = null;
    this.isProcessing = false;
    this.win = win;
    this.uploads = uploads;
    this.queueChangeCallback = queueChangeCallback;
  }

  add(upload) {
    this.queue.push(upload);
    this.queueChangeCallback(this.queue, !!this.current);

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
    this.queueChangeCallback(this.queue, !!this.current);

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
    this.queueChangeCallback(this.queue, !!this.current);

    this.processNext();
  }

  cancelCurrent() {
    if (this.current) this.current.cancel();
  }

  cancelAllPending() {
    this.queue.forEach((upload) => {
      if (this.win && !this.win.isDestroyed()) {
        this.win.webContents.send("remove-upload", upload.uuid);
      }
    });

    this.queue = [];
    this.queueChangeCallback(this.queue, !!this.current);
  }

  cancelSpecific(uuid) {
    if (this.current && this.current.uuid === uuid) {
      this.cancelCurrent();
      return;
    }

    // Prevents a race condition when cancelling the first element in
    // queue during an ongoing upload (where this.current is not null)
    for (const [index, upload] of this.queue.entries()) {
      if (upload.uuid === uuid) {
        upload.cancel();
        const cancelledUpload = this.queue.splice(index, 1)[0];
        this.queueChangeCallback(this.queue, !!this.current);

        if (this.win && !this.win.isDestroyed()) {
          this.win.webContents.send("upload-progress", {
            uuid: cancelledUpload.uuid,
            status: "cancel",
            percentDone: 0,
            sizeDone: 0,
            totalSize: cancelledUpload.totalSize,
            speed: 0,
          });

          this.win.webContents.send("remove-upload", cancelledUpload.uuid);
        }
        break;
      }
    }
  }

  cancelAll() {
    this.cancelCurrent();
    this.cancelAllPending();
  }

  hasActiveOrPendingUploads() {
    return this.isProcessing || this.queue.length > 0;
  }
}

module.exports = QueueManager;

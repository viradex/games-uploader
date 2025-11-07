class Upload {
  /**
   * Initializes a single video Upload instance.
   *
   * @param {string} uuid The unique identifier for the instance
   * @param {string} filePath Path to video
   * @param {string} filename Filename of video
   * @param {string} title Title of video
   * @param {string} duration Length of video
   * @param {string | number} totalSize Total size of video in megabytes
   * @param {string} playlist Playlist the video should be added to
   */
  constructor(uuid, filePath, filename, title, duration, totalSize, playlist) {
    this.filePath = filePath;
    this.uuid = uuid;
    this.filename = filename;
    this.title = title;
    this.duration = duration;
    this.totalSize = totalSize;
    this.playlist = playlist;

    this.status = "init"; // Possible values: "init", "auth", "upload", "process", "complete", "fail", "cancel"
    this.sizeDone = 0;
    this.percentDone = 0;
    this.abortController = null;
  }

  async startUpload(progressCallback) {
    this.status = "upload";
    const total = parseFloat(this.totalSize);

    const startTime = Date.now();

    const interval = setInterval(() => {
      if (this.sizeDone >= total) {
        this.sizeDone = total;
        this.percentDone = 100;
        this.status = "complete";

        progressCallback({
          uuid: this.uuid,
          status: this.status,
          percentDone: this.percentDone,
          sizeDone: this.sizeDone,
          totalSize: total,
          speed: (total / ((Date.now() - startTime) / 1000)).toFixed(2),
          status: this.status,
        });

        clearInterval(interval);
        return;
      }

      const increment = total / 100;
      this.sizeDone += increment;
      this.percentDone = (this.sizeDone / total) * 100;

      const elapsedTime = (Date.now() - startTime) / 1000;
      const speed = this.sizeDone / elapsedTime;

      progressCallback({
        uuid: this.uuid,
        percentDone: parseFloat(this.percentDone.toFixed(2)),
        sizeDone: parseFloat(this.sizeDone.toFixed(2)),
        totalSize: total,
        speed,
        status: this.status,
      });
    }, 100);
  }
}

module.exports = Upload;

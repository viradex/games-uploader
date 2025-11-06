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
}

module.exports = Upload;

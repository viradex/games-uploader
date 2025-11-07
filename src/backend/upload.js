const { google } = require("googleapis");
const fs = require("fs");

const { refreshAccessToken } = require("./auth/googleAuth.js");

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
  constructor(uuid, filePath, filename, title, duration, totalSize, playlist, tokens) {
    this.filePath = filePath;
    this.uuid = uuid;
    this.filename = filename;
    this.title = title;
    this.duration = duration;
    this.totalSize = totalSize;
    this.playlist = playlist;
    this.tokens = tokens;

    this.status = "init"; // Possible values: "init", "auth", "upload", "process", "complete", "fail", "cancel"
    this.sizeDone = 0;
    this.percentDone = 0;
    this.abortController = null;
  }

  #emit(progressCallback, overrides = {}) {
    progressCallback({
      uuid: this.uuid,
      status: this.status,
      percentDone: this.percentDone,
      sizeDone: this.sizeDone / (1024 * 1024),
      totalSize: this.totalSize,
      speed: overrides.speed ?? 0,
      ...overrides,
    });
  }

  async #initOAuth() {
    if (!this.tokens.access_token || Date.now() > this.tokens.expiry_date) {
      this.tokens = await refreshAccessToken(this.tokens);
    }

    const oauth2Client = new google.auth.OAuth2(
      this.tokens.client_id,
      this.tokens.client_secret,
      this.tokens.redirect_uri
    );
    oauth2Client.setCredentials(this.tokens);

    return google.youtube({ version: "v3", auth: oauth2Client });
  }

  #calculateProgress(uploadedBytes, startTime) {
    const totalBytes = this.totalSize * 1024 * 1024;
    this.sizeDone = uploadedBytes;
    this.percentDone = Math.min(100, Math.round((uploadedBytes / totalBytes) * 100));

    const elapsedSec = (Date.now() - startTime) / 1000;
    const speedMB = elapsedSec > 0 ? uploadedBytes / elapsedSec / (1024 * 1024) : 0;

    return speedMB;
  }

  async startUpload(progressCallback) {
    try {
      this.status = "auth";
      this.#emit(progressCallback);

      const youtube = await this.#initOAuth();
      await youtube.channels.list({ part: "snippet", mine: true });

      this.status = "upload";
      this.#emit(progressCallback);

      let uploadedBytes = 0;
      const start = Date.now();
      this.abortController = new AbortController();

      const res = await youtube.videos.insert(
        {
          part: "snippet,status",
          requestBody: {
            snippet: { title: this.title },
            status: { privacyStatus: "private", selfDeclaredMadeForKids: false },
          },
          media: { body: fs.createReadStream(this.filePath) },
        },
        {
          signal: this.abortController.signal,
          onUploadProgress: (evt) => {
            uploadedBytes = evt.bytesRead;
            const speed = this.#calculateProgress(uploadedBytes, start);
            this.#emit(progressCallback, { speed });
          },
        }
      );

      this.status = "process";
      this.#emit(progressCallback);

      const videoId = res.data.id;
      console.log(`Uploaded video: ${videoId}`);

      if (this.playlist) {
        await youtube.playlistItems.insert({
          part: "snippet",
          requestBody: {
            snippet: {
              playlistId: this.playlist,
              resourceId: { kind: "youtube#video", videoId },
            },
          },
        });
      }

      this.status = "complete";
      this.percentDone = 100;
      this.sizeDone = this.totalSize * 1024 * 1024;
      this.#emit(progressCallback);
    } catch (err) {
      this.status = "fail";
      this.#emit(progressCallback);
      console.error("Upload failed:", err);
    }
  }
}

module.exports = Upload;

const { google } = require("googleapis");
const fs = require("fs");
const { dialog, Notification } = require("electron");
const path = require("path");

const { refreshAccessToken } = require("./auth/googleAuth.js");
const { getConfig } = require("./config.js");

class Upload {
  /**
   * Initializes a single video Upload instance for YouTube. Can be used alongside `QueueManager`.
   *
   * Handles authentication, upload progress tracking, playlist addition, and notifications.
   *
   * @param {string} uuid The unique identifier for the instance
   * @param {string} filePath Path to video
   * @param {string} filename Filename of video
   * @param {string} title Title of video
   * @param {string} duration Length of video
   * @param {string | number} totalSize Total size of video in megabytes
   * @param {string} playlist Playlist the video should be added to
   * @param {Object} tokens The tokens as an object, for authentication
   * @param {Object} clientSecrets Client secrets as an object, for authentication
   * @param {any} win Instance of BrowserWindow, for dialogs
   */
  constructor(
    uuid,
    filePath,
    filename,
    title,
    duration,
    totalSize,
    playlist,
    tokens,
    clientSecrets,
    win
  ) {
    this.filePath = filePath;
    this.uuid = uuid;
    this.filename = filename;
    this.title = title;
    this.duration = duration;
    this.totalSize = totalSize;
    this.playlist = playlist;
    this.tokens = tokens;
    this.clientSecrets = clientSecrets;
    this.win = win;

    this.status = "init"; // Possible values: "init", "auth", "queue", "upload", "process", "complete", "fail", "cancel"
    this.sizeDone = 0;
    this.percentDone = 0;
    this.abortController = null; // Function to cancel upload mid-process
  }

  /**
   * Sends a progress update to the provided callback function.
   *
   * @param {(details: Object) => void} progressCallback Callback, with the details of the upload passed
   * @param {Object} overrides Allows adding or updating properties of original details
   */
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

  /**
   * Handles authentication with YouTube API, and ensures the OAuth token is valid (refreshes if expired).
   *
   * @returns Authenticated `youtube` API client for uploading videos and managing playlists.
   */
  async #initOAuth() {
    // Checks if token is missing or expired, if so, gets a new access token
    if (!this.tokens.access_token || Date.now() > this.tokens.expiry_date) {
      this.tokens = await refreshAccessToken(this.tokens);
    }

    // Sets up credentials for YouTube API
    const oauth2Client = new google.auth.OAuth2(
      this.clientSecrets.client_id,
      this.clientSecrets.client_secret,
      this.clientSecrets.redirect_uri
    );
    oauth2Client.setCredentials(this.tokens);

    return google.youtube({ version: "v3", auth: oauth2Client });
  }

  /**
   * Calculates current progress of upload and upload speed.
   *
   * @param {number} uploadedBytes Current uploaded bytes (progress)
   * @param {number} startTime Time from `Date.now()`
   * @returns {number} Speed in MB/s
   */
  #calculateProgress(uploadedBytes, startTime) {
    // Converts video size from megabytes to bytes
    const totalBytes = this.totalSize * 1024 * 1024;

    // Computes percentage uploaded with a cap of 100% to avoid overflow
    this.sizeDone = uploadedBytes;
    this.percentDone = Math.min(100, Math.round((uploadedBytes / totalBytes) * 100));

    // Calculates elapsed time in seconds, and upload speed using that
    const elapsedSec = (Date.now() - startTime) / 1000;
    const speedMB = elapsedSec > 0 ? uploadedBytes / elapsedSec / (1024 * 1024) : 0;

    return speedMB;
  }

  /**
   * Start uploading the video to YouTube, and add it to the playlist specified once completed.
   *
   * Emits callbacks whenever the status or upload progress changes.
   *
   * @param {(details: Object) => void} progressCallback Callback, with the details of the upload passed
   * @returns The success state of the upload when finished, as a boolean.
   */
  async startUpload(progressCallback) {
    try {
      this.status = "auth";
      this.#emit(progressCallback);

      // Ensures tokens are valid and confirm authentication works
      const youtube = await this.#initOAuth();
      await youtube.channels.list({ part: "snippet", mine: true });

      this.status = "upload";
      this.#emit(progressCallback);

      // Prepare upload tracking and cancellation
      let uploadedBytes = 0;
      const start = Date.now();
      this.abortController = new AbortController();

      // Sends video file to YouTube
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
            // Called repeatedly, for changing UI progress
            uploadedBytes = evt.bytesRead;
            const speed = this.#calculateProgress(uploadedBytes, start);
            this.#emit(progressCallback, { speed });
          },
        }
      );

      this.status = "process";
      this.#emit(progressCallback);

      const videoId = res.data.id;

      // If playlist ID provided, add video to playlist
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

      // Mark upload as completed
      this.status = "complete";
      this.percentDone = 100;
      this.sizeDone = this.totalSize * 1024 * 1024;
      this.#emit(progressCallback);

      // Show system notification if allowed
      if (getConfig().showCompletionNotification) {
        new Notification({
          title: "Upload Complete",
          body: `Successfully uploaded the video "${this.title}"`,
          silent: false,
          icon: path.join(process.cwd(), "./assets/icon.ico"),
        }).show();
      }

      return true;
    } catch (err) {
      if (err.message.toLowerCase() === "the operation was aborted.") {
        // Not really a good check, but err.code doesn't work
        // If the operation was canceled by user
        this.status = "cancel";
        this.#emit(progressCallback);
      } else {
        // Actual error occurred
        this.status = "fail";
        this.#emit(progressCallback);

        // Do not use showErrorBox() due to it being synchronous
        // Also do not use 'await' as that will pause other uploads
        dialog.showMessageBox(this.win, {
          type: "error",
          title: "Failed to Upload Video",
          message: `An error occurred while uploading the video "${
            this.title
          }".\n\nError message: ${err.message || "N/A"}`,
          buttons: ["OK"],
        });

        console.log(`Uploading the video ${this.title} with UUID of ${this.uuid} has failed!`);
        console.log(err);
      }

      return false;
    }
  }

  /**
   * Stops an ongoing upload immediately, if it is running.
   */
  cancel() {
    // Checks if upload is running, only then can it be canceled
    if (this.abortController) {
      this.abortController.abort();
      this.status = "cancel";
    }
  }
}

module.exports = Upload;

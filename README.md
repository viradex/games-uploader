# Games Uploader

Uploads clips of games from Medal.tv or other screen recorders!

**🚧 FILE IS A WORK IN PROGRESS 🚧**

## Table of Contents

- [Games Uploader](#games-uploader)
  - [Table of Contents](#table-of-contents)
  - [A Quick Overview](#a-quick-overview)
- [Starting for the First Time](#starting-for-the-first-time)
  - [Getting `client_secrets.json`](#getting-client_secretsjson)
  - [Configuration File](#configuration-file)
    - [Client Secrets](#client-secrets)
    - [Default Directory](#default-directory)
    - [Show Completion Popup and Shutdown on Complete](#show-completion-popup-and-shutdown-on-complete)
    - [Video Check Limit](#video-check-limit)
    - [Playlists](#playlists)
  - [Google Authentication](#google-authentication)
- [Using the App](#using-the-app)
  - [Uploading](#uploading)

## A Quick Overview

This app gives a sleek user interface for uploading gaming clips to YouTube. It has the following features:

- Upload videos to YouTube with one button press, with a clean UI for seeing progress.
- Automatically and seemlessly convert filenames into nicely-formatted titles.
- Automatically add videos to a playlist depending on the month and year it was made.
- Combine multiple videos together, and then upload that video.
- Automatic queue system to avoid overloading bandwidth and minimizing API errors and quota limits.
- Checks if the video already exists before uploading.
- Easily cancel a specific upload, or multiple uploads.
- Shows a notification when completing an upload, which can be disabled.
- Automatically shuts down the computer once all uploads are finished, optionally.

# Starting for the First Time

Starting the app for the first time requires the client secrets, configuration, and a successful login.

## Getting `client_secrets.json`

This app requires the `client_secrets.json` file to run. Follow these steps to get the file:

1. Open [Google Cloud Console](https://console.cloud.google.com/) and sign in with the Google account that you want to upload videos to.
2. Go to Select Project → New Project. Give the app a name and click Create.
3. In the project, go to APIs & Services → Library. Search for "YouTube Data API v3" and enable it.
4. Once done, go to the main project page, and to APIs & Services → Credentials.
5. Click Create Credentials → OAuth Client ID.
6. Configure the consent screen by entering the app name, email, and external use scope. Choose Desktop app as the app type, then click Create.
7. After creating the credentials, you should be prompted to download the JSON file.
8. Edit the configuration file to point to the downloaded secrets file.

## Configuration File

The `config.json` file is required for the app to run. You must create this file with the exact name `config.json` in the same directory as the app.
You can use this content below to populate the file and modify it to your configuration.

```json
{
  "clientSecretsPath": "C:\\Data\\client_secrets.json",
  "defaultDirectory": "",
  "showCompletionNotification": false,
  "shutDownOnComplete": false,
  "videoCheckLimit": 50,
  "playlists": {
    "2025/11": "PLExamplePlaylistID202511",
    "2025/12": "PLExamplePlaylistID202512",
    "default": "PLExampleDefaultPlaylistID"
  }
}
```

### Client Secrets

The file must exist and be valid, or else the app will crash on startup.
It must point to a valid JSON client secrets file obtained from the Google Cloud Console (see above). It is important to keep this file private!
Double backslashes are required if using backslashes in the path (e.g. `C:\\Data\\Secrets`).

### Default Directory

The default directory to open when selecting videos. If none is specified, it opens the previously opened directory.
Double backslashes are required if using backslashes in the path (e.g. `C:\\Data\\Videos`).

### Show Completion Popup and Shutdown on Complete

This setting can be modified in the UI.
If `showCompletionNotification` is `true`, a message box will be shown every time an upload completes.
If `shutDownOnComplete` is `true`, the computer will automatically shut down 60 seconds after the final video has been uploaded.
If the shut down on complete option is set to `true`, the show completion popups option will be set to `true` regardless of the value entered.

### Video Check Limit

When starting an upload, the app checks if the video title already exists in your YouTube channel to ensure no duplicates are uploaded.
Changing this value can limit the number of videos checked. For example, changing this value to `20` will only check the 20 most recently uploaded videos.
Setting this to `0` disables the check. Be warned that setting this number too high could cause the quota limit to be reached quickly. A value from 10-100 is recommended.

### Playlists

The playlists are structured into years and months. Depending on the date of the video, it will be uploaded to the respective playlist.
If no playlist could be found, it uploads to the default, which is always required.
If year/month sorting is not required, only the default value should remain.
The `default` value is mandatory! All other values are optional.
A basic example which uploads videos that were made during December 2025 into a specific playlist:

```json
{
  "playlists": {
    "2025/12": "PLExamplePlaylistID202511",
    "default": "PLExampleDefaultPlaylistID"
  }
}
```

## Google Authentication

Upon launching the app for the first time, or if the tokens that were already saved were deleted, you will get this message:

![Google Auth Required](/assets/img/google_auth_required.png)

You must log in with the account you wish to upload videos to. Ignoring this prompt will cause all API requests to fail and require the app to be restarted.
When accepting the prompt, a webpage should launch in your default web browser; follow these steps:

1. Choose the account that you want to upload videos to.
2. Choose a channel, if prompted (only shows if you have multiple YouTube channels connected to the same account).
3. If you get a message saying "Google hasn't verified this app", you can click Continue safely.
4. Read the permissions the app wants. It should only be the ones listed below. If there are more permissions requested, stop the flow immediately and make a new [issue](https://github.com/viradex/games-uploader/issues).
   - Upload videos to your YouTube account
   - View and manage your videos and playlists
   - View and manage your YouTube activity, including posting public comments
5. Once done, you should get a success message. The app is now ready to use!

# Using the App

On a day-to-day basis, using the app is extremely simple as most tasks are automated and can be done in a few clicks!

## Uploading

To upload a video, simply click on the Upload Videos button.

![Blank Main Window](/assets/img/main_window_blank.png)

You can select multiple videos at once. Once done, the first video will start uploading while other videos selected (if any) will remain in the queue.

![Uploads Processing Main Window](/assets/img/uploads_processing_window.png)

Each upload is represented by an upload card on the UI. The upload card contains details about the video and its progress, such as:

- Title
- Duration
- Filename
- Status
- Progress bar (and percentage)
- Upload progress out of total size
- Upload speed

The size and speed are measured in megabytes.

The status is a brief summary of what is happening to the YouTube upload. It can be any of these texts:

| Status Text                           | Description                                  |
| ------------------------------------- | -------------------------------------------- |
| Waiting for other videos to upload... | The video is waiting in the queue            |
| Initializing...                       | The app is rendering the video's upload card |
| Authorizing...                        | The app is verifying tokens authentication   |
| Uploading (xx%)...                    | The video is in the process of uploading     |
| Processing on YouTube...              | The video is being added to the playlist     |
| Completed upload!                     | The video has been successfully uploaded     |
| Upload failed                         | The upload failed (details in message box)   |
| Cancelled upload                      | The upload was canceled by the user          |

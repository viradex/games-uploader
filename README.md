# Games Uploader

Uploads clips of games from Medal.tv or other screen recorders!

## How to get `client_secrets.json`

This app requires the client_secrets.json file to run. Follow these steps to get the file!

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
  "showCompletionPopup": false,
  "shutDownOnComplete": false,
  "playlists": {
    "2025/11": "PLExamplePlaylistID202511",
    "2025/12": "PLExamplePlaylistID202512",
    "default": "PLExampleDefaultPlaylistID"
  }
}
```

### Client Secrets

The file must exist and be valid, or else the app will crash on startup.

Must point to a valid JSON client secrets file obtained from the Google Cloud Console (see above). It is important to keep this file private!

Double backslashes are required if using backslashes in the path (e.g. `C:\\Data\\Videos`).

### Default Directory

The default directory to open when selecting videos. If none is specified, it opens the previously opened directory.

Double backslashes are required if using backslashes in the path (e.g. `C:\\Data\\Videos`).

### Show Completion Popup and Shutdown on Complete

This setting can be modified in the UI.

If `showCompletionPopup` is `true`, a message box will be shown every time an upload completes.
If `shutDownOnComplete` is `true`, the computer will automatically shut down 60 seconds after the final video has been uploaded.

If the shut down on complete option is set to `true`, the show completion popups option will be set to `true` regardless of the value entered.

### Playlists

The playlists are structured into years and months. Depending on the date of the video, it will be uploaded to the respective playlist.

If no playlist could be found, it uploads to the default, which is always required.
If year/month sorting is not required, only the default value should remain.

The 'default' value is mandatory! All other values are optional.

A basic example which uploads videos that were made during December 2025 into a specific playlist:

```json
{
  "playlists": {
    "2025/12": "PLExamplePlaylistID202511",
    "default": "PLExampleDefaultPlaylistID"
  }
}
```

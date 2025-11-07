# Games Uploader

Uploads clips of games from Medal.tv or other screen recorders!

## Configuration File

The `config.json` file is required for the app to run and follows this syntax:

```json
{
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

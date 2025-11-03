# Games Uploader

Uploads clips of games from Medal.tv or other screen recorders!

## Configuration File

The `config.json` file is required for the app to run and follows this syntax:

```json
{
  "clientSecrets": "client_secrets.json",
  "tokenPath": "token.json",
  "defaultDirectory": "",
  "playlists": {
    "2025/11": "PLExamplePlaylistID202511",
    "2025/12": "PLExamplePlaylistID202512",
    "default": "PLExampleDefaultPlaylistID"
  }
}
```

### Client Secrets

From the Google Cloud Console, creating a new project should give a JSON file.
Put the filename and path to that downloaded file and ensure it does not change!

**DO NOT SHARE THIS FILE!!! Treat it like a password!**

### Token Path

The file that is created when the app is run for the first time with client secrets.

### Default Directory

The default directory to open when selecting videos. If none is specified, it opens the previously opened directory.

### Playlists

The playlists are structured into years and months. Depending on the date of the video, it will be uploaded to the respective playlist.

If no playlist could be found, it uploads to the default, which is always required.
If year/month sorting is not required, only the default value should remain.

A basic example which uploads videos that were made during December 2025 into a specific playlist:

```json
{
  "playlists": {
    "2025/12": "PLExamplePlaylistID202511"
    "default": "PLExampleDefaultPlaylistID"
  }
}
```

const fs = require("fs");
const path = require("path");
const http = require("http");
const { app, shell, dialog } = require("electron");
const { google } = require("googleapis");

const { getConfig } = require("../config.js");

const userDataPath = app.getPath("userData");
const userEnteredSecretsPath = getConfig().clientSecretsPath;

/**
 * Redirect port for Google sign-in
 */
const REDIRECT_PORT = 52719;

/**
 * Redirect URL for Google sign-in
 */
const REDIRECT_URI = `http://127.0.0.1:${REDIRECT_PORT}`;

/**
 * Absolute path to `token.json` file
 */
const TOKEN_PATH = path.join(userDataPath, "token.json");

/**
 * Absolute path to client secrets JSON file. Relies on a `config.json` value.
 */
const CLIENT_SECRETS_PATH = path.join(process.cwd(), userEnteredSecretsPath);

/**
 * Runs the first path of an OAuth 2.0 flow for YouTube API access.
 *
 * @returns {Promise<string | Error>} Promise with either an `Error` or the code
 */
const startOAuthFlow = async () => {
  const creds = JSON.parse(fs.readFileSync(CLIENT_SECRETS_PATH, "utf8")).installed;
  const clientId = creds.client_id;

  // youtube -> full access to YouTube account
  // youtube.upload -> ability to upload videos
  const scope = encodeURIComponent(
    [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube",
    ].join(" ")
  );

  const authURL =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` + // App's client ID
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` + // Location Google redirects after login
    `&response_type=code` + // Requesting authorization code
    `&access_type=offline` + // Requesting refresh token
    `&prompt=consent` + // Always show the consent screen
    `&scope=${scope}`; // The permissions required

  console.log("Opening browser for Google login...");
  shell.openExternal(authURL);

  return new Promise((resolve, reject) => {
    // Sets a temporary server to capture the redirect
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, REDIRECT_URI);
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        res.end("Authentication error. You can close this window.");
        server.close();
        return reject(new Error(error));
      }

      if (code) {
        res.end("You are signed in. You can close this window.");
        server.close();
        return resolve(code);
      }

      res.end("Waiting for Google authentication...");
    });

    server.listen(REDIRECT_PORT, () => {
      console.log(`Listening for Google redirect on ${REDIRECT_URI}`);
    });
  });
};

/**
 * Gets the saved tokens as defined in `TOKEN_PATH` as an object.
 *
 * @returns {Object | null} The tokens as an object, or `null` if failed
 */
const getSavedTokens = () => {
  if (!fs.existsSync(TOKEN_PATH)) return null;

  try {
    return JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
  } catch {
    return null;
  }
};

/**
 * Gets the saved client secrets as defined in `CLIENT_SECRETS_PATH` as an object.
 *
 * @returns {Object | null} The client secrets as an object, or `null` if failed
 */
const getClientSecrets = () => {
  if (!fs.existsSync(CLIENT_SECRETS_PATH)) return null;

  try {
    return JSON.parse(fs.readFileSync(CLIENT_SECRETS_PATH, "utf8"));
  } catch {
    return null;
  }
};

/**
 * Saves tokens into `TOKEN_PATH`
 *
 * @param {Object} tokens Tokens to be saved
 */
const saveTokens = (tokens) => {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens), "utf8");
};

/**
 * Checks if tokens have expired
 *
 * @param {Object} tokens The tokens object
 * @returns {boolean} Whether or not the tokens have expired (`true` if they have)
 */
const tokensExpired = (tokens) => {
  if (!tokens || !tokens.access_token || !tokens.expiry_date) return true;
  return Date.now() > tokens.expiry_date;
};

/**
 * Gets tokens from the code obtained from `startOAuthFlow()`.
 *
 * @param {string} code The valid code
 * @returns Data from Google's OAuth token endpoint
 * @throws Error if no authorization code was provided, or if the token exchange failed
 */
const exchangeCodeForTokens = async (code) => {
  if (!code) throw new Error("No authorization code provided");

  // Reads client secrets to get body for request
  const creds = JSON.parse(fs.readFileSync(CLIENT_SECRETS_PATH, "utf8")).installed;
  const body = new URLSearchParams({
    code,
    client_id: creds.client_id,
    client_secret: creds.client_secret,
    redirect_uri: `http://127.0.0.1:52719`,
    grant_type: "authorization_code",
  });

  // Sends a request to Google's OAuth token endpoint
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const data = await res.json();

  if (!res.ok || !data.access_token) {
    throw new Error(`Token exchange failed: ${res.error || res.statusText}`);
  }

  // Converts expiry date to a timestamp in milliseconds
  data.expiry_date = Date.now() + data.expires_in * 1000;
  return data;
};

/**
 * Refreshes a Google OAuth access token when it has expired, using the refresh token.
 *
 * @param {Object} tokens The tokens object
 * @returns Newly-edited tokens
 * @throws Error if no refresh token is the token, or if the token refresh failed
 */
const refreshAccessToken = async (tokens) => {
  if (!tokens.refresh_token) throw new Error("No refresh token available");

  // Reads client secrets to get body for request
  const creds = JSON.parse(fs.readFileSync(CLIENT_SECRETS_PATH, "utf8")).installed;
  const body = new URLSearchParams({
    client_id: creds.client_id,
    client_secret: creds.client_secret,
    refresh_token: tokens.refresh_token,
    grant_type: "refresh_token",
  });

  // Sends a request to Google's OAuth token endpoint
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!res.ok) throw new Error(`Token refresh failed: ${res.statusText}`);

  // Edits some values of original tokens and saves it
  const data = await res.json();
  tokens.access_token = data.access_token;
  tokens.expiry_date = Date.now() + data.expires_in * 1000;
  saveTokens(tokens);

  return tokens;
};

/**
 * Complete worksflow for obtaining and managing Google OAuth tokens.
 * Handles checking saved tokens, prompting the user to authenticate if needed,
 * refreshes expired tokens, and keeps the credentials in sync with the Google API client.
 *
 * @param {any} win Instance of BrowserWindow, for dialogs
 * @returns The saved or fetched tokens
 * @throws Error if client secrets file could not be accessed
 */
const getTokens = async (win) => {
  // Ensures the client secrets file exists and the user has entered a path in config.json
  if (!fs.existsSync(CLIENT_SECRETS_PATH) || !userEnteredSecretsPath) {
    await dialog.showMessageBox(win, {
      type: "error",
      title: "Missing Client Secrets File",
      message: `The client secrets file could not be found at the following path: ${CLIENT_SECRETS_PATH}\n\nPlease verify that the file exists and the correct path is entered in config.json, and try again.\nInformation on how to get the client secrets can be found in the README.`,
      buttons: ["OK"],
    });

    throw new Error(`Client secrets file could not be found at ${CLIENT_SECRETS_PATH}`);
  }

  // Reads previously saved tokens from disk
  let tokens = getSavedTokens();

  // If no tokens are found, opens Google OAuth login page for auth code, then exchanges code for tokens and saves that to disk
  if (!tokens) {
    await dialog.showMessageBox(win, {
      type: "warning",
      buttons: ["OK"],
      defaultId: 0,
      title: "Google Authentication Required",
      message:
        "Your token has expired or does not exist. Please sign in to your Google account that you want to upload videos to.\n\nA webpage should open after closing this message. For information, see the README.",
    });

    const code = await startOAuthFlow();
    tokens = await exchangeCodeForTokens(code);
    saveTokens(tokens);
  }

  // Creates a new OAuth2 client and sets credentials using the saved or newly fetched tokens
  const creds = JSON.parse(fs.readFileSync(CLIENT_SECRETS_PATH, "utf8")).installed;
  const oauth2Client = new google.auth.OAuth2(creds.client_id, creds.client_secret, REDIRECT_URI);
  oauth2Client.setCredentials(tokens);

  // Checks if access token is missing or past expiry date
  // If so, refreshes tokens and updates OAuth2 client
  if (!tokens.access_token || Date.now() > tokens.expiry_date) {
    console.log("Access token expired, refreshing...");
    tokens = await refreshAccessToken(tokens);
    oauth2Client.setCredentials(tokens);
    console.log("Done!");
  }

  // Lists for new tokens during requests, ensuring locally saved tokens are always updated
  oauth2Client.on("tokens", (newTokens) => {
    if (newTokens.refresh_token) tokens.refresh_token = newTokens.refresh_token;
    if (newTokens.access_token) tokens.access_token = newTokens.access_token;
    if (newTokens.expiry_date) tokens.expiry_date = newTokens.expiry_date;
    saveTokens(tokens);
  });

  return tokens;
};

module.exports = {
  startOAuthFlow,
  getSavedTokens,
  getClientSecrets,
  saveTokens,
  tokensExpired,
  exchangeCodeForTokens,
  refreshAccessToken,
  getTokens,
};

const fs = require("fs");
const path = require("path");
const http = require("http");
const { app, shell, dialog } = require("electron");

const userDataPath = app.getPath("userData");

const REDIRECT_PORT = 52719;
const REDIRECT_URI = `http://127.0.0.1:${REDIRECT_PORT}`;
const TOKEN_PATH = path.join(userDataPath, "token.json");
const CLIENT_SECRETS_PATH = path.join(__dirname, "client_secrets.json"); // temp TODO see if it works when built

const startOAuthFlow = async () => {
  const creds = JSON.parse(fs.readFileSync(CLIENT_SECRETS_PATH, "utf8")).installed;
  const clientId = creds.client_id;

  const scope = encodeURIComponent(
    [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.readonly",
    ].join(" ")
  );

  const authURL =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&scope=${scope}`;

  console.log("Opening browser for Google login...");
  shell.openExternal(authURL);

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, REDIRECT_URI);
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        res.end("Authentication error. You may close this window.");
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

const getSavedTokens = () => {
  if (!fs.existsSync(TOKEN_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
  } catch {
    return null;
  }
};

const saveTokens = (tokens) => {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2), "utf8");
};

const tokensExpired = (tokens) => {
  if (!tokens || !tokens.access_token || !tokens.expiry_date) return true;
  return Date.now() > tokens.expiry_date;
};

const exchangeCodeForTokens = async (code) => {
  if (!code) throw new Error("No authorization code provided");

  const creds = JSON.parse(fs.readFileSync(CLIENT_SECRETS_PATH, "utf8")).installed;
  const body = new URLSearchParams({
    code,
    client_id: creds.client_id,
    client_secret: creds.client_secret,
    redirect_uri: `http://127.0.0.1:52719`,
    grant_type: "authorization_code",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const data = await res.json();
  console.log("Token exchange response:", data); // log for debugging

  if (!res.ok || !data.access_token) {
    throw new Error(`Token exchange failed: ${res.error || res.statusText}`);
  }

  data.expiry_date = Date.now() + data.expires_in * 1000;
  return data;
};

const refreshAccessToken = async (tokens) => {
  if (!tokens.refresh_token) throw new Error("No refresh token available");
  const creds = JSON.parse(fs.readFileSync(CLIENT_SECRETS_PATH, "utf8")).installed;

  const body = new URLSearchParams({
    client_id: creds.client_id,
    client_secret: creds.client_secret,
    refresh_token: tokens.refresh_token,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!res.ok) throw new Error(`Token refresh failed: ${res.statusText}`);
  const data = await res.json();
  tokens.access_token = data.access_token;
  tokens.expiry_date = Date.now() + data.expires_in * 1000;
  saveTokens(tokens);
  return tokens;
};

const getTokens = async (win) => {
  let tokens = getSavedTokens();
  if (!tokens || tokensExpired(tokens)) {
    await dialog.showMessageBox(win, {
      type: "warning",
      buttons: ["OK"],
      defaultId: 0,
      title: "Google Authentication Required",
      message:
        "Your token has expired or does not exist. Please sign in to your Google account that you want to upload videos to.\n\nA webpage should open after closing this message. If it doesn't, see the console for the URL and enter it manually.",
    });

    const code = await startOAuthFlow();
    tokens = await exchangeCodeForTokens(code);
    saveTokens(tokens);
  }

  return tokens;
};

module.exports = {
  startOAuthFlow,
  getSavedTokens,
  saveTokens,
  tokensExpired,
  exchangeCodeForTokens,
  refreshAccessToken,
  getTokens,
};

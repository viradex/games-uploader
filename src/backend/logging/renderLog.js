const logContainer = document.getElementById("logContainer");

window.addEventListener("DOMContentLoaded", () => {
  logContainer.scrollTop = logContainer.scrollHeight;
});

logContainer.innerText = `Games Uploader Verbose Log
==========================

Started: Friday 14th November 2025 at 15:55:02.012
...more info...

--- START LOGGING ---
[15:55:03.242] Checking if tokens exist...
[15:55:04.109] Tokens were found at "C:\\Data\\Private\\tokens.json"
[15:56:34.968] Starting upload "Minecraft 2025/11/14 12:32:54" with UUID "123e4567-e89b-12d3-a456-426614174000"...
[15:56:35.532] An error occurred!

--- BEGIN ERROR MESSAGE ---
GaxiosError: User reached quota limit
  at Object.startUpload (C:\\Data\\Code\\src\\backend\\upload.js:29:9)
  at Object.<anonymous> (C:\\Data\\Code\\src\\backend\\sandbox.js:3:24)
  at Module._compile (internal/modules/cjs/loader.js:1063:30)
  at Object.Module._extensions..js (internal/modules/cjs/loader.js:1092:10)
  at Module.load (internal/modules/cjs/loader.js:928:32)
  at Function.Module._load (internal/modules/cjs/loader.js:769:14)
  at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:72:12)
  at internal/main/run_main_module.js:17:47
--- END ERROR MESSAGE ---

[15:56:35.823] Stopping upload "Minecraft 2025/11/14 12:32:54" with UUID "123e4567-e89b-12d3-a456-426614174000"...
--- END LOGGING ---`;

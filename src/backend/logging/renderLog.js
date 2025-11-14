const logContainer = document.getElementById("logContainer");
const logFileBtn = document.getElementById("openLogBtn");

window.addEventListener("DOMContentLoaded", () => {
  logContainer.scrollTop = logContainer.scrollHeight;
});

logFileBtn.addEventListener("click", () => {
  window.electronAPI.openLogFile();
});

window.electronAPI.onLogInit((fullLog) => {
  logContainer.textContent = fullLog;
});

window.electronAPI.onLogUpdate((chunk) => {
  const atBottom = logContainer.scrollHeight - logContainer.scrollTop === logContainer.clientHeight;

  logContainer.textContent += chunk;
  if (atBottom) {
    logContainer.scrollTop = logContainer.scrollHeight;
  }
});

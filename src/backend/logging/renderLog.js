const logContainer = document.getElementById("logContainer");
const logFileBtn = document.getElementById("openLogBtn");

// When page loads, scroll to the bottom if possible
window.addEventListener("DOMContentLoaded", () => {
  logContainer.scrollTo({ top: logContainer.scrollHeight, behavior: "smooth" });
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

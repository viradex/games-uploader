import { addUploadCard, updateCard, removeUploadCard } from "./src/frontend/uploadCard.js";

const uploadBtn = document.getElementById("uploadBtn");
const uploadContainer = document.getElementById("uploadContainer");

const completionPopupChk = document.getElementById("dontShowCompletionNotification");
const shutDownChk = document.getElementById("shutDownOnComplete");

// When the 'Upload Videos' button has been selected
uploadBtn.addEventListener("click", () => {
  window.electronAPI.selectVideo();
});

// When either checkbox has been selected
completionPopupChk.addEventListener("change", (e) => {
  window.electronAPI.updateConfig({ dontShowCompletionNotification: e.target.checked });
});
shutDownChk.addEventListener("change", (e) => {
  completionPopupChk.checked = e.target.checked;
  completionPopupChk.disabled = e.target.checked;

  window.electronAPI.updateConfig({
    shutDownOnComplete: e.target.checked,
    dontShowCompletionNotification: e.target.checked,
  });
});

// When the config file first loads, change checkbox states to reflect it
window.electronAPI.onUpdateCheckboxes((states) => {
  completionPopupChk.checked = states.dontShowCompletionNotification;
  shutDownChk.checked = states.shutDownOnComplete;

  if (states.shutDownOnComplete) {
    completionPopupChk.checked = true;
    completionPopupChk.disabled = true;
  }
});

// When all details of the video have been received, make a new upload card
window.electronAPI.onVideoDetails(async (details) => {
  for (const video of details) {
    addUploadCard(video, uploadContainer);
  }

  for (const video of details) {
    await window.electronAPI.startUpload(video);
  }
});

// If a video has been removed not from the UI, update it
window.electronAPI.onUploadRemoval((uuid) => {
  removeUploadCard(uuid, false);
});

// Changes respective upload card when status or progress has changed
window.electronAPI.onUploadProgress((details) => {
  const { uuid, status, percentDone, sizeDone, totalSize, speed, eta } = details;
  updateCard(uuid, status, percentDone, sizeDone, totalSize, speed, eta);
});

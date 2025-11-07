import { addUploadCard, updateCard, removeUploadCard } from "./src/frontend/uploadCard.js";

const uploadBtn = document.getElementById("uploadBtn");
const uploadContainer = document.getElementById("uploadContainer");

const completionPopupChk = document.getElementById("showCompletionPopup");
const shutDownChk = document.getElementById("shutDownOnComplete");

uploadBtn.addEventListener("click", () => {
  window.electronAPI.selectVideo();
});

completionPopupChk.addEventListener("change", (e) => {
  window.electronAPI.updateConfig({ showCompletionPopup: e.target.checked });
});
shutDownChk.addEventListener("change", (e) => {
  if (e.target.checked) {
    completionPopupChk.checked = true;
    completionPopupChk.disabled = true;
  } else {
    completionPopupChk.checked = true;
    completionPopupChk.disabled = false;
  }

  window.electronAPI.updateConfig({
    shutDownOnComplete: e.target.checked,
    showCompletionPopup: true,
  });
});

window.electronAPI.onUpdateCheckboxes((states) => {
  completionPopupChk.checked = states.showCompletionPopup;
  shutDownChk.checked = states.shutDownOnComplete;

  if (states.shutDownOnComplete) {
    completionPopupChk.checked = true;
    completionPopupChk.disabled = true;
  }
});

window.electronAPI.onVideoDetails((details) => {
  details.forEach((video) => {
    addUploadCard(video, uploadContainer);
  });
});

window.electronAPI.onUploadRemoval((uuid) => {
  removeUploadCard(uuid, false);
});

window.electronAPI.onUploadProgress((details) => {
  const { uuid, status, percentDone, sizeDone, totalSize, speed } = details;
  updateCard(uuid, status, percentDone, sizeDone, totalSize, speed);
});

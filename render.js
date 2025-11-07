import { addUploadCard, updateCard } from "./src/frontend/uploadCard.js";

const uploadBtn = document.getElementById("uploadBtn");
const uploadContainer = document.getElementById("uploadContainer");

uploadBtn.addEventListener("click", () => {
  window.electronAPI.selectVideo();
});

window.electronAPI.onVideoDetails((details) => {
  details.forEach((video) => {
    addUploadCard(video, uploadContainer);
  });
});

window.electronAPI.onUploadProgress((details) => {
  const { uuid, status, percentDone, sizeDone, totalSize, speed } = details;
  updateCard(uuid, status, percentDone, sizeDone, totalSize, speed);
});

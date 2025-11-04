import { addUploadCard } from "./src/frontend/uploadCard.js";

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

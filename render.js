const uploadBtn = document.getElementById("uploadBtn");

uploadBtn.addEventListener("click", () => {
  window.electronAPI.selectVideo();
});

window.electronAPI.newUpload((_, uploadInfo) => {
  addUploadCard(uploadInfo);
});

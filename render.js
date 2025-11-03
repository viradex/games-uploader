const uploadBtn = document.getElementById("uploadBtn");

uploadBtn.addEventListener("click", () => {
  window.electronAPI.selectVideo();
});

window.electronAPI.onNewUpload((_, uploadInfo) => {
  addUploadCard(uploadInfo);
});

const addUploadCard = (upload, container) => {
  const card = document.createElement("div");
  card.classList.add("uploadCard");
  card.id = upload.uuid;

  card.innerHTML = `
    <div class="uploadHeader">
      <div class="uploadTitle">
        ${upload.title}
        <span class="uploadLength">• ${upload.duration}</span>
      </div>

      <div class="uploadFilenameWrapper">
        <div class="uploadFilename">${upload.filename}</div>
        <button class="deleteBtn" title="Cancel upload">🗑️</button>
      </div>
    </div>

    <div class="uploadProgress">
      <div class="uploadProgressBar" style="width: 0%"></div>
    </div>

    <div class="uploadFooter">
      <div class="uploadStatus">Initializing...</div>
      <div class="uploadSize">0 MB / ${upload.totalSize} MB (0 MB/s)</div>
    </div>
  `;

  const deleteBtn = card.querySelector(".deleteBtn");
  deleteBtn.addEventListener("click", async () => {
    await removeUploadCard(upload.uuid);
  });

  container.appendChild(card);
};

const removeUploadCard = async (uuid) => {
  const card = document.getElementById(uuid);
  if (card) {
    const result = await window.electronAPI.showDialog({
      message: "Are you sure you want to cancel this upload? This cannot be undone!",
      type: "warning",
      buttons: ["OK", "Cancel"],
      title: "Cancel Upload",
    });

    if (result.response === 0) {
      card.remove();
    }
  }
};

export { addUploadCard, removeUploadCard };

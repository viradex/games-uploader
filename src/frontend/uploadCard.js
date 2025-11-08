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
    await removeUploadCard(upload.uuid, true);
  });

  container.appendChild(card);
  window.electronAPI.startUpload(upload);
};

const updateCard = async (uuid, status, percentDone, sizeDone, totalSize, speed) => {
  const card = document.getElementById(uuid);

  const progressBar = card.querySelector(".uploadProgressBar");
  const statusDiv = card.querySelector(".uploadStatus");
  const sizeText = card.querySelector(".uploadSize");

  let statusText = "";
  switch (status) {
    case "queue":
      statusText = `Waiting for other videos to upload...`;
      break;
    case "init":
      statusText = "Initializing...";
      break;
    case "auth":
      statusText = "Authorizing...";
      break;
    case "upload":
      statusText = `Uploading... (${percentDone}%)`;
      break;
    case "process":
      statusText = "Processing on YouTube...";
      break;
    case "complete":
      statusText = "Completed upload!";
      break;
    case "fail":
      statusText = "Upload failed";
      break;
    case "cancel":
      statusText = "Cancelled upload";
      break;
    default:
      statusText = "Unknown status";
      break;
  }

  progressBar.style.width = `${percentDone}%`;
  statusDiv.textContent = statusText;
  sizeText.textContent = `${sizeDone.toFixed(2)} MB / ${totalSize} MB (${speed.toFixed(2)} MB/s)`;
};

const removeUploadCard = async (uuid, manuallyCalled) => {
  const card = document.getElementById(uuid);
  if (card) {
    if (manuallyCalled) {
      const result = await window.electronAPI.showDialog({
        message: "Are you sure you want to cancel this upload? This cannot be undone!",
        type: "warning",
        buttons: ["OK", "Cancel"],
        title: "Cancel Upload",
      });

      if (result.response === 0) {
        card.remove();
        window.electronAPI.cancelUpload(uuid);
      }
    } else {
      card.remove();
    }
  }
};

export { addUploadCard, updateCard, removeUploadCard };

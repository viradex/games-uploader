/**
 * Creates a UI card for a new video upload.
 *
 * Displays the following information:
 * - Title
 * - Duration
 * - Filename
 * - Progress
 * - Speed
 * - Status
 *
 * @param {Object} upload The details of the upload
 * @param {HTMLDivElement} container The main upload container
 */
const addUploadCard = (upload, container) => {
  // Creates new base card, applying class and UUID
  const card = document.createElement("div");
  card.classList.add("uploadCard");
  card.id = upload.uuid;

  // Adds the three main sections of the card: header, progress, and footer
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
      <div class="uploadSize">0 MB / ${Math.round(
        parseFloat(upload.totalSize)
      )} MB (0 MB/s) • ETA: unknown</div>
    </div>
  `;

  // Deletion functionality
  const deleteBtn = card.querySelector(".deleteBtn");
  deleteBtn.addEventListener("click", async () => {
    await removeUploadCard(upload.uuid, true);
  });

  // Insert at the top if it's the current upload
  container.appendChild(card);
};

/**
 * Updates visual elements of an existing upload card in the UI, mainly reflecting progress, status, and speed.
 *
 * Use `addUploadCard()` to make the new element.
 *
 * @param {string} uuid UUID to find the upload card
 * @param {string} status Current upload status
 * @param {string | number} percentDone Percentage of upload completed
 * @param {string | number} sizeDone Size uploaded currently
 * @param {string | number} totalSize Total size of upload
 * @param {string | number} speed Speed in MB/s of upload
 * @param {string} eta Estimated time of completion
 */
const updateCard = async (uuid, status, percentDone, sizeDone, totalSize, speed, eta) => {
  const card = document.getElementById(uuid);

  const progressBar = card.querySelector(".uploadProgressBar");
  const statusDiv = card.querySelector(".uploadStatus");
  const sizeText = card.querySelector(".uploadSize");

  // Maps status to text for UI
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

  // Updates progress and speed to UI
  progressBar.style.width = `${percentDone}%`;
  statusDiv.textContent = statusText;
  sizeText.textContent = `${Math.round(sizeDone)} MB / ${Math.round(totalSize)} MB (${speed.toFixed(
    2
  )} MB/s) • ETA: ${eta ?? "unknown"}`;
};

/**
 * Removes an upload card from the UI and can optionally cancel an upload if called manually.
 *
 * @param {string} uuid UUID to find the upload card
 * @param {boolean} manuallyCalled Whether or not the function was called due to the user pressing the Cancel button
 */
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
        // Remove from DOM and cancel upload from backend
        card.remove();
        window.electronAPI.cancelUpload(uuid);
      }
    } else {
      // Remove from DOM
      card.remove();
    }
  }
};

export { addUploadCard, updateCard, removeUploadCard };

const startButton = document.getElementById("start-capture-button");
const stopButton = document.getElementById("stop-capture-button");
const recordingMessage = document.getElementById("recording-message");

chrome.storage.local.get('captureActive', (result) => {
  if (result.captureActive) {
    recordingMessage.textContent = 'Recording...';
  }
});

chrome.storage.local.get('captionsData', (result) => {
  if (result.captionsData) {
    createDownloadLink(result.captionsData);
  }
});

function createDownloadLink(captionsData) {
  // Remove existing download link if present
  const existingLink = document.getElementById('captions-download-link');
  if (existingLink) {
    existingLink.remove();
  }

  const blob = new Blob([captionsData], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'captions.txt';
  link.textContent = 'Download captions';
  link.id = 'captions-download-link'; // Add an ID to the download link
  document.body.appendChild(link);
  recordingMessage.textContent = '';
}

function removeDownloadLink() {
  const existingLink = document.getElementById('captions-download-link');
  if (existingLink) {
    existingLink.remove();
  }
}

startButton.addEventListener("click", () => {
  removeDownloadLink(); // Add this line to remove the download link
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "startCapture" }, (response) => {
      console.log("Start capture message sent", response);
    });
  });
  recordingMessage.textContent = "Recording...";
});

stopButton.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "stopCapture" }, (response) => {
      console.log("Stop capture message sent", response);
    });
  });
  recordingMessage.textContent = "Processing..."; // Change the message to "Processing..."
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "downloadCaptions") {
    createDownloadLink(message.data);
  }
});

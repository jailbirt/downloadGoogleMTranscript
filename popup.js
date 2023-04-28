const startButton = document.getElementById("start-capture-button");
const stopButton = document.getElementById("stop-capture-button");
const recordingMessage = document.getElementById("recording-message");

chrome.storage.local.get(['captureActive', 'captionsData'], (result) => {
  if (result.captureActive) {
    recordingMessage.textContent = 'Recording...';
  } else if (result.captionsData) {
    createDownloadLink(result.captionsData);
  }
});

function createDownloadLink(captionsData) {
  const blob = new Blob([captionsData], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'captions.txt';
  link.textContent = 'Download captions';
  document.body.appendChild(link);
  recordingMessage.textContent = '';
}

startButton.addEventListener("click", () => {
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
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "downloadCaptions") {
    createDownloadLink(message.data);
  }
});

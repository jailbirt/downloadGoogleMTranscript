const startButton = document.getElementById("start-capture-button");
const stopButton = document.getElementById("stop-capture-button");
const recordingMessage = document.getElementById("recording-message");

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
    const link = document.createElement("a");
    link.href = message.url;
    link.download = "captions.txt";
    link.textContent = "Download captions";
    document.body.appendChild(link);
    recordingMessage.textContent = "";
  }
});

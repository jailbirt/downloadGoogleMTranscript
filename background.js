chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ captionsData: "", captureActive: false });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "downloadCaptions") {
    chrome.storage.local.set({ captionsData: message.data, captureActive: false }, () => {
      console.log("Captions data stored");
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startCapture" || message.action === "stopCapture") {
    chrome.storage.local.set({ captureActive: message.captureActive }, () => {
      console.log("Capture status updated");
    });
  }
});

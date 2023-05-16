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

self.addEventListener("unload", () => {
  chrome.storage.local.set({ captureActive: false }, () => {
    console.log("Capture status reset");
  });
});


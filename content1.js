let captionsData = "";
let captureActive = false;
const debug = 1; // Set to 1 for enabling debug, and 0 for disabling it

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startCapture") {
    console.log("Start capture message received");
    captureActive = true;
    chrome.storage.local.set({ captureActive: true });
    captureCaptions();
    sendResponse({ success: true });
  } else if (message.action === "stopCapture") {
    console.log("Stop capture message received");
    captureActive = false;
    chrome.storage.local.set({ captureActive: false });
    const processedData = processCaptions(captionsData);
    createDownloadLink(captionsData, processedData);
    sendResponse({ success: true });
    captionsData = "";
  }
});

async function captureCaptions() {
  while (captureActive) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const captionsElement = document.querySelector("div[jsname='YSxPC']");


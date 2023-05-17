let captureActive = false;
const debug = 0; // Set to 1 for enabling debug, and 0 for disabling it
let captionsData = "";
let captureTime=12000;  //capture time to 10s

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startCapture") {
    console.log("Start capture message received");
    chrome.storage.local.set({ 'captureActive': true });
    captureCaptions();
    sendResponse({ success: true });
  } else if (message.action === "stopCapture") {
    console.log("Stop capture message received");
    chrome.storage.local.set({ 'captureActive': false });
    chrome.storage.local.get('captionsData', (result) => {
      const originalData = result.captionsData || '';
      const processedData = processCaptions(originalData);
      createDownloadLink(originalData, processedData);
    });

    sendResponse({ success: true });
    captionsData = "";
  }
  return true; // Keep the message channel open for async responses
});

function captureCaptions() {
  const updateCaptureActive = () => {
    return new Promise((resolve) => {
      chrome.storage.local.get('captureActive', (result) => {
        captureActive = result.captureActive;
        resolve();
      });
    });
  };

  updateCaptureActive().then(() => {
    const intervalId = setInterval(() => {
      updateCaptureActive().then(() => {
        if (!captureActive) {
          clearInterval(intervalId);
        } else {
          const captionsElement = document.querySelector("div[jsname='YSxPC']");
          if (captionsElement) {
            const captions = captionsElement.innerText;
            console.log("Captured captions:", captions);
            captionsData += captions + "\n";
            chrome.storage.local.set({ 'captionsData': captionsData });
          }
        }
      });
    }, captureTime);
  });
}

function processCaptions(captions) {
  const lines = captions.split('\n');
  const filteredLines = [];
  const seenLines = new Set();

  const removePunctuation = (str) => str.replace(/[\p{P}\p{Z}]/gu, "");

  for (let i = 0; i < lines.length; i++) {
    const currentLine = removePunctuation(lines[i].toLowerCase());
    if (!seenLines.has(currentLine)) {
      filteredLines.push(lines[i]);
      seenLines.add(currentLine);
    }
  }

  return filteredLines.join('\n');
}

function createDownloadLink(originalData, processedData) {
  let data = "";

  if (debug && debug === 1) {
    data += "****************************************************** DEBUG ENABLED ************************\n";
    data += "****************************************************** ORIGINAL ************************\n";
    data += originalData;
    data += "\n\n****************************************************** PROCESSED *******************\n";
  }
    data += processedData;

  chrome.storage.local.set({ 'captionsData': data }, () => {
    chrome.runtime.sendMessage({ action: "downloadCaptions", data });
  });
}

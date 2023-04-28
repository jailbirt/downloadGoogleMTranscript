// With this line
chrome.storage.local.set({ 'captionsData': captions + "\n" });
let captureActive = false;
const debug = 1; // Set to 1 for enabling debug, and 0 for disabling it

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
      const captionsData = result.captionsData || '';
      const processedData = processCaptions(captionsData);
      createDownloadLink(captionsData, processedData);
    });

    createDownloadLink(captionsData, processedData);
    sendResponse({ success: true });
    captionsData = "";
  }
  return true; // Keep the message channel open for async responses
});


async function captureCaptions() {
  while (captureActive) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const captionsElement = document.querySelector("div[jsname='YSxPC']");
    if (captionsElement) {
      const captions = captionsElement.innerText;
      console.log("Captured captions:", captions);
      captionsData += captions + "\n";
    }
  }
}

function processCaptions(captions) {
  const lines = captions.split('\n');
  const filteredLines = [];

  const removePunctuation = (str) => str.replace(/[\p{P}\p{Z}]/gu, "");

  for (let i = 0; i < lines.length; i++) {
    let isSubsequence = false;
    for (let j = i + 1; j < lines.length && j < i + 50; j++) {
      const currentLine = removePunctuation(lines[i].toLowerCase());
      const nextLine = removePunctuation(lines[j].toLowerCase());

      if (nextLine.length > currentLine.length && nextLine.includes(currentLine)) {
        isSubsequence = true;
        break;
      }
    }

    if (!isSubsequence) {
      filteredLines.push(lines[i]);
    }
  }

  return filteredLines.join('\n');
}

function createDownloadLink(originalData, processedData) {
  let data = "";
  if (debug) {
    data += "****************************************************** DEBUG ENABLED ************************\n";
    data += "****************************************************** ORIGINAL ************************\n";
    data += originalData;
    data += "\n\n****************************************************** PROCESSED *******************\n";
  }
  data += processedData;

  chrome.runtime.sendMessage({ action: "downloadCaptions", data });
  chrome.storage.local.remove('captionsData');
}


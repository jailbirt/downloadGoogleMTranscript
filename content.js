let captionsData = "";
let captureActive = false;
const debug = 1; // Set to 1 for enabling debug, and 0 for disabling it

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startCapture") {
    console.log("Start capture message received");
    captureActive = true;
    captureCaptions();
    sendResponse({ success: true });
  } else if (message.action === "stopCapture") {
  console.log("Stop capture message received");
  captureActive = false;
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

  const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  chrome.runtime.sendMessage({ action: "downloadCaptions", url });
}


let captureActive = false;
const debug = 0; // Set to 1 for enabling debug, and 0 for disabling it
let captionsData = "";
let captureTime=16000;  //Increase capture time to 16s

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "ping") {
    // Respond to the "ping" message
    sendResponse({ ready: true });
    // Do not return anything
  } else if (message.action === "startCapture") {
    console.log("Start capture message received");
    chrome.storage.local.set({ 'captureActive': true });
    captureCaptions();
    sendResponse({ success: true });
    // No need to return anything here because we've already sent the response
  } else if (message.action === "stopCapture") {
    console.log("Stop capture message received");
    chrome.storage.local.set({ 'captureActive': false });
    chrome.storage.local.get('captionsData', (result) => {
      const originalData = result.captionsData || '';
      const processedData = processCaptions(originalData);
      createDownloadLink(originalData, processedData);
      sendResponse({ success: true });
      captionsData = "";
      // Return true here to indicate that we will respond asynchronously
      return true;
    });
  }
  // No need to return anything here because we've already handled all possible actions
});


function captureCaptions() {
  const intervalId = setInterval(() => {
    chrome.storage.local.get('captureActive', (result) => {
      captureActive = result.captureActive;
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
}

function processCaptions(captions) {
  const lines = captions.split('\n');
  const filteredLines = [];
  const removePunctuation = (str) => str.replace(/[\p{P}\p{Z}]/gu, "");

  for (let i = 0; i < lines.length; i++) {
    // If this is the first line, add it to the filtered lines
    if (i === 0) {
      filteredLines.push(lines[i]);
    } else {
      // If this line is not a substring of the next line, add it to the filtered lines
      const currentLine = removePunctuation(lines[i].toLowerCase());
      const nextLine = i + 1 < lines.length ? removePunctuation(lines[i + 1].toLowerCase()) : null;
      if (!nextLine || !nextLine.includes(currentLine)) {
        filteredLines.push(lines[i]);
      }
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

  chrome.runtime.sendMessage({ action: "downloadCaptions", data });
  chrome.storage.local.remove('captionsData');
}

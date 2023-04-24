let captionsData = "";
let captureActive = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startCapture") {
    console.log("Start capture message received");
    captureActive = true;
    captureCaptions();
    sendResponse({ success: true });
  } else if (message.action === "stopCapture") {
    console.log("Stop capture message received");
    captureActive = false;
    const processedCaptions = processCaptions(captionsData);
    createDownloadLink(processedCaptions);
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

  for (let i = 0; i < lines.length; i++) {
    let isSubsequence = false;
    for (let j = i + 1; j < lines.length && j < i + 10; j++) {
      const currentLine = lines[i].slice(0, -1).toLowerCase();
      const nextLine = lines[j].slice(0, -1).toLowerCase();

      if (nextLine.length > currentLine.length && nextLine.startsWith(currentLine)) {
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


function createDownloadLink(data) {
  const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  chrome.runtime.sendMessage({ action: "downloadCaptions", url });
}

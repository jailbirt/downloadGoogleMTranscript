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
    createDownloadLink(captionsData);
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

function createDownloadLink(data) {
  const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  chrome.runtime.sendMessage({ action: "downloadCaptions", url });
}

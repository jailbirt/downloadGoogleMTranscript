const outputFile = "captions_output.txt";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "capture") {
    console.log("Capture message received");
    captureCaptions();
  }
});

async function captureCaptions() {
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const captionsElement = document.querySelector("div[jsname='YSxPC']");
    if (captionsElement) {
      const captions = captionsElement.innerText;
      console.log("Captured captions:", captions);
    }
  }
}


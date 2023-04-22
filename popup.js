document.getElementById("capture-button").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "capture" });
    console.log("Capture message sent");
  });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      // Trigger the calculation by dispatching a custom event
      document.dispatchEvent(new Event('triggerCGPACalculation'));
    }
  });
});

chrome.commands.onCommand.addListener(command => {
  console.log("Running the script");
  chrome.tabs.query({ active: true }, tab => {
    console.log("Running the script");
    chrome.tabs.executeScript(tab.id, { file: "content.js" }, _ => {
      let e = chrome.runtime.lastError;
      if (e !== undefined) {
        console.log(tabId, _, e);
      }
    });

    chrome.storage.local.get(['experience'], function (data) {
        console.log('notepad data', data);
    });
  });

  if (command === "highlight_text") {
    chrome.tabs.query({ active: true }, tab => {
      chrome.tabs.executeScript(tab.id, { file: "injection_script.js" }, _ => {
        let e = chrome.runtime.lastError;
        if (e !== undefined) {
          console.log(tabId, _, e);
        }
      });
      chrome.tabs.insertCSS(tab.id, { file: "style.css" }, _ => {
        let e = chrome.runtime.lastError;
        if (e !== undefined) {
          console.log(tabId, _, e);
        }
      });
    });
  }
  if (command === "clear_storage") {
    chrome.tabs.query({ active: true }, tab => {
      chrome.tabs.executeScript(tab.id, { file: "clear_storage.js" });
    });
  }
});

chrome.runtime.onInstalled.addListener(function () {
  const item = {
      notepad: 'Put in here your resume',
      text: 'black',
      background: 'white'
  };
  chrome.storage.local.set(item, function () {
      console.log("Notepad initialized", item);
  });
});


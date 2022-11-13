chrome.runtime.onInstalled.addListener(function () {
  const item = {
      notepad: 'Put in here your requirements',
      text: 'black',
      background: 'white'
  };
  chrome.storage.local.set(item, function () {
      console.log("Notepad initialized", item);
  });
});


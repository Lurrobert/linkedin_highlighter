let notepad = document.getElementById('notepad');
notepad.focus();

notepad.addEventListener('keyup', function (event) {
    chrome.storage.local.set({notepad: event.target.innerHTML}, function () {
        console.log("Notepad updated", event.target.innerHTML);
    });
});

chrome.storage.local.get(['notepad', 'text', 'background'], function (data) {
    console.log('notepad data', data);
    notepad.innerHTML = data.notepad;
});

chrome.tabs.query({
  active: true,
  currentWindow: true
}, function (tab) {
  chrome.tabs.sendMessage(tab[0].id, {
      todo: "auto_extraction"
  });
  chrome.tabs.onUpdated.addListener(function () {
      chrome.tabs.sendMessage(tab[0].id, {
          todo: "auto_extraction"
      });
  });
});


document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('button').addEventListener('click', extractExperience);      
});

function extractExperience() {
    //defining anchors (roots from where scraping starts)
    var anchor1 = document.getElementById("experience");
    var anchor2 = document.querySelector('.pvs-list');
  
    var list = null;
    var exp = [];
    var roles = [];
    var company = "";
  
    if(anchor1) {
      anchor1 = anchor1.nextElementSibling.nextElementSibling;
      list = anchor1.querySelector('ul').children;
    } 
  
    if(anchor2 && location.href.includes('experience')) {
      list = anchor2.children;
    } 
    
    if(list) { //if the anchor exists
      for(i=0; i<list.length; i++) {
        company = "";
        roles = [];
        var elem = list[i].querySelector('div > div').nextElementSibling; //for anchor 1
        if(elem.querySelector('div > a:not([data-field="experience_media"])')) {
          // condition for multiple roles in same company
          company = elem.querySelector('div > a > div > span > span')?.textContent || "";
          company = getCleanText(company);
  
          elem = elem.firstElementChild.nextElementSibling;
          var elems = elem.querySelector('ul').children
  
          for(j=0; j < elems.length; j++) {
            // traversing roles list in a company
            var keke = elems[j].querySelector("div > div")?.nextElementSibling || null;
            description = keke.querySelector('div > .pvs-list__outer-container')?.textContent || "";
            keke = keke.querySelector('div > a');
  
            kchilds = keke.children;
            var rname=" ", startDate=" ", endDate=" ", loc=" ";
            for(k=0; k<kchilds.length; k++) {
  
              //each role's details taken
              if(k==0) //role name
                rname = kchilds[k]?.querySelector('span > span').textContent || "";
              if(k==1) //role duration
                {
                  var ta = kchilds[k].querySelector('span').textContent.split(/[-·]/);
                  startDate = ta[0];
                  endDate = ta[1];
                }
              if(k==2) //role location 
                loc= kchilds[k].querySelector('span')?.textContent || ""; 
                
             } //kloop
  
              roles.push({
                'id': j,
                'title': getCleanText(rname),
                'startDate': getCleanText(startDate),
                'endDate': getCleanText(endDate),
                'location': getCleanText(loc),
                'description': getCleanText(description) 
              });
  
          } // role traversal loop
  
  
          } else { //condition when single role in one company
            description = elem.querySelector('div > .pvs-list__outer-container')?.textContent || "";
            elem = elem.querySelector('div > div > div > div');
  
            echilds = elem.children;
            var rname=" ", startDate=" ", endDate=" ", loc=" ";
            for(k=0; k<echilds.length; k++) {
  
              //each role's details taken
              if(k==0) //role name
                rname = echilds[k]?.querySelector('span > span').textContent || "";
              if(k==2) //role duration
                {
                  var ta = echilds[k].querySelector('span').textContent.split(/[-·]/);
                  startDate = ta[0];
                  endDate = ta[1];
                }
              if(k==3) //role location 
                loc = echilds[k].querySelector('span')?.textContent || ""; 
              
              if(k==1) //role company title
                company = echilds[k].querySelector('span')?.textContent || "";
                if(company)
                  company = company.split(/[-·]/)[0];
             } //kloop
             
  
             roles.push({
              'id': 0,
              'title': getCleanText(rname),
              'startDate': getCleanText(startDate),
              'endDate': getCleanText(endDate),
              'location': getCleanText(loc),
              'description': getCleanText(description)
            });
  
         } //single role else condn ends
  
         a:
         exp.push({
          'id': i,
          'company': company,
          'roles': roles
         });
  
        }//for loop over 'i' for each item in anchor list
    } // if list anchor exists condition
    console.log(JSON.stringify(exp));
    return JSON.stringify(exp);
  //  document.getElementById('experiencetext').value = JSON.stringify(exp);
  }

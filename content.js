/////////////// * ---- GLOBAL VARIABLES ---- * /////////////////
var url = window.location.href.toString();
var DOM = document.body;
var highlights, note;
///////////// * GLOBAL VARIABLES ENDS HERES * /////////////////s
var resp = { //response object
  todo: "",
  data: undefined
}

async function getRelevancyScores(body) {
  // body = {"vitae": experience, "reqs": reqs}
  console.log(JSON.stringify(body));
  const response = await fetch("http://127.0.0.1:8000/relevant_score", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  });

  response.json().then(data => {
    console.log(data);
  });
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.todo == "auto_extraction") {
    item = {
      vitae: extractExperience()
    };
    console.log("Extracted data");
    chrome.storage.local.set(item, function () {
      console.log("Stored vitae in storage", item);
    });

    chrome.storage.local.get("notepad", results => {
      item['reqs'] = results['notepad']
      console.log("Stored data:", item);
      getRelevancyScores(item);
    });
  }
});

//module for extracting the details
function extract() {
  /// vars go below this
  var userProfile = {};

  // vars end here

  //////////////

  // retreiving profile Section data
  const profileSection = document.querySelector(".pv-top-card");

  const fullNameElement = profileSection?.querySelector('h1')
  const fullName = fullNameElement?.textContent || null

  const titleElement = profileSection?.querySelector('.text-body-medium')
  var title = titleElement?.textContent || null

  var tbs = profileSection?.querySelectorAll(".text-body-small")
  const locationElement = ((tbs) ? tbs[1] : null)
  var loc = locationElement?.textContent || null

  const photoElement = document.querySelector(".pv-top-card-profile-picture__image") || profileSection?.querySelector('.profile-photo-edit__preview')
  const photo = photoElement?.getAttribute('src') || null

  const descriptionElement = document.querySelector('div#about')?.parentElement.querySelector('.pv-shared-text-with-see-more > div > span.visually-hidden')// Is outside "profileSection"
  var description = descriptionElement?.textContent || null


  const url = window.location.url;
  var rawProfileData = {
    fullName,
    title,
    loc,
    photo,
    description,
    url
  }

  var profileData = {
    fullName: getCleanText(rawProfileData.fullName),
    title: getCleanText(rawProfileData.title),
    location: getCleanText(rawProfileData.loc),
    description: getCleanText(rawProfileData.description),
    photo: rawProfileData.photo,
    url: rawProfileData.url
  }
  ///extraction of profile data ends here///
  // extracting education section
  var nodes = $("#education-section ul > .ember-view");
  let education = [];

  for (const node of nodes) {

    const schoolNameElement = node.querySelector('h3.pv-entity__school-name');
    var schoolName = schoolNameElement?.textContent || null;
    schoolName = getCleanText(schoolName);

    const degreeNameElement = node.querySelector('.pv-entity__degree-name .pv-entity__comma-item');
    var degreeName = degreeNameElement?.textContent || null;
    degreeName = getCleanText(degreeName);

    const fieldOfStudyElement = node.querySelector('.pv-entity__fos .pv-entity__comma-item');
    var fieldOfStudy = fieldOfStudyElement?.textContent || null;
    fieldOfStudy = getCleanText(fieldOfStudy);

    // const gradeElement = node.querySelector('.pv-entity__grade .pv-entity__comma-item');
    // const grade = (gradeElement && gradeElement.textContent) ? window.getCleanText(fieldOfStudyElement.textContent) : null;

    const dateRangeElement = node.querySelectorAll('.pv-entity__dates time');

    const startDatePart = dateRangeElement && dateRangeElement[0]?.textContent || null;
    const startDate = startDatePart || null

    const endDatePart = dateRangeElement && dateRangeElement[1]?.textContent || null;
    const endDate = endDatePart || null

    education.push({
      schoolName,
      degreeName,
      fieldOfStudy,
      startDate,
      endDate
    })
  }
  //extraction of education ends here


  ///extraction of accomplishments (courses, test scores, projects,
  ///                               Languages, honor-awards)

  //first, extract out the array of nodes containing different sections
  var coursesection = document.querySelector(".courses");
  var projectsection = document.querySelector(".projects");
  var languagesection = document.querySelector(".languages");
  //var tests = acc_nodes[3]?.querySelectorAll("div > ul > li") || null;
  // var awards = acc_nodes[4]?.querySelectorAll("div > ul > li") || null;

  ///extracting different sections starting with course section

  /////COURSES/////
  var courses = []
  if (coursesection) { //if coursesection exists
    var course_nodes = coursesection.querySelectorAll("div > ul > li") || null;
    for (var nodo of course_nodes) {
      var courseName = nodo.textContent;
      courses.push(
        getCleanText(courseName)
      );
    }
  }
  /////COURSES EXTRACTION ENDS HERE/////

  /////PROJECTS////
  var projects = []
  if (projectsection) {
    var project_nodes = projectsection.querySelectorAll("div > ul > li") || null;
    for (var nodo of project_nodes) {
      var projectName = nodo.textContent;
      projects.push(
        getCleanText(projectName)
      );
    }
  }
  /////PROJECTS EXTRACTION ENDS HERE////


  ////LANGUAGES EXTRACTION////
  var languages = []
  if (languagesection) {
    var lang_nodes = languagesection.querySelectorAll("div > ul > li") || null;
    for (var nodo of lang_nodes) {
      var language = nodo.textContent;
      languages.push(
        getCleanText(language)
      );
    }
  }
  ////LANGUAGE EXTRACTION ENDS HERE////


  var accomplishments = {
    "courses": courses || [],
    "projects": projects || [],
    "languages": languages || []
  }

  ////Accomplishments extraction ends here


  ///VOLUNTEER EXPERIENCE EXTRACTION///
  let volunteer_experience = [];
  var volnodes = document.querySelectorAll('section.volunteering-section li');
  if (volnodes) {

    for (var nodo of volnodes) {
      var vol_title = nodo.querySelector('h3')?.textContent || null;
      var vol_company = nodo.querySelector('h4')?.textContent.replace("Company Name", "") || null;
      var vol_location = nodo.querySelector('.pv-entity__location span:nth-child(2)')?.textContent || null;
      var vol_description = nodo.querySelector('.pv-entity__extra-details')?.textContent || null;
      var date1 = nodo.querySelector('.pv-entity__date-range span:nth-child(2)')?.textContent || null;
      var date2 = nodo.querySelector('.pv-entity__bullet-item')?.textContent || null;

      volunteer_experience.push(
        {
          title: getCleanText(vol_title),
          company: getCleanText(vol_company),
          location: getCleanText(vol_location),
          description: getCleanText(vol_description),
          date1: getCleanText(date1),
          date2: getCleanText(date2)
        }
      );
    }//for-loop over volnodes
  }//if-condn to check if vonodes exists

  //add in the extracted object values here
  userProfile = {
    "profileData": profileData,
    "education": education,
    "volunteer_experience": volunteer_experience,
    "accomplishments": accomplishments
  }


  return userProfile;
}//Extract() functions ends here

// Extract Skills 
function extractSkills() {

  //defining anchors (roots from where scraping starts)
  var anchor1 = document.getElementById("skills");
  var anchor2 = document.querySelector('.pvs-list');

  var list = null;
  var skills = [];

  if (anchor1 && !document.getElementById('deepscan').checked) {
    anchor1 = anchor1.nextElementSibling.nextElementSibling
    list = anchor1.querySelector('ul').children;
  }

  if (anchor2 && document.getElementById('deepscan').checked && location.href.includes('skills')) {
    list = anchor2.children;
  }

  if (list) { //if the anchor exists
    for (i = 0; i < list.length; i++) {
      var elem = null;
      //var firstdiv = null;

      if (anchor1 && !document.getElementById('deepscan').checked) {
        //alert("anchor1");
        elem = list[i].firstElementChild.firstElementChild.nextElementSibling
          .querySelectorAll('div');

        var index = 0;
        elem = getCleanText(elem[index]?.querySelector('div > span > span').textContent || "");


      }// anchor1 ends here
      else if ((anchor1 == null) && anchor2 && document.getElementById('deepscan').checked &&
        location.href.includes('skills')) {
        elem = list[i].querySelector('div > div').nextElementSibling;
        elem = elem.firstElementChild.firstElementChild.children;

        elem = getCleanText(elem[0]?.querySelector('div > span > span').textContent || "");

      } //anchor2 ends here
      else { //exit
        break;
      }

      skills.push(
        {
          'id': i,
          'title': elem
        }
      );
    } //for loop


  } //if `the list from anchor exists` condn ends here


  var objtemp = {
    'name': 'skills',
    'data': skills
  };

  document.getElementById('skillstext').value = JSON.stringify(objtemp);
} //Extraction of skills ends here


// Extract Experience /////

function extractExperience() {
  //defining anchors (roots from where scraping starts)
  var anchor1 = document.getElementById("experience");
  var anchor2 = document.querySelector('.pvs-list');

  var list = null;
  var exp = [];
  var roles = [];
  var company = "";

  if (anchor1) {
    anchor1 = anchor1.nextElementSibling.nextElementSibling;
    list = anchor1.querySelector('ul').children;
  }

  if (anchor2 && location.href.includes('experience')) {
    list = anchor2.children;
  }

  if (list) { //if the anchor exists
    for (i = 0; i < list.length; i++) {
      company = "";
      roles = [];
      var elem = list[i].querySelector('div > div').nextElementSibling; //for anchor 1
      if (elem.querySelector('div > a:not([data-field="experience_media"])')) {
        // condition for multiple roles in same company
        company = elem.querySelector('div > a > div > span > span')?.textContent || "";
        company = getCleanText(company);

        elem = elem.firstElementChild.nextElementSibling;
        var elems = elem.querySelector('ul').children

        for (j = 0; j < elems.length; j++) {
          // traversing roles list in a company
          var keke = elems[j].querySelector("div > div")?.nextElementSibling || null;
          description = keke.querySelector('div > .pvs-list__outer-container')?.textContent || "";
          keke = keke.querySelector('div > a');

          kchilds = keke.children;
          var rname = " ", startDate = " ", endDate = " ", loc = " ";
          for (k = 0; k < kchilds.length; k++) {

            //each role's details taken
            if (k == 0) //role name
              rname = kchilds[k]?.querySelector('span > span').textContent || "";
            if (k == 1) //role duration
            {
              var ta = kchilds[k].querySelector('span').textContent.split(/[-·]/);
              startDate = ta[0];
              endDate = ta[1];
            }
            if (k == 2) //role location 
              loc = kchilds[k].querySelector('span')?.textContent || "";

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
        var rname = " ", startDate = " ", endDate = " ", loc = " ";
        for (k = 0; k < echilds.length; k++) {

          //each role's details taken
          if (k == 0) //role name
            rname = echilds[k]?.querySelector('span > span').textContent || "";
          if (k == 2) //role duration
          {
            var ta = echilds[k].querySelector('span').textContent.split(/[-·]/);
            startDate = ta[0];
            endDate = ta[1];
          }
          if (k == 3) //role location 
            loc = echilds[k].querySelector('span')?.textContent || "";

          if (k == 1) //role company title
            company = echilds[k].querySelector('span')?.textContent || "";
          if (company)
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
  // console.log(JSON.stringify(exp));
  return JSON.stringify(exp);
  //  document.getElementById('experiencetext').value = JSON.stringify(exp);
} //extract experience ends here


//////////// *---- UTILS -----* //////////////
// Utility functions

function getCleanText(text) {
  const regexRemoveMultipleSpaces = / +/g
  const regexRemoveLineBreaks = /(\r\n\t|\n|\r\t)/gm

  if (!text) return null

  const cleanText = text.toString()
    .replace(regexRemoveLineBreaks, '')
    .replace(regexRemoveMultipleSpaces, ' ')
    .replace('...', '')
    .replace('See more', '')
    .replace('See less', '')
    .trim()

  return cleanText
}


//////// * ----- UTILS ENDS -------* /////////



function searchForHighlights() {
  chrome.storage.local.get("highlights", results => {
    if (objDoesNotExist(results)) {
      createHighlightObj();
    } else {
      if (doHighlightsForThisURLExist(results)) {
        return;
      } else {
        applyHighlights(results.highlights[url]);
        addPromptToTargets();
      }
    }
  });
}

function objDoesNotExist(results) {
  if (
    results === "undefined" ||
    (Object.entries(results).length === 0 && results.constructor === Object)
  ) {
    return true;
  }
}

function createHighlightObj() {
  highlights = {};
  // active = {
  //   active: true
  // };
  chrome.storage.local.set({ highlights }, () => { });
  // chrome.storage.local.get("active", results => {});
  return;
}

function doHighlightsForThisURLExist(results) {
  if (!results.highlights[url]) {
    return true;
  }
}

function applyHighlights(pageHighlights) {
  console.log("Highlights Found For This URL");
  for (key in pageHighlights) {
    if (!(pageHighlights[key].toString().charAt(0) === "#")) {
      var nodeList = document.body.querySelectorAll(pageHighlights[key][0]); // NodeList(4) [queryselector, ...]
      for (let i = 0; i < nodeList.length; i++) {
        if (
          pageHighlights[key][1] === nodeList[i].innerText.indexOf(key) ||
          pageHighlights[key][2] === nodeList[i].innerText.indexOf(key)
        ) {
          grabNoteIfExists(pageHighlights);
          nodeList[i].innerHTML = nodeList[i].innerHTML.replace(
            key,
            `<span style="background-color: ${pageHighlights["color"] ||
            "#CFFFDF"};" class="el" title="${note}">` +
            key +
            "</span>"
          );
        }
      }
    }
  }
}

function grabNoteIfExists(phls) {
  if (phls[key][3] != undefined) {
    note = phls[key][3].toString();
  } else {
    note = "";
  }
}

// searchForHighlights();

function addPromptToTargets() {
  var nodes = document.getElementsByClassName("el");
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].ondblclick = () => {
      note = prompt("Add a comment for this highlight: ", nodes[i].title);
      if (note != null) {
        chrome.storage.local.get("highlights", results => {
          highlights = results.highlights;
          highlight = highlights[url][nodes[i].innerHTML];
          highlight[3] = note;
          nodes[i].title = note;
          chrome.storage.local.set({ highlights }, () => { });
        });
      }
    };
  }
}

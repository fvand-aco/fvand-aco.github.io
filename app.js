var weatherModal = document.getElementById("weather-modal");
var rssModal = document.getElementById("rss-modal");
var settingsModal = document.getElementById("settings-modal");
var weatherBtn = document.getElementById("createWeatherBtn");
var rssBtn = document.getElementById("createRSSBtn");
var settingsBtn = document.getElementById("settingsBtn");
var resetPositionBtn = document.getElementById("resetPositionBtn");
var saveSettings = document.getElementById("save-settings");
var close = document.getElementsByClassName("close");
var weatherSearchText = document.getElementById("weather-search-text");
var weatherSearchSubmit = document.getElementById("weather-search-submit");
var addRssBtn = document.getElementById("add-rss-widget");
var rssInput = document.getElementById("rss-input");
const geolocationLink = "https://api.openweathermap.org/geo/1.0/direct?limit=5&appid=1d957e1fec787ba103363bc5e34d7f19&q=";
var weatherLink = "https://api.openweathermap.org/data/2.5/weather?appid=1d957e1fec787ba103363bc5e34d7f19&";
var citydata;
var form = document.getElementById("citylist-form");
var createWeatherBtn = document.querySelector("#add-weather-widget");
var timer;
var widgets = [];

var settingsDefault = {
  unitChoice: "metric",
  maxRssAmount: 10,
  refreshInterval: 30
};
var settings = {};

const units = {
  metric: {
    temp: "°C",
    speed: "km/h"
  },
  imperial: {
    temp: "°F", 
    speed: "mph"
  }
}





/*
 * Initial actions when the page loads
 */

window.onload = function () {

  // for testing purposes
  let d = new Date();
  let datetime = d.toLocaleString();
  console.log("[started at]: " + datetime);

  // Gets any saved setting variables, if not, sets a default
  if (localStorage.getItem("glanceSettings") == null) {
    localStorage.setItem("glanceSettings", JSON.stringify(settingsDefault));
    settings = settingsDefault;
  } else if (localStorage.getItem("glanceSettings") != null) {
    settings = JSON.parse(localStorage.getItem("glanceSettings"));
  }

  // gets any stored widgets from localStorage
  getLocalStorageWidgets();

  // loops through the returned array
  for(let i = 0; i < widgets.length; i++) {

    if(widgets[i].type == `weather`){
      // loads the widget container for any stored weather widgets
      renderWeatherWidget(widgets[i]);
      // updates those weather wdigets
      updateWeatherWidget(widgets[i]);
    } else if (widgets[i].type == `rss`){
      // loads the widget container for any stored rss widgets
      renderRssWidget(widgets[i]);
      // updates those rss wdigets
      updateRssWidget(widgets[i]);
    } else {
      // catching and console.log-ing if any types are not recognized
      console.log(`Widget type: "` + widgets[i].type + `" unrecognized. Widget ID: ` + widgets[i].id);
    }

  }

  // the refresh command
  let u = JSON.parse(localStorage.getItem("glanceSettings"));
  timer = setInterval(updateAllWidgets, 1000 * 60 * u.refreshInterval);

}


// function saves the "widgets" array to localStorage as "widgets"
function saveWidgets() {
  localStorage.setItem("widgets", JSON.stringify(widgets));
}


// function gets any widgets from localStorage
function getLocalStorageWidgets() {
  widgets = JSON.parse(localStorage.getItem("widgets") || "[]");
}


// function just updates all the widgets, used for refreshing widget data
function updateAllWidgets() {

  let d = new Date();
  let datetime = d.toLocaleString(); 
  console.log("[refreshed at]: " + datetime);

  // loops through the widgets array, it should already exist from the window.onload above
  for (let i = 0; i < widgets.length; i++) {

    if (widgets[i].type == `weather`) {
      // updates the weather wdigets
      updateWeatherWidget(widgets[i]);
    } else if (widgets[i].type == `rss`) {
      // updates the rss wdigets
      updateRssWidget(widgets[i]);
    } else {
      // catching and console.log-ing if any types are not recognized
      console.log(`Widget type: "` + (widgets[i].type || `[unknown widget type]`) + `" unrecognized. Widget ID: ` + (widgets[i].id || `[unknown widget id]`));
    }

  }
}





/*
 *   Modal Functions
 */

// Display Create Weather Modal
weatherBtn.onclick = function () {
  // delete existing list contents
  while (form.firstChild) {
    form.removeChild(form.lastChild);
  }
  // remove any text in the search bar
  weatherSearchText.value = '';
  // reveal modal
  weatherModal.style.display = "block";
}


// Display Create RSS Modal
rssBtn.onclick = function () {
  // remove any existing text in the rss input
  rssInput.value = '';
  // reveal the rss modal
  rssModal.style.display = "block";
}


// Display Settings Modal
settingsBtn.onclick = function () {
  // load the existing settings into the placeholder attributes or check the selected unit choice
  loadExistingSettings();
  // reveal the settings modal
  settingsModal.style.display = "block";
}


// Resets the position of all the widgets to the default location
resetPositionBtn.onclick = function () {
  // grabs an array of all the widgets using the 'master' class
  let masters = document.getElementsByClassName("master");
  // loops through the 'masters' array and setting the top and left variables
  for (let i = 0; i < masters.length; i++) {
    masters[i].style.top = "50px";
    masters[i].style.left = "10px";
  }
  // saving the new locations to the widgets array and into localStorage
  for(let i = 0; i < widgets.length; i++) {
    widgets[i].top = 50;
    widgets[i].left = 10;
    saveWidgets();
  }
}




// Close Modals
function closeModals() {
  weatherModal.style.display = "none";
  rssModal.style.display = "none";
  settingsModal.style.display = "none";
}


// Functionality to close the modals via the X
close[0].onclick = function () {
  closeModals();
}
close[1].onclick = function () {
  closeModals();
}
close[2].onclick = function () {
  closeModals();
}


// Location Search executes
  // hitting enter
document.querySelector("#weather-search-text").addEventListener("keyup", function (event) {
  if (event.key == "Enter") {
    locationSearch();
  }
});


  // clicking select button
weatherSearchSubmit.onclick = function() {
  locationSearch();
}


function locationSearch() {
  // grabbing the searchbar value
  let loc = weatherSearchText.value;
  // creating the API link
  let templink = geolocationLink + loc;

  // delete existing contents of form
  while (form.firstChild) {
    form.removeChild(form.lastChild);
  }

  // get JSON object with location information
  fetch(templink)
    .then((response) => response.json())
    .then((data) => citydata = data)
    .then(() => addFormItems(citydata));

  // add options to a form (does this in the fetch)
  function addFormItems(citydata) {

    for (let i in citydata) {
      // grabbing the variables needed from the JSON
      let { name, state, country, lat, lon } = citydata[i];
      // creating the city name from the returned city, state, & country info
      let cityname = name + ", " + state + ", " + country;

      // radio button for the option
      let radiobox = document.createElement("input");
      radiobox.type = "radio";
      radiobox.id = cityname;
      radiobox.name = "citydata"
      radiobox.value = "lat=" + lat + "&lon=" + lon;

      // label for the radio button
      let label = document.createElement("label");
      label.htmlFor = cityname;
      label.innerHTML = cityname;

      // newline so it's visually a list
      let newline = document.createElement("br");

      // adding it to the form
      form.appendChild(radiobox);
      form.appendChild(label);
      form.appendChild(newline);
    }
  }
}


// let weatherInfo;
createWeatherBtn.onclick = function () {
  // grab the selected city from the city selection form
  let cityCoords = document.querySelector(`input[name="citydata"]:checked`).value;
  // creating a link for the weather api
  let newWeatherLink = weatherLink + cityCoords;
  // creating a unique ID for this widget
  let id = Date.now().toString();
    
  //create a weather object to save it
  let obj = {
    id: id,
    link: newWeatherLink,
    type: "weather", 
    cityname: document.querySelector(`input[name="citydata"]:checked`).id,
    top: 50,
    left: 10
  }

  // store the object into the widgets array & save it
  widgets.push(obj);
  saveWidgets();

  // display this weather widget in the html
  renderWeatherWidget(obj);
  updateWeatherWidget(obj);

  // closing the modal
  closeModals();
}


// RSS Creation executes
  // hitting enter
document.querySelector("#rss-input").addEventListener("keyup", function (event) {
  if (event.key == "Enter") {
    createRssWidget();
  }
});


  // clicking select button
addRssBtn.onclick = function () {
  createRssWidget();
}


// Save Settings onclick
saveSettings.onclick = function () {
  saveNewSettings();
}


// Save selected/set settings in Settings Modal
function saveNewSettings() {
  let u = JSON.parse(localStorage.getItem("glanceSettings"));
  let units = document.querySelector(`input[name="unit"]:checked`).value;
  let maximumRss = document.querySelector("#maxRss").value;
  let refreshInt = document.querySelector("#refreshInterval").value;

  // checking to make sure the  inputs are numbers
  // checks for null values and such
  if (units == `` || units == null || units == undefined) {
    units = u.unitChoice;
  } 
  if (maximumRss == `` || maximumRss == null || maximumRss == undefined || maximumRss.match(/^[0-9]+$/) == null) {
    maximumRss = u.maxRssAmount;
  }
  if (refreshInt == `` || refreshInt == null || refreshInt == undefined || refreshInt.match(/^[0-9]+$/) == null) {
    refreshInt = u.refreshInterval;
  }

  // limit checks
  if (Number(maximumRss) > 20) {
    maximumRss = `20`;
  } else if (Number(maximumRss) < 1) {
    maximumRss = `1`;
  }
  if (Number(refreshInt) < 15) {
    refreshInt = `15`;
  } else if (Number(refreshInt) > 60) {
    refreshInt = `60`;
  }

  // setting the new settings into the settings object
  settings[`unitChoice`] = units;
  settings[`maxRssAmount`] = maximumRss;
  settings[`refreshInterval`] = refreshInt;
  // saves the settings to localStorage
  localStorage.setItem("glanceSettings", JSON.stringify(settings));

  // closes the Modals
  closeModals();
  // updates the widgets
  updateAllWidgets();
  // clears and resets the refresh interval with the new time
  clearInterval(timer);
  timer = setInterval(updateAllWidgets, 1000 * 60 * refreshInt);
}


// Load Existing Settings from localStorage
function loadExistingSettings() {
  // gather elements and saved variables
  let u = JSON.parse(localStorage.getItem("glanceSettings"));
  let units = document.querySelector("#" + u.unitChoice);
  let maximumRss = document.querySelector("#maxRss");
  let refreshInt = document.querySelector("#refreshInterval");

  // removing any existing values in the inputs
  maximumRss.value = '';
  refreshInt.value = '';
  // pre-checking the radiobox option that is already selected
  units.checked = true;
  // setting a placeholder to show the existing setting
  maximumRss.placeholder = u.maxRssAmount;
  refreshInt.placeholder = u.refreshInterval;
}





/*
 * Weather Widget Functions 
 */

// creates the divs and other HTML tags needed for a weather widget
function renderWeatherWidget(obj) {
  // getting the destination div of the widget
  let tableau = document.querySelector("#widget-div");

  // creating the elements
  let master = document.createElement("div");
  let header = document.createElement("div");
  let closeBtn = document.createElement("span");
  let hcity = document.createElement("h3");
  let content = document.createElement("div");
  let ctemp = document.createElement("p");
  let cfeels_like = document.createElement("p");
  let ctemp_max = document.createElement("p");
  let ctemp_min = document.createElement("p");
  let cdesc = document.createElement("p");
  let cicon = document.createElement("img");

  // assigning classes to the elements
  master.classList.add("master", "weather", obj.id);
  header.classList.add("header", "weather", obj.id);
  closeBtn.classList.add("close-widget", "weather", obj.id);
  hcity.classList.add("cityname", "weather", obj.id);
  content.classList.add("content", "weather", obj.id);
  ctemp.classList.add("current-temp", "weather", obj.id);
  cfeels_like.classList.add("feels-temp", "weather", obj.id);
  ctemp_max.classList.add("max-temp", "weather", obj.id);
  ctemp_min.classList.add("min-temp", "weather", obj.id);
  cdesc.classList.add("description", "weather", obj.id);
  cicon.classList.add("icon", "weather", obj.id);

  // assigning an initial position
  master.style.top = obj.top + "px";
  master.style.left = obj.left + "px";

  // setting text content for the close button
  closeBtn.innerHTML = "&times;";

  // shoving everything into its proper parent
    // filling the header div
  header.appendChild(closeBtn);
  header.appendChild(hcity);
  
    // filling the content div
  content.appendChild(ctemp);
  content.appendChild(cfeels_like);
  content.appendChild(ctemp_max);
  content.appendChild(ctemp_min);
  content.appendChild(cdesc);
  content.appendChild(cicon);
    // placing the header & content divs into the master div
  master.appendChild(header);
  master.appendChild(content);
    // adding the master div into the widgets div already in index.html
  tableau.appendChild(master);

  // making the latest (this) master div a movable HTML element
  let mlist = document.querySelectorAll(".master");
  dragElement(mlist[mlist.length-1]);

  // giving the widget the ability to close
  scanClose();
}


// updates a weather widget using an object, usually from the widgets array
function updateWeatherWidget(obj) {
  // fetch current weather information
  let u = JSON.parse(localStorage.getItem("glanceSettings"));
  let url = obj.link + `&units=` + u.unitChoice;
  fetch(url)
    .then((response) => response.json())
    .then((data) => weatherInfo = data)
    .then(() => wUpdate(weatherInfo, obj))
    ;

  // updating the proper weather widget fields
  function wUpdate(weatherInfo, obj) {
    // getting the desired information from the JSON
    let { description, icon } = weatherInfo.weather[0];
    let { temp, feels_like, temp_max, temp_min } = weatherInfo.main;

    document.getElementsByClassName("header weather " + obj.id)[0].style.width = `auto`;

    // grabbing the appropriate HTML elements to set the text or img src, there should be only one element returned
    document.getElementsByClassName("cityname " + obj.id)[0].innerHTML = obj.cityname;
    document.getElementsByClassName("current-temp " + obj.id)[0].innerHTML = "Current: " + temp + units[u.unitChoice].temp;
    document.getElementsByClassName("feels-temp " + obj.id)[0].innerHTML = "Feels Like: " + feels_like + units[u.unitChoice].temp;
    document.getElementsByClassName("max-temp " + obj.id)[0].innerHTML = "Max: " + temp_max + units[u.unitChoice].temp;
    document.getElementsByClassName("min-temp " + obj.id)[0].innerHTML = "Min: " + temp_min + units[u.unitChoice].temp;
    document.getElementsByClassName("description " + obj.id)[0].innerHTML = "Conditions: "+description.charAt(0).toUpperCase() + description.slice(1);
    document.getElementsByClassName("icon " + obj.id)[0].src = "https://openweathermap.org/img/wn/"+icon+"@2x.png";

    let header = document.getElementsByClassName("header weather " + obj.id)[0];
    let width = header.clientWidth;
    header.style.width = width + 25 + "px";
  }
}





/*
 *  RSS Widget Functions
 */

// "Create" RSS Widget
function createRssWidget() {
  // check if the provided link is good
  if(!checkRssFeed(rssInput.value)){
    return
  };

  // Date string to use as the id
  let id = Date.now().toString();
  //create a rss object to save it
  let obj = {
    id: id,
    link: rssInput.value,
    type: "rss",
    top: 50,
    left: 10
  }

  // store the object into the widgets array & save it
  widgets.push(obj);
  saveWidgets();

  // render
  renderRssWidget(obj);
  // update
  updateRssWidget(obj);

  closeModals();
}

function checkRssFeed(rss) {
  let url;
  // uses the URL constructor to check if the rss input is something similar to valid
  try {
    url = new URL(rss);
  } catch (_) {
    return false;
  }
  return true;
}

// Render RSS Widget functions
function renderRssWidget(obj) {
  // getting the destination div of the widget
  let tableau = document.querySelector("#widget-div");

  // creating the elements
  let master = document.createElement("div");
  let header = document.createElement("div");
  let closeBtn = document.createElement("span");
  let content = document.createElement("div");
  let unorderedList = document.createElement("ul");
  let rssName = document.createElement("h3");
  

  // assigning classes to the elements
  master.classList.add("master", "rss", obj.id);
  header.classList.add("header", "rss", obj.id);
  closeBtn.classList.add("close-widget", "rss", obj.id);
  content.classList.add("content", "rss", obj.id);
  rssName.classList.add("rss-name", "rss", obj.id);
  unorderedList.classList.add("ulist", "rss", obj.id);

  content.appendChild(unorderedList);
  master.appendChild(header);
  master.appendChild(content);
  header.appendChild(closeBtn);
  header.appendChild(rssName);
  
  // adding the master div into the widgets div already in index.html
  tableau.appendChild(master);

  master.style.top = obj.top + "px";
  master.style.left = obj.left + "px";

  // setting text content for the close button
  closeBtn.innerHTML = "&times;";

  // making the latest (this) master div a movable HTML element
  let mlist = document.querySelectorAll(".master");
  dragElement(mlist[mlist.length - 1]);

  // giving the widget the ability to close
  scanClose();
}


// Update RSS Widget function
function updateRssWidget(obj) {
  let u = JSON.parse(localStorage.getItem("glanceSettings"));
  let link = obj.link;
  let theList = document.getElementsByClassName("ulist rss " + obj.id)[0];

  // clearing the existing UL items
  theList.innerHTML = '';

  // grabbing the RSS data
  feednami.load(link)
    .then(data => {
        rUpdate(data, obj);
  });

  function rUpdate(data, obj) {

    let newsItems = data.entries;
    let rssDisplay = 0;

    // grabbing containers to set their width to auto, to prepare for setting width
    let master = document.getElementsByClassName("master rss " + obj.id)[0];
    master.style.width = `auto`;
    let header = document.getElementsByClassName("header rss " + obj.id)[0];
    header.style.width = `auto`;
    let title = document.getElementsByClassName("rss-name rss " + obj.id)[0];
    title.style.width = `auto`;

    // setting the title
    title.innerHTML = data.meta.title;
    // grabbing the title width
    let width = title.clientWidth;
    // expanding title width slightly, for beautification
    title.style.width = width + 25 + "px";
    
    // setting 'width' with new value
    width = title.clientWidth;
    
    // setting widths in relation to the new title width
    master.style.width = width + 100 + "px";
    header.style.width = width + 82 + "px";

    // checking for maximum RSS list size, limits rendering extra li's and having too big an RSS feed
    if(newsItems.length < u.maxRssAmount){
      rssDisplay = newsItems.length;
    } else {
      rssDisplay = u.maxRssAmount;
    }

    // Loop to fill the RSS list content
    for (let i = 0; i < rssDisplay; i++){

      // grabs the container it will go into
      let uList = document.getElementsByClassName("ulist rss " + obj.id)[0];
      // create the li
      let listItem = document.createElement("li");
      // creating an anchor for the link to the article
      let anchor = document.createElement("a");

      // adding classes
      listItem.classList.add("listItem", "rss", obj.id);
      anchor.classList.add("listItem", "rss", obj.id);

      // shove everything where it's meant to go
      uList.appendChild(listItem);
      listItem.appendChild(anchor);

      // add content
      anchor.innerText = newsItems[i].title;
      anchor.href = newsItems[i].link;
      anchor.target = "_blank";
    }
    
  }

}





/*
 *  Function for all Widgets
 */

// Function to allow Widgets to be closed and deleted
function scanClose() {
  document.querySelectorAll(".close-widget").forEach(item => {
    item.addEventListener('click', event => {
      // grabs the window.event so we can get the classList of element we clicked on
      let e = window.event;
      // the 3rd class is the unique ID of the widget
      let objNum = e.srcElement.classList[2];
      // gets the master div of the widget we are deleting
      let node = document.getElementsByClassName("master " + objNum);
      // removes the master div from the HTML
      node[0].parentNode.removeChild(node[0]);
      // get the "widget" array index of the widget we are deleting
      let delWidgetIndex = widgets.findIndex(o => o.id == objNum);
      // deletes the widget from the array
      widgets.splice(delWidgetIndex, 1);
      // saves the array to localStorage
      saveWidgets();
    })
  })
}





/*
 *  Moveable Widgets functions
 */

// main function, you shove the HTML element meant to be moveable
function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call elementDrag() whenever the cursor moves
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

    // storing the widget location in the 'widget' array
      // grabs the 3rd class, which should be the widget's ID
    let objNum = e.srcElement.classList[2];
      // gets the index of the object in the widgets array
    let updateWidgetPosition = widgets.find(o => o.id == objNum);
      // updates the position values (top & left) into the widgets array
    updateWidgetPosition.top = elmnt.offsetTop - pos2;
    updateWidgetPosition.left = elmnt.offsetLeft - pos1;
      // saves the widgets array to localStorage
    saveWidgets();
  }

  function closeDragElement() {
    // stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
let map;
let currData;
let currentIdex = -1
const searchBar = document.getElementById("search");
const suggestionsBox = document.getElementById("suggestions");
let useCurrentLocation = document.querySelector(".current-location");
const getBot = JSON.parse(localStorage.getItem("currentLoc"));
let forms = document.getElementById("submitSearch");
let precentDate = document.querySelector(".current-day-and-time");
let forecastWeatherCard = document.querySelectorAll(".forecast-card")
let wetheriaChilderns = suggestionsBox.children;

const weatherObject = JSON.parse(localStorage.getItem("object"));
const historyTableContent = document.getElementById("tableContent");



window.addEventListener("load", () => {
    document.getElementById("dimOverlay").classList.add("hide");
});


let controller = new AbortController()
function goHome(){
    window.location = "/";
}

function scrollToDay(day){
     let getDay = document.getElementById(day);
     if(getDay){
        getDay.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'});
     }
}


function displayContinousTime(){
    const todayDate = new Date();
    let weakDay;
    let precentHours = todayDate.getHours();
    let apms = precentHours >= 12 ? "PM" :"AM";
    let indianHours = precentHours % 12 || 12 ;
    switch(todayDate.getDay()){
        case 0:
            weakDay = "Sunday"
            break;
        case 1:
            weakDay = "Monday"
            break;
        case 2 :
            weakDay = "Tuesday";
            break;
        case 3 :
            weakDay = "Wednesday";
            break;
        case 4 :
            weakDay = "Thursday";
            break;
        case 5 :
            weakDay = "Friday";
            break;
        case 6 :
            weakDay = "Saturday";
            break;
    }
    const formatOfDate = `${weakDay}, ${indianHours}:${todayDate.getMinutes().toString().padStart(2,'0')} ${apms}`;
    precentDate.textContent = formatOfDate;
    setTimeout(()=>{
        displayContinousTime()
    },100)
}
displayContinousTime();

function beautifullSearchSuggestion(event){
    const highlet = document.querySelectorAll(".search_suggestion .suggestion");
    
    highlet.forEach((item)=>item.classList.remove("suggesion"))
    highlet[0].classList.add("highlet")
    suggestionsBox.addEventListener("mouseenter", ()=>{
        highlet.forEach((item)=>item.classList.remove("highlet"))
    })
    return highlet[0]
}


const getPosition = async ()=>{
    try{
        const data = await getLocation();
        return data
    }catch (e){
        console.log(e);
    }
}

if(useCurrentLocation){
    useCurrentLocation.addEventListener("click", ()=>{
        getPosition()
        .then((response)=>{
            localStorage.setItem("currentLoc", JSON.stringify(response));
            setValue();
            getMaps();
        })
        .catch((e)=>{
            console.log(e);
        });
    });
}

function setValue(){
    const getFromLocal = JSON.parse(localStorage.getItem("currentLoc"));
    useCurrentLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i>&nbsp;${getFromLocal[0]},${getFromLocal[1]}`;
}



function getLocation(){
    return new Promise((resolve, reject)=>{
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(
                async (position) =>{
                   let lat = position.coords.latitude;
                   let lon = position.coords.longitude;
                   let url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
                   try{
                       const data = await axios.get(url);
                       const {address} = data.data;
                       const {state_district, state} = address;
                       resolve([state_district, state])
                    }catch(e){
                        reject("declined");
                    }            
   
               }
            )
       }
    })
}


let tempLength = 0; 
let previous = null;
function navigatorSuggestion(directions) {
    if (wetheriaChilderns.length === 0) return;
    if (previous) previous.classList.remove("highlet");
    
    
    if (directions === 1) {
        tempLength = tempLength === -1 ? 0 : tempLength + 1; 
        if (tempLength >= wetheriaChilderns.length) tempLength = 0; 
    } else if (directions === -1) {
        tempLength = tempLength === -1 ? wetheriaChilderns.length - 1 : tempLength - 1; 
        if (tempLength < 0) tempLength = wetheriaChilderns.length - 1; 
    }
    
    
    const child = wetheriaChilderns[tempLength];
    child.classList.add("highlet");
    previous = child; 
}

function ifPressed(event){
    if(event.key === "Enter"){
        let firstDiv;
        firstDiv = wetheriaChilderns[tempLength]
        searchBar.value = firstDiv.textContent.replaceAll(" ", "");
        tempLength = 0;
    }
    if(event.key === "ArrowUp"){
        navigatorSuggestion(-1); 
    }else if(event.key === "ArrowDown"){
        navigatorSuggestion(1);
    }
}
searchBar.addEventListener("input", async (e) =>{
    let query = e.target.value.toLowerCase().trim();
    suggestionsBox.innerHTML = "";
    
    controller.abort();
    controller = new AbortController();
    
    
    if (query.length > 1) {
        try{        
            const data = await axios.get(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}`, {
                    signal: controller.signal
                }
            );
            if(data.data.results===undefined){
                const div = document.createElement("div");
                div.textContent = "No results found";
                div.style.padding = "20px";
                suggestionsBox.classList.add("show");
                suggestionsBox.appendChild(div);
            }
            if(data.data.results){
                data.data.results.slice(0, 7).forEach((result) =>{
                    const dive = document.createElement("div");
                    dive.classList.add("suggestion")
                    dive.textContent = `${result.name}, ${result.country}`
                    suggestionsBox.classList.add("show")
                    dive.classList.add("div");
                    dive.onclick = async function(event){
                        searchBar.value = `${result.name},${result.country}`;
                        suggestionsBox.classList.remove("show");
                        
                        currData = [result.name, result.country]
                        forms.submit();
                        controller.abort();
                    }
                    suggestionsBox.appendChild(dive);
                    beautifullSearchSuggestion();
                })
                
            }       
        }catch(e){
            console.log(`error:${e}`);
        }
    } else {
        suggestionsBox.classList.remove("show");
    }
});



document.addEventListener("click", function(event) {
    if (!event.target.closest(".search-container")) {
        suggestionsBox.classList.remove("show");
    }
});


async function getMaps() {
    let location = document.querySelector(".current-location")
    let city = location.innerText.split(",")[0].trim()
    const coordinates = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
    const latitude = coordinates.data.results[0].latitude;
    const longitude = coordinates.data.results[0].longitude;
    
    const mapData = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
    
    try{
        //checking if map already exists after changing the location cuz leaflet doesnt allow for changes in map
        if(map){
            map.remove();
        }
        
        //initializing leaflet
        map = L.map('map').setView([latitude, longitude], 10);
        
        //adding tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        
        //adding marker
        const marker = L.marker([latitude, longitude]).addTo(map);
    }catch(err){console.log(err)}
}

getMaps();

searchBar.addEventListener("keydown", ifPressed)

//setting background image based on weather condition
function getWeatherClass(description) {
    let lowerDesc = description.toLowerCase();
    if (lowerDesc.includes("clear sky")) return "sunny";
    if (lowerDesc.includes("rain")) return "rainy";
    if (lowerDesc.includes("thunderstorm")) return "thunder";
    if (lowerDesc.includes("snow")) return "snow";
    if (["smoke","mist","haze","fog","dust","sand"].some(condition => lowerDesc.includes(condition))) return "haze";
    if (lowerDesc.includes("clouds")) return "cloudy";
    
    return "nightsky";
}
let backgroundImg = document.querySelector(".weather-dashboard");
let weatherCondition = document.getElementById("weatherCondition");
let description = weatherCondition.innerText;
let cls = getWeatherClass(description);
backgroundImg.classList.add(cls);


let theme = localStorage.getItem("themeState") || "dark";
const themeMode = document.getElementById("theme");
const navSearch = document.querySelector(".nav_search");
navSearch.classList.remove("light-theme");
document.body.classList.add(`${theme}-theme`);
localStorage.setItem("themeState", theme);
themeMode.addEventListener("click", () => {
    window.location.reload();
    theme = theme === "dark" ? "light" : "dark";
    document.body.classList.toggle("dark-theme");
    document.body.classList.toggle("light-theme");
    navSearch.classList.toggle("light-theme");
    localStorage.setItem("themeState", theme);
});

let lightCard = null;
forecastWeatherCard.forEach((item)=>{
    item.addEventListener("click", ()=>{
        if(item.dataset.disabled === "true")return;
        if(previousCard){
            previousCard.classList.remove("forecast-light-bg");
        }
        item.classList.add("forecast-light-bg");
        lightCard = item;
    });
});

function darkForecast(){
    let previousCard = null;
    forecastWeatherCard.forEach((item)=>{
        item.addEventListener("click", ()=>{
            if(previousCard){
                previousCard.classList.remove("forecast-card-bg");
            }
            item.classList.add("forecast-card-bg");
            previousCard = item;
        });
    });
}
function lightForecast(){
    let lightCard = null;
    forecastWeatherCard.forEach((item)=>{
    item.addEventListener("click", ()=>{
    if(lightCard){
        lightCard.classList.remove("forecast-light-bg");
    }
    item.classList.add("forecast-light-bg");
    lightCard = item;
    });
});
}

if(localStorage.getItem("themeState")==="dark"){
    darkForecast();

}else{
    lightForecast();
}
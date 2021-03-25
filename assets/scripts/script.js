// endpoints
const baseEndPoint = "http://api.coinlayer.com/api/";
const listEndPoint = baseEndPoint + "list";
const liveEndPoint = baseEndPoint + "live";
// const historicalURL = baseEndPoint + "" // historical uses an ISO data YYYY-MM-DD
const convertEndPoint = baseEndPoint + "convert";
const timeFrameEndPoint = baseEndPoint + "timeframe";
const changeEndPoint = baseEndPoint + "change";
// API Key
const apiKey = "1526378ab6452c2d88fc789afee8f650";
// search box and event listeners
const searchBox = document.getElementById("search");
const searchFrom = document.querySelector("form");
searchBox.addEventListener("keydown", enterKeyPressed);
searchFrom.addEventListener("keyup", keyPressed);
// place holders for coins
let coins = [];

// Constructors
function CryptoCoin(symbol, rate, imageURL) {
    this.symbol = symbol;
    this.rate = rate;
    this.imageURL = imageURL;
}

// Start of app
fetchCoinsData();
/* 
    Event Handlers
*/
function enterKeyPressed(evt) {
    if (evt.key === "Enter") {
        evt.preventDefault();
        searchDataEntered();
    }
}
function keyPressed(evt) {
    evt.preventDefault();
    searchDataEntered();
}
/* 
    Fetch Functions
*/
async function fetchCoinsData() {
    // fetch coins data
    let coinsResponse = await fetch(`${listEndPoint}?access_key=${apiKey}`);
    let coinsResults = await checkForOkResponse(coinsResponse);
    let coinsData = coinsResults.crypto;
    
    // fetch coins rates
    let ratesResponse = await fetch(`${liveEndPoint}?access_key=${apiKey}`);
    let ratesResults = await checkForOkResponse(ratesResponse);
    let ratesData = ratesResults.rates;

    // create a new CryptoCoin for each key found in coinsData
    for (key in coinsData) {
        coins.push(new CryptoCoin(key, ratesData[key], coinsData[key]["icon_url"]))
    }
    // display the data
    displayCoinsDataTable();
}

/*
    Helper and processing functions
*/
function displayCoinsDataTable() {
    let tableBody = document.querySelector("tbody");
    // create a row for each coin
    coins.forEach(coin => {
        let tr = document.createElement("tr");
        let {symbol, rate, imageURL} = coin;
        // add image to view
        let imgTD = document.createElement("td");
        let img = document.createElement("img")
        img.src = imageURL;
        img.width = 32;
        imgTD.appendChild(img);
        tr.appendChild(imgTD)
        // add symbol to view
        let symbolTD = document.createElement("td");
        symbolTD.innerText = symbol
        tr.appendChild(symbolTD);
        // add rate to view
        let rateTD = document.createElement("td");
        rateTD.innerText = rate;
        tr.appendChild(rateTD);
        // add tr to tbody
        tableBody.appendChild(tr);
    })
}

function checkForOkResponse(response) {
    if (!response.ok) { // if error is found
        return Promise.reject(response.status); // return a promise reject
    }
    return response.json(); // return our response as it passed the check
}

function searchDataEntered() {
    const table = document.querySelector("table");
    let tr = document.getElementsByTagName("tr");
    let searchTerm = searchBox.value.toUpperCase();
    let textValue;
    
    // for each table row, hide those who don't match
    for (let i = 0; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName("td")[1];
        if (td) {
            textValue = td.innerText;
            if (textValue.toUpperCase().indexOf(searchTerm) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}
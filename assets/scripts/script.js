// endpoints
const baseEndPoint = "https://api.coinlayer.com/";
const listEndPoint = baseEndPoint + "list";
const liveEndPoint = baseEndPoint + "live";
// const historicalURL = baseEndPoint + "" // historical uses an ISO data YYYY-MM-DD
const convertEndPoint = baseEndPoint + "convert";
const timeFrameEndPoint = baseEndPoint + "timeframe";
const changeEndPoint = baseEndPoint + "change";
// API Key
const apiKey = "1526378ab6452c2d88fc789afee8f650";
// Element References and event handler assignments
const searchBox = document.getElementById("search"); // search box itself
searchBox.addEventListener("keyup", filterSearchTable);

const searchFroms = document.querySelectorAll("form"); // all forms on the page
searchFroms.forEach(form => form.addEventListener("keydown", enterKeyPressed));

const convertCoinNavbarButton = document.getElementById("convert-coin");
convertCoinNavbarButton.addEventListener("click", convertNavbarButtonClicked);

const convertSubmitButton = document.getElementById("convert-submit");
convertSubmitButton.addEventListener("click", convertSubmitButtonClicked);
/*
    Start of web app
*/
fetchCoinsData().then(displayCoinsDataTable).catch(console.error);
/*
    Global Variables
*/
let coins = [];
/*
    Constructor Functions
*/
function CryptoCoin(symbol, name, rate, imageURL) {
    this.symbol = symbol;
    this.name = name;
    this.rate = rate;
    this.imageURL = imageURL;
}
/* 
    Event Handler Functions
*/
function filterSearchTable(evt) {
    evt.preventDefault();
    searchDataEntered();
}
function enterKeyPressed(evt) {
    if (evt.key === "Enter") {
        evt.preventDefault();
    }
}
function convertNavbarButtonClicked(evt) {
    evt.preventDefault();
    const fromCoinList = document.getElementById("from-coin");
    const toCoinList = document.getElementById("to-coin");
    let symbols = [];
    coins.forEach(coin => {
        symbols.push({
            symbol: coin.symbol,
            name: coin.name
        });
    })

    createOptionList(symbols, fromCoinList);
    createOptionList(symbols, toCoinList);
}
function convertSubmitButtonClicked(evt) {
    evt.preventDefault();
    const amountOfCoin = document.getElementById("coin-amount").value;
    const fromCoinSybmol = document.getElementById("from-coin").value;
    const toCoinSymbol = document.getElementById("to-coin").value;
    const convertResult = document.getElementById("covert-result");

    if (isNaN(amountOfCoin)) { // if amountOfCoin is not a number, alert the user
        alert(`${amountOfCoin} is not a number. Please try again.`);
        return;
    }

    if (amountOfCoin == 0) { // amount of coin can not be zero
        alert("Amount of coin to convert must be greater than 0. Please try again.")
        return;
    }
    
    convertCoins(amountOfCoin, fromCoinSybmol, toCoinSymbol)
        .then((result) => convertResult.innerText = `${result.result} ${toCoinSymbol}`)
        .catch(console.error)
}
/* 
    Fetch Functions
*/
async function fetchCoinsData() {
    // fetch coins data
    let coinsResponse = await fetch(`${listEndPoint}?access_key=${apiKey}`);
    let coinsResults = await coinsResponse.json();
    let coinsData = coinsResults.crypto;
    
    // fetch coins rates
    let ratesResponse = await fetch(`${liveEndPoint}?access_key=${apiKey}&expand=1`);
    let ratesResults = await ratesResponse.json();
    let ratesData = ratesResults.rates;
    // return our data
    return [coinsData, ratesData];
}
async function convertCoins(amount, from, to) {
    let convertURLString = `${convertEndPoint}?access_key=${apiKey}&amount=${amount}&from=${from}&to=${to}`;

    let convertResponse = await fetch(convertURLString);
    let convertResult = await convertResponse.json();
    return convertResult;
}
/*
    Helper and Processing Functions
*/
function displayCoinsDataTable(data) {
    let tableBody = document.querySelector("tbody");
    let coinsData = data[0];
    let ratesData = data[1];
    // create a new CryptoCoin for each key found in coinsData
    for (key in coinsData) {
        coins.push(new CryptoCoin(key, coinsData[key].name , ratesData[key], coinsData[key]["icon_url"]))
    }
    // create a row for each coin
    coins.forEach(coin => {
        // add coin logo to view
        let tr = document.createElement("tr");
        let {symbol, name, rate, imageURL} = coin;
        let imgTD = document.createElement("td"); // create td element
        let img = document.createElement("img") // create image element
        img.src = imageURL; // set img src
        img.width = 32; // set img size
        imgTD.appendChild(img); // add image to td element
        tr.appendChild(imgTD) // add row to img to table row

        // add symbol to view
        let symbolTD = document.createElement("td");
        symbolTD.innerText = symbol
        tr.appendChild(symbolTD);

        // add coin name
        let nameTD = document.createElement("td");
        nameTD.innerText = name
        tr.appendChild(nameTD)

        // add rate to view
        let rateTD = document.createElement("td");
        rateTD.innerText = `${rate.rate}`;
        tr.appendChild(rateTD);
        // add high / low numbers to view
        let highLowTD = document.createElement("td");
        // if not null, so the returned value
        if (rate.high) {
            highLowTD.innerText = `${rate.high}`;
        } else {
            // else set to 0
            highLowTD.innerText = "0";
        }

        if (rate.low) {
            highLowTD.innerText += ` / ${rate.low}`;
        } else {
            highLowTD.innerText += " / 0";
        }
        
        tr.appendChild(highLowTD);
        // add tr to tbody
        tableBody.appendChild(tr);
    })
}
function createOptionList(options, parentElement) {
    while(parentElement.firstChild) { // while a list item is present
        parentElement.removeChild(parentElement.firstChild); // remove it
    }
    options.forEach((option) => {
        let optionElement = document.createElement("option");
        optionElement.innerText = `${option.name} (${option.symbol})`;
        optionElement.value = option.symbol;
        parentElement.appendChild(optionElement);
    })
}
function searchDataEntered() {
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
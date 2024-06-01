let bodyEl = $(".container");
let searchBarEl = $("#searchBar");
let searchBttn = $(".search");
let searchQuery = $(".searchQuery");
let inputCityName = $("#inputCityName");
let searchText = inputCityName.val();
let weatherForecastDisplay = $(".weatherForecastDisplay");
let weatherOnDay = $(".weatherOnDay");
let openWeatherAPI = "acbf05eb3db32edd9ddb78763052132e";
let fiveDayWeather = $(".five-day-weather");
let storedList;

$(document).on("keypress", function (event) {
    if (event.which == 13) {
        runAPIs();
    }
});

searchBttn.click(function () {
    runAPIs();
});

function historyBttnClick(event) {
    event.preventDefault();
    searchText = event.target.id;
    getWeatherData();
}

function runAPIs() {
    if (inputCityName.val() == "") {
        showError();
        return;
    } else {
        searchText = inputCityName.val();
        getWeatherData();
        storeSearchHistory();
        getSearchHistory();
    }
}

function getWeatherData() {
    var url =
        "https://api.openweathermap.org/data/2.5/weather?q=" +
        searchText +
        "&appid=" +
        openWeatherAPI;
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.message === "city not found") {
                cityNotFound();
            } else {
                searchQuery.removeClass("col-sm-12 col-md-12 col-lg-12");
                searchQuery.addClass("col-sm-4 col-md-4 col-lg-4");
                weatherForecastDisplay.css("display", "block");
                weatherOnDay.empty();
                var locationLongitude = data.coord.lon;
                var locationLatitiude = data.coord.lat;
                var tempKelvin = data.main.temp;
                var tempFahrenheit =
                    parseFloat(((tempKelvin - 273.15) * 9) / 5 + 32).toFixed(
                        2
                    ) + "&#8457";
                var date = moment.unix(data.dt).format("(Do MMMM, YYYY)");
                var cityName = data.name;
                var speed =
                    parseFloat(2.236937 * data.wind.speed).toFixed(2) + "MPH";
                var humidity = data.main.humidity + "%";
                var icon = data.weather[0].icon;
                var iconDes = data.weather[0].description;
                var weatherImg =
                    "https://openweathermap.org/img/wn/" + icon + "@2x.png";
                weatherOnDay.append(
                    '<h5 class="bg-info">' +
                        cityName +
                        " " +
                        date +
                        '<img src="' +
                        weatherImg +
                        '"><sup>' +
                        iconDes +
                        "</sup></h5><p>Temp: " +
                        tempFahrenheit +
                        "</p><p>Wind: " +
                        speed +
                        "</p><p>Humidity: " +
                        humidity +
                        '</p><p id = "lat">' +
                        locationLatitiude +
                        '</p><p id = "long">' +
                        locationLongitude +
                        "</p>"
                );
                $("#lat").css("display", "none");
                $("#long").css("display", "none");
                fiveDayForecast();
            }
        });
}

var fiveDayForecast = function () {
    fiveDayWeather.empty();
    var lat = $("#lat").html();
    var long = $("#long").html();
    var url =
        "https://api.openweathermap.org/data/2.5/onecall?lat=" +
        lat +
        "&lon=" +
        long +
        "&appid=" +
        openWeatherAPI;
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var uvIndex = data.daily[0].uvi;
            var colorCode = "btn btn-success";
            var alt = "Low protection needed";
            if (uvIndex > 2 && uvIndex < 6) {
                colorCode = "btn-warning";
                alt = "Protection Needed";
            } else if (uvIndex > 5 && uvIndex < 8) {
                colorCode = "btn-danger";
                alt = "Protection Essential";
            } else if (uvIndex > 7 && uvIndex < 11) {
                colorCode = "btn-dark";
                alt = "Extra Protection Needed";
            } else if (uvIndex > 10) {
                colorCode = "btn-primary";
                alt = "Stay Inside";
            }
            weatherOnDay.append(
                '<p>UV Index: <button type="button" class="btn ' +
                    colorCode +
                    '">' +
                    uvIndex +
                    "</button><sup>" +
                    alt +
                    "</sup></p>"
            );
            for (i = 1; i < 6; i++) {
                var forecastDate = moment
                    .unix(data.daily[i].dt)
                    .format("DD MMM YYYY");
                var tempKelvin =
                    (data.daily[i].temp.max + data.daily[i].temp.min) / 2;
                var tempFahrenheit =
                    parseFloat(((tempKelvin - 273.15) * 9) / 5 + 32).toFixed(
                        2
                    ) + "&#8457";
                var wind =
                    parseFloat(2.236937 * data.daily[i].wind_speed).toFixed(2) +
                    " MPH";
                var humidity = data.daily[i].humidity + "%";
                var icon = data.daily[i].weather[0].icon;
                var weatherImg =
                    "https://openweathermap.org/img/wn/" + icon + "@2x.png";
                fiveDayWeather.append(
                    '<div class="custom-card text-white bg-dark p-1"><h5 class="card-title">' +
                        forecastDate +
                        '</h5><img src="' +
                        weatherImg +
                        '"><h6>Temp: ' +
                        tempFahrenheit +
                        "</h6><h6>Wind: " +
                        wind +
                        "</h6><h6>Humidity: " +
                        humidity +
                        '</h6></div><div class="p-1"></div>'
                );
            }
        });
};

function storeSearchHistory() {
    var history = searchText;
    if (!storedList) {
        storedList = [];
    }
    storedList.push(history);
    localStorage.setItem("history", JSON.stringify(storedList));
}

function getSearchHistory() {
    $(".history").empty();
    storedList = JSON.parse(localStorage.getItem("history"));
    if (storedList !== null) {
        for (i = 0; i < storedList.length; i++) {
            $(".history").append(
                '<button type="button" class="col-12 btn btn-secondary historyBttn" role="button" id ="' +
                    storedList[i] +
                    '"onclick="historyBttnClick(event)">' +
                    storedList[i] +
                    '</button><div class="p-1"></div>'
            );
        }
    }
}

function showError() {
    searchBttn.before('<p id="showError">City name cannot be blank</p>');
    var showResult = 1;
    var timeResultID = setInterval(function () {
        if (showResult > 0) {
            showResult--;
        } else if (showResult === 0) {
            clearInterval(timeResultID);
            $("#showError").remove();
        }
    }, 1000);
}

function cityNotFound() {
    searchBttn.before('<p id="showError">City not found, try again</p>');
    var showResult = 1;
    var timeResultID = setInterval(function () {
        if (showResult > 0) {
            showResult--;
        } else if (showResult === 0) {
            clearInterval(timeResultID);
            $("#showError").remove();
        }
    }, 1000);
}

getSearchHistory();

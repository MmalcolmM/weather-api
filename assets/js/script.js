// get city name 
// get the coordinates of the city 
// get forcast 

const storedWeatherData = localStorage.getItem('weatherData');

if (storedWeatherData) {
    const { city, todayForecast, weeklyForecast } = JSON.parse(storedWeatherData);
    getWeather(todayForecast, weeklyForecast)
}

// display city weather - results 
const searchFormEl = document.querySelector('#searchForm');
const searchInputEl = document.querySelector('#searchInput')
// const submitBtn = document.querySelector('#submit');


// function to handle form submission 
function handleSearchFormSubmit(event) {
    event.preventDefault();
    const searchInputVal = searchInputEl.value;
    // if (!searchInputVal) {
    //     alert("Maybe try typing in a city..");
    //     return;
    // }
    getCords(searchInputVal);
    updateSearchedCitiesList(searchInputVal); // Add this line to update the list of searched cities
}
// Add an event listener to the form for form submission
searchFormEl.addEventListener('submit', handleSearchFormSubmit);

const cityName = " ";
const apiKey = "74595acc188ac6a465579588a7ab3e7a";
const options = {
    method: "GET",
    redirect: "follow"
};

// Function to get coordinates for a given city
function getCords(city = cityName) {
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`, options)
        .then((response) => response.json())
        .then((result) => {
            // Extract latitude and longitude from the API response
            const lat = result[0].lat; // Accessing the latitude of the first result
            const lon = result[0].lon; // Accessing the longitude of the first result
            getForecast(lat, lon); // call getForecast with the obtained coordinates
        })
        .catch((error) => console.error(error));
}

// Function to get weather forecast for a given coordinates
function getForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`, options)
        .then((response) => response.json())
        .then((result) => {
            // Extract today's forecast data from the API response
            const todayForecast = {
                temperature: result.list[0].main.temp, // Accessing temperature of the first forecast in the list
                condition: result.list[0].weather[0].description, // Accessing weather condition of the first forecast
                humidity: result.list[0].main.humidity // Accessing humidity of the first forecast

            };

            // Extract the weekly forecast data from the API response
            const weeklyForecast = result.list.slice(1, 6).map(day => ({
                temperature: day.main.temp, // Accessing temperature of each day in the weekly forecast
                condition: day.weather[0].description, // Accessing weather condition of each day
                humidity: day.main.humidity // Accessing humidity of each day


            }));
            getWeather(todayForecast, weeklyForecast);

        })
        .catch((error) => console.error(error));
    console.log(lat, lon);
}

function getWeather(todayForecast, weeklyForecast) {
    const city = document.getElementById('searchInput').value;
    const weatherInfoDiv = document.getElementById('weatherInfo');

    // Display today's forecast in a big box
    weatherInfoDiv.innerHTML = `
        <div class="today-forecast">
            <h2>${city}'s Weather Today</h2>
            <p>Temperature: ${todayForecast.temperature}°F</p>
            <p>Condition: ${todayForecast.condition}</p>
            <p>Humidity: ${todayForecast.humidity}%</p>
        </div>
    `;

    // Display the forecasts for the next 5 days
    weatherInfoDiv.innerHTML += `
        <div class="weekly-forecast">
            <h2>${city}'s Weekly Forecast</h2>
            ${weeklyForecast.map((day, index) => `
                <div>
                    <p>Date: ${dayjs().add(index + 1, 'day').format('MMMM DD, YYYY')}</p>
                    <p>Temperature: ${day.temperature}°F</p>
                    <p>Condition: ${day.condition}</p>
                    <p>Humidity: ${day.humidity}%</p>
                </div>
            `).join('')}
        </div>
    `;

    // Store weather data in localStorage
    storeWeatherData(city, todayForecast, weeklyForecast);
}

// Update the function to store and retrieve weather data using the city name as the key
function storeWeatherData(city, todayForecast, weeklyForecast) {
    const weatherData = JSON.stringify({ city, todayForecast, weeklyForecast });
    localStorage.setItem('weatherData', weatherData); // Use 'weatherData' as the key
    // localStorage.setItem('city', city);
}
// function updateSearchedCitiesList(searchedCities) {
//     const citiesList = document.getElementById('citiesList');
//     citiesList.innerHTML = '';
function updateSearchedCitiesUI(searchedCities) {
    const citiesList = document.getElementById('citiesList');
    citiesList.innerHTML = '';

    searchedCities.forEach(city => {
        const cityItem = document.createElement('li');
        cityItem.textContent = city;
        cityItem.addEventListener('click', () => {
            const storedWeatherData = JSON.parse(localStorage.getItem('weatherData'));
            if (storedWeatherData && storedWeatherData.city === city) {
                getWeather(city, storedWeatherData.todayForecast, storedWeatherData.weeklyForecast);
            }
        });
        citiesList.appendChild(cityItem);
    });
}

function updateSearchedCitiesList(city) {
    let searchedCities = JSON.parse(localStorage.getItem('searchedCities')) || [];
    if (!searchedCities.includes(city)) {
        searchedCities.push(city);
        localStorage.setItem('searchedCities', JSON.stringify(searchedCities));
        updateSearchedCitiesUI(searchedCities);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const searchedCities = JSON.parse(localStorage.getItem('searchedCities')) || [];
    updateSearchedCitiesUI(searchedCities); // Update the searched cities list on page load

    const storedWeatherData = localStorage.getItem('weatherData');
    if (storedWeatherData) {
        const { city, todayForecast, weeklyForecast } = JSON.parse(storedWeatherData);
        getWeather(todayForecast, weeklyForecast);
    }
});;

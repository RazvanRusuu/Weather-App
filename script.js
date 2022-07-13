import { getDate, getCityWeather, getCurrentPosCoords } from "./utilities.js";

// prettier-ignore
const days = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', ];
const form = document.querySelector(".form");
const city = document.querySelector(".input-city");
const currentContainerEl = document.querySelector(".inner__container--content");
const todayContainerEl = document.querySelector(".today__container");
const dailyContainerEl = document.querySelector(".daily__container");

class WeatherApp {
  #date = new Date();
  #currentCoords;
  #map;

  constructor() {
    this.#getLocation();
    form.addEventListener("submit", this.#getCityInfo.bind(this));
  }

  #getLocation() {
    getCurrentPosCoords()
      .then((pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        this.#currentCoords = [lat, lng];
        this.#renderMap(this.#currentCoords);
      })
      .catch((err) => {
        console.log(err);
        this.#renderMap([46.77, 23.59]);
      });
  }

  async #renderMap(coords) {
    this.#map = L.map("map").setView(coords, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    // Event listner on mapClick
    this.#map.on("click", this.#clickOnMap.bind(this));

    this.#displayCurrentWeather(await getCityWeather(coords, "current"));

    this.#displayForecast(await getCityWeather(coords));
  }

  async #clickOnMap(mapE) {
    const { lat, lng } = mapE.latlng;
    const mapClickCoords = [lat, lng];
    // prettier-ignore
    this.#displayCurrentWeather(await getCityWeather(mapClickCoords, "current"));
    this.#displayForecast(await getCityWeather(mapClickCoords));
  }

  #displayCurrentWeather(city) {
    const {
      name,
      main: { temp },
      sys: { country },
      weather: [{ icon }],
      main: { feels_like },
      timezone,
      sys: { sunrise, sunset },
    } = city;
    currentContainerEl.innerHTML = "";
    const sunriseDate = getDate(sunrise, timezone);
    const sunsetDate = getDate(sunset, timezone);
    const html = `
          <div class="city__content">
            <h2 class="city__name">
              <img
                class="icon__details"
                src="https://cdn-icons-png.flaticon.com/512/854/854878.png"
              />${name}<span class="country">${country}</span>
            </h2>
            <img class="weather__img current" src="images/${icon}.png" /><span
              class="weather__temperature"
              ><img
                src="https://cdn-icons-png.flaticon.com/128/1684/1684375.png"
              />${(temp - 273.5).toFixed(1)}°C</span
            >
          </div>
          <div class="city__details">
            <div class="city__details--grid">
              <span>Feels like</span>
              <span>Sunrise</span>
              <span>Sunset</span>
              <span class="current__details"
                ><img
                  class="icon__details"
                  src="https://cdn-icons-png.flaticon.com/128/1684/1684375.png"
                />${(feels_like - 273.5).toFixed(1)}°C</span
              ><span class="current__details"
                ><img
                  class="icon__details"
                  src=https://cdn-icons-png.flaticon.com/128/7303/7303217.png
                />${sunriseDate[0]}:${(sunriseDate[1] + "").padStart(2, 0)} ${
      sunriseDate[0] > 12 ? "PM" : "AM"
    }</span
              ><span class="current__details"
                ><img
                  class="icon__details"
                  src="https://cdn-icons-png.flaticon.com/512/3233/3233728.png"
                />${sunsetDate[0]}:${(sunsetDate[1] + "").padStart(2, 0)} ${
      sunsetDate[0] > 12 ? "PM" : "AM"
    }</span
              >
            </div>`;

    currentContainerEl.insertAdjacentHTML("afterbegin", html);
  }

  // prettier-ignore
  #displayWeather(city, container) {
    const {weather: [{icon}], main:{temp}, dt_txt: timeStamp} = city;
    const cityHour = new Date(timeStamp).getHours();
    const cityDay = new Date(timeStamp).getDay();
    const html = ` 
    <div>
      <span class="weather__date">${days[cityDay]}</span>
      <span class="weather__date">${cityHour}:00</span>
      <img class="weather__img current" src="images/${icon}.png">
      <span class="weather__temperature"><img src="https://cdn-icons-png.flaticon.com/128/1684/1684375.png">${(temp - 273.15).toFixed(1)}°C</span>
  </div>
    `;
    container.insertAdjacentHTML("beforeend", html);
  }

  #displayForecast(cityForecast) {
    dailyContainerEl.innerHTML = "";
    todayContainerEl.innerHTML = "";
    const currentDay = this.#date.getDate();
    const arr = cityForecast.list;
    const todayArr = arr.filter((hour) => {
      const day = new Date(hour.dt_txt).getDate();
      return currentDay === day;
    });
    todayArr.forEach((hour) => {
      this.#displayWeather(hour, todayContainerEl);
    });

    const daysArray = arr.filter((hour) => {
      const day = new Date(hour.dt_txt).getDate();
      return currentDay !== day;
    });
    daysArray.forEach((hour) => {
      this.#displayWeather(hour, dailyContainerEl);
    });
  }

  async #getCityInfo(e) {
    e.preventDefault();

    const cityInput = city.value;
    if (!cityInput) return;

    const currentCityData = await getCityWeather(cityInput, "current");
    const { lat, lon: lng } = currentCityData.coord;

    this.#moveToCity([lat, lng]);
    this.#displayCurrentWeather(currentCityData);
    this.#displayForecast(await getCityWeather(cityInput));

    city.value = "";
  }

  #moveToCity(coords) {
    this.#map.setView(coords, 13);
  }
}
const weather = new WeatherApp();

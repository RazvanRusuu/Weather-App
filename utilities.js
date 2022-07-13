// use your own API key
import { API_KEY } from "./key.js";
const errorEl = document.querySelector(".error");

const displayError = (error) => {
  errorEl.innerText = error;

  setTimeout(() => {
    errorEl.innerText = "";
  }, 2000);
};

export const getCurrentPosCoords = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

export const getCityWeather = async (city, time) => {
  let response;
  try {
    // parameter is array(coordinates)
    if (typeof city === "object") {
      const [lat, lng] = city;
      response = await fetch(
        `https://api.openweathermap.org/data/2.5/${
          time ? "weather" : "forecast"
        }?lat=${lat}&lon=${lng}&appid=${API_KEY}`
      );

      if (!response.ok)
        throw new Error(`Something went wrong: ${response.status}`);
    }
    // parameter is string
    if (typeof city === "string") {
      response = await fetch(
        `https://api.openweathermap.org/data/2.5/${
          time ? "weather" : "forecast"
        }?q=${city}&appid=${API_KEY}`
      );

      if (!response.ok)
        throw new Error(`Something went wrong: ${response.status}! Try again!`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (err) {
    console.log(err);
    displayError(err);
  }
};

export const getDate = (timeStamp) => {
  const fullDate = new Date(timeStamp * 1000);
  const hour = fullDate.getHours();
  const minutes = fullDate.getMinutes();

  return [hour, minutes];
};

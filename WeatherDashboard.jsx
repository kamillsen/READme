import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

function WeatherDashboard() {
  // instead of requesting data from an API, use this mock data
  const mockWeatherData = {
    'New York': {
      temperature: '22°C',
      humidity: '56%',
      windSpeed: '15 km/h'
    },
    'Los Angeles': {
      temperature: '27°C',
      humidity: '45%',
      windSpeed: '10 km/h',
    },
    'London': {
      temperature: '15°C',
      humidity: '70%',
      windSpeed: '20 km/h'
    },
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState([]);

  const handleSearch = (city) => {
    const data = mockWeatherData[city];

    if (data) {
      setCurrentWeather({ name: city, ...data });
      setError(false);
      if (!history.includes(city)) {
        setHistory([...history, city]);
      }
    } else {
      setCurrentWeather(null);
      setError(true);
    }
  };

  return (
    <div>
      <input type="text"
        id="citySearch"
        placeholder="Search for a city..."
        value={searchQuery}
        onChange={(e) =>
          setSearchQuery(e.target.value)
        }
      />
      <button
        type="button"
        id="searchButton"
        onClick={() => handleSearch(searchQuery)}
      >Search</button>

      <div id="weatherData">
        {currentWeather && (
          <>
            <div>Temperature: {currentWeather.temperature}</div>
            <div>Humidity: {currentWeather.humidity}</div>
            <div>Wind Speed: {currentWeather.windSpeed}</div>
          </>
        )}
        {error && <div>City not found.</div>}
      </div>
      <div id="previousSearches">
        {history.map((city) => (
          <button type="button" key={city} onClick={() => handleSearch(city)}>
            {city}
          </button>
        ))}
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<WeatherDashboard />);

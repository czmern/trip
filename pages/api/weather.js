// pages/api/weather.js
// Canlı hava durumu - OpenWeatherMap API

export default async function handler(req, res) {
  const { city, lat, lon, days = 7 } = req.query;

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'OPENWEATHER_API_KEY eksik. .env dosyasına ekleyin.' });
  }

  try {
    // Koordinat veya şehir adıyla sorgulama
    let weatherUrl;
    if (lat && lon) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=tr&cnt=${days * 8}`;
    } else {
      weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=tr&cnt=${days * 8}`;
    }

    const response = await fetch(weatherUrl);
    if (!response.ok) throw new Error(`OpenWeather API hatası: ${response.status}`);
    const data = await response.json();

    // Günlük özet çıkar (8 veri noktası = 1 gün)
    const daily = {};
    data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!daily[date]) {
        daily[date] = {
          date,
          temp_max: item.main.temp_max,
          temp_min: item.main.temp_min,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          wind_speed: item.wind.speed,
          weather_id: item.weather[0].id,
        };
      } else {
        if (item.main.temp_max > daily[date].temp_max) daily[date].temp_max = item.main.temp_max;
        if (item.main.temp_min < daily[date].temp_min) daily[date].temp_min = item.main.temp_min;
      }
    });

    // Fırtına/tehlikeli hava uyarısı ekle (weather_id 200-232: gök gürültülü fırtına)
    const result = Object.values(daily).map(day => ({
      ...day,
      temp_max: Math.round(day.temp_max),
      temp_min: Math.round(day.temp_min),
      is_storm: day.weather_id >= 200 && day.weather_id < 300,
      is_rain: day.weather_id >= 300 && day.weather_id < 600,
      emoji: getWeatherEmoji(day.weather_id),
    }));

    return res.status(200).json({
      city: data.city.name,
      country: data.city.country,
      forecast: result,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function getWeatherEmoji(id) {
  if (id >= 200 && id < 300) return '⛈️';
  if (id >= 300 && id < 400) return '🌦️';
  if (id >= 500 && id < 600) return '🌧️';
  if (id >= 600 && id < 700) return '❄️';
  if (id >= 700 && id < 800) return '🌫️';
  if (id === 800) return '☀️';
  if (id === 801) return '🌤️';
  if (id >= 802 && id < 900) return '⛅';
  return '🌡️';
}

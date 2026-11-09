import { MapPin, Thermometer, Droplets, Wind, CloudRain } from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { getWeatherInfo } from '../api/weather'

export default function CurrentWeather({ city, weather }) {
  if (!weather || !weather.current) return null

  const current = weather.current
  const weatherInfo = getWeatherInfo(current.weather_code)

  return (
    <section className="card weather-card">
      <div className="card-header">
        <span className="card-badge">현재 날씨</span>
        <span className="city-tag">
          <MapPin size={14} /> {city.name}
          {city.country && <span className="city-country">({city.country})</span>}
        </span>
      </div>

      <div className="card-body">
        <div className="weather-primary">
          <div className="weather-icon-wrap" style={{ color: weatherInfo.color }}>
            <WeatherIcon name={weatherInfo.icon} size={64} color={weatherInfo.color} />
          </div>
          <div className="temp-display">
            <span className="temp-value">{Math.round(current.temperature_2m)}</span>
            <span className="temp-unit">°C</span>
          </div>
          <div className="weather-label" style={{ color: weatherInfo.color }}>
            {weatherInfo.label}
          </div>
        </div>

        <div className="weather-details-grid">
          <div className="detail-item">
            <div className="detail-label">
              <Thermometer size={16} /> 체감 온도
            </div>
            <div className="detail-value">
              {Math.round(current.apparent_temperature)}°C
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-label">
              <Droplets size={16} /> 습도
            </div>
            <div className="detail-value">
              {current.relative_humidity_2m}%
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-label">
              <Wind size={16} /> 풍속
            </div>
            <div className="detail-value">
              {current.wind_speed_10m} km/h
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-label">
              <CloudRain size={16} /> 강수량
            </div>
            <div className="detail-value">
              {current.precipitation ?? 0} mm
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


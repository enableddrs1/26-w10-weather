import { Calendar, Droplets } from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { getWeatherInfo } from '../api/weather'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function WeeklyForecast({ weather }) {
  if (!weather || !weather.daily || !weather.daily.time) return null

  const {
    time,
    weather_code,
    temperature_2m_max,
    temperature_2m_min,
    precipitation_probability_max
  } = weather.daily

  // 7일간의 전체 최저/최고 기온 (기온 바 비율 계산용)
  const allMins = temperature_2m_min.slice(0, 7)
  const allMaxs = temperature_2m_max.slice(0, 7)
  const globalMin = Math.min(...allMins)
  const globalMax = Math.max(...allMaxs)
  const range = Math.max(globalMax - globalMin, 1)

  const items = time.slice(0, 7).map((dateStr, idx) => {
    const date = new Date(dateStr)
    const isToday = idx === 0
    const dayLabel = isToday ? '오늘' : `${DAYS[date.getDay()]}요일`
    const dateDisplay = `${date.getMonth() + 1}.${date.getDate()}`
    const code = weather_code[idx]
    const info = getWeatherInfo(code)
    const minTemp = Math.round(temperature_2m_min[idx])
    const maxTemp = Math.round(temperature_2m_max[idx])
    const precipProb = precipitation_probability_max ? precipitation_probability_max[idx] : null

    // 기온 바 위치 계산
    const leftPercent = ((minTemp - globalMin) / range) * 100
    const barWidthPercent = Math.max(((maxTemp - minTemp) / range) * 100, 8)

    return {
      dateStr,
      dayLabel,
      dateDisplay,
      info,
      minTemp,
      maxTemp,
      precipProb,
      leftPercent,
      barWidthPercent
    }
  })

  return (
    <section className="card weekly-card">
      <div className="card-header">
        <span className="card-badge">7일간 주간 예보</span>
        <span className="weekly-header-info">
          <Calendar size={14} /> 향후 1주일 기온 및 날씨
        </span>
      </div>

      <div className="weekly-list">
        {items.map((item, idx) => (
          <div key={item.dateStr} className={`weekly-row ${idx === 0 ? 'today-row' : ''}`}>
            <div className="weekly-day-info">
              <span className="weekly-day-name">{item.dayLabel}</span>
              <span className="weekly-day-date">{item.dateDisplay}</span>
            </div>

            <div className="weekly-weather-summary">
              <WeatherIcon name={item.info.icon} size={22} color={item.info.color} />
              <span className="weekly-weather-text">{item.info.label}</span>
              {item.precipProb !== null && item.precipProb > 0 && (
                <span className="weekly-precip-badge">
                  <Droplets size={12} /> {item.precipProb}%
                </span>
              )}
            </div>

            <div className="weekly-temp-range">
              <span className="temp-min-text">{item.minTemp}°</span>
              <div className="temp-bar-track">
                <div
                  className="temp-bar-fill"
                  style={{
                    left: `${item.leftPercent}%`,
                    width: `${item.barWidthPercent}%`
                  }}
                />
              </div>
              <span className="temp-max-text">{item.maxTemp}°</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}


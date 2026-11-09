import { useState, useEffect, useCallback } from 'react'
import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Thermometer,
  Wind,
  Droplets,
  RefreshCw,
  AlertCircle,
  MapPin,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react'
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData
} from './api/weather'
import './App.css'

// 날씨 아이콘 매핑 컴포넌트
const ICON_COMPONENTS = {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning
}

function WeatherIcon({ name, size = 48, color = 'currentColor', className = '' }) {
  const Component = ICON_COMPONENTS[name] || Cloud
  return <Component size={size} color={color} className={className} />
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airData, setAirData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 날씨 및 미세먼지 데이터 조회
  const loadDashboardData = useCallback(async (city) => {
    setLoading(true)
    setError(null)
    try {
      const [weather, air] = await Promise.all([
        fetchWeatherData(city.lat, city.lon),
        fetchAirQualityData(city.lat, city.lon)
      ])
      setWeatherData(weather)
      setAirData(air)
    } catch (err) {
      console.error('데이터 조회 오류:', err)
      setError('기상 정보를 불러오는데 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData(selectedCity)
  }, [selectedCity, loadDashboardData])

  const currentWeather = weatherData?.current
  const currentAir = airData?.current
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null
  const airStatus = currentAir ? getAirQualityStatus(currentAir.pm10, currentAir.pm2_5) : null

  return (
    <div className="dashboard-container">
      {/* 대시보드 헤더 */}
      <header className="dashboard-header">
        <div className="header-title-wrap">
          <div className="logo-badge">
            <CloudSun size={28} className="logo-icon" />
          </div>
          <div>
            <h1>실시간 날씨 & 미세먼지</h1>
            <p className="subtitle">Open-Meteo API 실시간 기상 관측 대시보드</p>
          </div>
        </div>

        <button 
          className="refresh-button"
          onClick={() => loadDashboardData(selectedCity)} 
          disabled={loading}
          title="새로고침"
        >
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
          <span>새로고침</span>
        </button>
      </header>

      {/* 주요 도시 빠른 선택 버튼 바 */}
      <nav className="city-preset-bar" aria-label="도시 선택">
        {DEFAULT_CITIES.map((city) => (
          <button
            key={city.name}
            className={`city-pill ${selectedCity.name === city.name ? 'active' : ''}`}
            onClick={() => setSelectedCity(city)}
          >
            <MapPin size={14} className="city-pin-icon" />
            <span>{city.name}</span>
          </button>
        ))}
      </nav>

      {/* 메인 콘텐츠 영역 */}
      <main className="dashboard-main">
        {error && (
          <div className="error-banner" role="alert">
            <AlertCircle size={22} className="error-icon" />
            <div className="error-content">
              <strong>오류가 발생했습니다</strong>
              <p>{error}</p>
            </div>
            <button className="retry-btn" onClick={() => loadDashboardData(selectedCity)}>
              다시 시도
            </button>
          </div>
        )}

        {loading && !weatherData && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>실시간 기상 데이터를 불러오는 중입니다...</p>
          </div>
        )}

        {/* 날씨 & 미세먼지 카드 그리드 */}
        <div className={`cards-grid ${loading ? 'dimmed' : ''}`}>
          {/* 현재 날씨 카드 */}
          <section className="card weather-card">
            <div className="card-header">
              <span className="card-badge">현재 날씨</span>
              <span className="city-tag">
                <MapPin size={14} /> {selectedCity.name}
              </span>
            </div>

            {currentWeather && weatherInfo && (
              <div className="card-body">
                <div className="weather-primary">
                  <div className="weather-icon-wrap" style={{ color: weatherInfo.color }}>
                    <WeatherIcon name={weatherInfo.icon} size={64} color={weatherInfo.color} />
                  </div>
                  <div className="temp-display">
                    <span className="temp-value">{Math.round(currentWeather.temperature_2m)}</span>
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
                      {Math.round(currentWeather.apparent_temperature)}°C
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <Droplets size={16} /> 습도
                    </div>
                    <div className="detail-value">
                      {currentWeather.relative_humidity_2m}%
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <Wind size={16} /> 풍속
                    </div>
                    <div className="detail-value">
                      {currentWeather.wind_speed_10m} km/h
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <Cloud size={16} /> 강수량
                    </div>
                    <div className="detail-value">
                      {currentWeather.precipitation ?? 0} mm
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 미세먼지 카드 */}
          <section className="card air-card">
            <div className="card-header">
              <span className="card-badge">대기질 정보</span>
              {airStatus && (
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: `${airStatus.badgeColor}22`,
                    color: airStatus.badgeColor,
                    borderColor: airStatus.badgeColor
                  }}
                >
                  {airStatus.status === '좋음' || airStatus.status === '보통' ? (
                    <ShieldCheck size={14} />
                  ) : (
                    <ShieldAlert size={14} />
                  )}
                  {airStatus.status}
                </span>
              )}
            </div>

            {currentAir && airStatus && (
              <div className="card-body">
                <div className="air-primary">
                  <div className="air-score-wrap">
                    <span className="air-status-title" style={{ color: airStatus.badgeColor }}>
                      환경부 기준: {airStatus.status}
                    </span>
                    <p className="air-guide-text">
                      {airStatus.status === '좋음' && '야외 활동하기 아주 좋은 공기질입니다!'}
                      {airStatus.status === '보통' && '무난한 공기질입니다. 일상 활동에 지장 없습니다.'}
                      {airStatus.status === '나쁨' && '장시간 무리한 실외 활동은 피하고 마스크를 착용하세요.'}
                      {airStatus.status === '매우 나쁨' && '실외 활동을 자제하시고 환기를 주의하세요.'}
                    </p>
                  </div>
                </div>

                <div className="air-metrics-grid">
                  <div className="air-metric-card">
                    <div className="metric-header">
                      <span className="metric-name">미세먼지 (PM10)</span>
                      <span className="metric-unit">μg/m³</span>
                    </div>
                    <div className="metric-value">{Math.round(currentAir.pm10)}</div>
                    <div className="metric-scale">
                      <div 
                        className="scale-bar" 
                        style={{ 
                          width: `${Math.min((currentAir.pm10 / 150) * 100, 100)}%`,
                          backgroundColor: airStatus.badgeColor
                        }}
                      />
                    </div>
                    <span className="metric-standard">기준: 0~30 좋음 / 81~ 나쁨</span>
                  </div>

                  <div className="air-metric-card">
                    <div className="metric-header">
                      <span className="metric-name">초미세먼지 (PM2.5)</span>
                      <span className="metric-unit">μg/m³</span>
                    </div>
                    <div className="metric-value">{Math.round(currentAir.pm2_5)}</div>
                    <div className="metric-scale">
                      <div 
                        className="scale-bar" 
                        style={{ 
                          width: `${Math.min((currentAir.pm2_5 / 75) * 100, 100)}%`,
                          backgroundColor: airStatus.badgeColor
                        }}
                      />
                    </div>
                    <span className="metric-standard">기준: 0~15 좋음 / 36~ 나쁨</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>기상 및 대기 데이터 제공: <strong>Open-Meteo (Open-Meteo.com)</strong> · HTTPS 암호화 통신 연동</p>
      </footer>
    </div>
  )
}

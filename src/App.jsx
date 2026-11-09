import { useState, useEffect, useCallback } from 'react'
import { CloudSun, RefreshCw, AlertCircle, MapPin } from 'lucide-react'
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData
} from './api/weather'
import CurrentWeather from './components/CurrentWeather'
import AirQualityCard from './components/AirQualityCard'
import HourlyChart from './components/HourlyChart'
import WeeklyForecast from './components/WeeklyForecast'
import CitySearch from './components/CitySearch'
import './App.css'

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airData, setAirData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 날씨 및 미세먼지 데이터 병렬 조회
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
      setError('기상 정보를 불러오는데 실패했습니다. 네트워크 상태를 확인하시거나 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData(selectedCity)
  }, [selectedCity, loadDashboardData])

  return (
    <div className="dashboard-container">
      {/* 1. 상단 대시보드 헤더 */}
      <header className="dashboard-header">
        <div className="header-title-wrap">
          <div className="logo-badge">
            <CloudSun size={28} className="logo-icon" />
          </div>
          <div>
            <h1>실시간 날씨 & 미세먼지</h1>
            <p className="subtitle">Open-Meteo API 기반 스마트 기상 대시보드</p>
          </div>
        </div>

        <button
          className="refresh-button"
          onClick={() => loadDashboardData(selectedCity)}
          disabled={loading}
          title="최신 기상 정보 새로고침"
        >
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
          <span>새로고침</span>
        </button>
      </header>

      {/* 2. 도시 검색 & 주요 도시 프리셋 바 */}
      <section className="search-and-presets">
        <CitySearch onSelectCity={setSelectedCity} />

        <nav className="city-preset-bar" aria-label="주요 도시 빠른 선택">
          {DEFAULT_CITIES.map((city) => (
            <button
              key={city.name}
              className={`city-pill ${selectedCity.name === city.name ? 'active' : ''}`}
              onClick={() => setSelectedCity(city)}
            >
              <MapPin size={13} className="city-pin-icon" />
              <span>{city.name}</span>
            </button>
          ))}
        </nav>
      </section>

      {/* 3. 메인 대시보드 콘텐츠 영역 */}
      <main className="dashboard-main">
        {error && (
          <div className="error-banner" role="alert">
            <AlertCircle size={22} className="error-icon" />
            <div className="error-content">
              <strong>기상 데이터를 불러오지 못했습니다</strong>
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
            <p>실시간 기상 및 대기 데이터를 불러오는 중입니다...</p>
          </div>
        )}

        {/* 1열: 현재 날씨 카드 & 미세먼지 카드 (컴포넌트 분리) */}
        <div className={`cards-grid ${loading ? 'dimmed' : ''}`}>
          <CurrentWeather city={selectedCity} weather={weatherData} />
          <AirQualityCard airQuality={airData} />
        </div>

        {/* 2열: 24시간 시간별 기온 SVG 차트 */}
        <div className={`chart-section ${loading ? 'dimmed' : ''}`}>
          <HourlyChart weather={weatherData} />
        </div>

        {/* 3열: 7일간 주간 예보 */}
        <div className={`forecast-section ${loading ? 'dimmed' : ''}`}>
          <WeeklyForecast weather={weatherData} />
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>
          실시간 기상 및 대기질 데이터 제공: <strong>Open-Meteo.com</strong> ·
          HTTPS 암호화 통신 & 400ms 디바운스 적용
        </p>
      </footer>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import {
  CloudSun,
  RefreshCw,
  AlertCircle,
  MapPin,
  History,
  Trash2,
  X,
  Sun,
  Moon
} from 'lucide-react'
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

const RECENT_CITIES_KEY = 'recent_weather_cities'
const THEME_MODE_KEY = 'weather_dashboard_theme_mode'

// 현재 날씨 코드 및 주야간(is_day) 기반 기상 상태 키 추출
function getWeatherConditionKey(current) {
  if (!current) return 'clear-day'
  const isDay = current.is_day === 1
  const code = current.weather_code

  if (code === 95) return 'thunder'
  if ([71, 73, 75, 77].includes(code)) return 'snowy'
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'rainy'
  if ([45, 48].includes(code)) return 'fog'
  if ([2, 3].includes(code)) return isDay ? 'cloudy-day' : 'cloudy-night'
  if ([0, 1].includes(code)) return isDay ? 'clear-day' : 'clear-night'
  return isDay ? 'clear-day' : 'clear-night'
}

export default function App() {
  // 1. 테마 모드: 기본값 'light' (요구사항)
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_MODE_KEY)
      return saved === 'dark' ? 'dark' : 'light' // 기본값: light
    } catch {
      return 'light'
    }
  })

  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airData, setAirData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 2. 최근 본 도시 (localStorage 연동)
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_CITIES_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // 테마 모드 토글 함수
  const toggleThemeMode = () => {
    setThemeMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      try {
        localStorage.setItem(THEME_MODE_KEY, next)
      } catch (e) {
        console.error('테마 모드 저장 실패:', e)
      }
      return next
    })
  }

  // 최근 본 도시 추가
  const addRecentCity = useCallback((city) => {
    setRecentCities((prev) => {
      const filtered = prev.filter(
        (c) => c.name !== city.name || (c.country && c.country !== city.country)
      )
      const updated = [city, ...filtered].slice(0, 5)
      try {
        localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('localStorage 저장 실패:', e)
      }
      return updated
    })
  }, [])

  // 최근 본 도시 개별 삭제
  const removeRecentCity = (e, cityName) => {
    e.stopPropagation()
    setRecentCities((prev) => {
      const updated = prev.filter((c) => c.name !== cityName)
      localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(updated))
      return updated
    })
  }

  // 최근 본 도시 전체 삭제
  const clearRecentCities = () => {
    setRecentCities([])
    localStorage.removeItem(RECENT_CITIES_KEY)
  }

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
      addRecentCity(city)
    } catch (err) {
      console.error('데이터 조회 오류:', err)
      setError('기상 정보를 불러오는데 실패했습니다. 네트워크 상태를 확인하시거나 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }, [addRecentCity])

  useEffect(() => {
    loadDashboardData(selectedCity)
  }, [selectedCity, loadDashboardData])

  const weatherKey = getWeatherConditionKey(weatherData?.current)

  return (
    <div className={`dashboard-wrapper mode-${themeMode} weather-${weatherKey}`}>
      <div className="dashboard-container">
        {/* 대시보드 헤더 */}
        <header className="dashboard-header">
          <div className="header-title-wrap">
            <div className="logo-badge">
              <CloudSun size={28} className="logo-icon" />
            </div>
            <div>
              <h1>실시간 날씨 & 미세먼지</h1>
              <p className="subtitle">Open-Meteo API 연동 스마트 기상 대시보드</p>
            </div>
          </div>

          <div className="header-actions">
            {/* 라이트 / 다크 모드 토글 버튼 */}
            <button
              className="theme-toggle-btn"
              onClick={toggleThemeMode}
              title={themeMode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
              aria-label="테마 모드 전환"
            >
              {themeMode === 'light' ? (
                <>
                  <Moon size={18} className="theme-btn-icon" />
                  <span>다크 모드</span>
                </>
              ) : (
                <>
                  <Sun size={18} className="theme-btn-icon" />
                  <span>라이트 모드</span>
                </>
              )}
            </button>

            {/* 새로고침 버튼 */}
            <button
              className="refresh-button"
              onClick={() => loadDashboardData(selectedCity)}
              disabled={loading}
              title="최신 기상 정보 새로고침"
            >
              <RefreshCw size={17} className={loading ? 'spin' : ''} />
              <span>새로고침</span>
            </button>
          </div>
        </header>

        {/* 도시 검색 & 프리셋 & 최근 본 도시 */}
        <section className="search-and-presets">
          <CitySearch onSelectCity={setSelectedCity} />

          {/* 최근 본 도시 뱃지 바 */}
          {recentCities.length > 0 && (
            <div className="recent-cities-section">
              <div className="recent-header">
                <span className="recent-title">
                  <History size={13} /> 최근 본 도시
                </span>
                <button className="clear-recent-btn" onClick={clearRecentCities} title="전체 삭제">
                  <Trash2 size={12} /> 기록 지우기
                </button>
              </div>
              <div className="recent-chips-list">
                {recentCities.map((city) => (
                  <button
                    key={`${city.name}-${city.lat}`}
                    className={`recent-chip ${selectedCity.name === city.name ? 'active' : ''}`}
                    onClick={() => setSelectedCity(city)}
                  >
                    <span>{city.name}</span>
                    <span
                      className="chip-remove"
                      onClick={(e) => removeRecentCity(e, city.name)}
                      title="삭제"
                    >
                      <X size={12} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 주요 도시 빠른 선택 버튼 바 */}
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

        {/* 메인 대시보드 콘텐츠 영역 */}
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

          {/* 1열: 현재 날씨 카드 & 미세먼지 카드 */}
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
            기상 데이터: <strong>Open-Meteo.com</strong> ·
            기상 연동 동적 테마 & 라이트/다크 모드 지원
          </p>
        </footer>
      </div>
    </div>
  )
}

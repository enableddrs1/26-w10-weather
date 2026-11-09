import { Clock, TrendingUp } from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { getWeatherInfo } from '../api/weather'

export default function HourlyChart({ weather }) {
  if (!weather || !weather.hourly || !weather.hourly.time) return null

  const { time, temperature_2m, weather_code } = weather.hourly

  // 현재 시간과 가장 가까운 인덱스 탐색
  const now = new Date()
  let startIndex = 0
  for (let i = 0; i < time.length; i++) {
    const itemDate = new Date(time[i])
    if (itemDate >= now) {
      startIndex = Math.max(0, i - 1)
      break
    }
  }

  // 향후 24시간 슬라이스
  const count = 24
  const hourlyItems = []
  for (let i = startIndex; i < Math.min(startIndex + count, time.length); i++) {
    const d = new Date(time[i])
    const hour = d.getHours()
    hourlyItems.push({
      timeStr: `${hour}시`,
      isNow: i === startIndex,
      temp: Math.round(temperature_2m[i]),
      weatherCode: weather_code ? weather_code[i] : null
    })
  }

  if (hourlyItems.length === 0) return null

  // SVG 좌표 계산
  const temps = hourlyItems.map((item) => item.temp)
  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const tempRange = Math.max(maxTemp - minTemp, 1)

  const itemWidth = 56
  const chartHeight = 140
  const topPadding = 30
  const bottomPadding = 30
  const totalWidth = hourlyItems.length * itemWidth

  // 각 포인트의 (x, y)
  const points = hourlyItems.map((item, index) => {
    const x = index * itemWidth + itemWidth / 2
    // 높을수록 위(y값이 작음)
    const normalized = (item.temp - minTemp) / tempRange
    const y = chartHeight - bottomPadding - normalized * (chartHeight - topPadding - bottomPadding)
    return { ...item, x, y }
  })

  // SVG polyline points 문자열
  const pointsString = points.map((p) => `${p.x},${p.y}`).join(' ')

  // SVG 영역 채우기용 area path
  const areaPath = `M ${points[0].x},${chartHeight - bottomPadding + 10} ` +
    points.map((p) => `L ${p.x},${p.y}`).join(' ') +
    ` L ${points[points.length - 1].x},${chartHeight - bottomPadding + 10} Z`

  return (
    <section className="card hourly-card">
      <div className="card-header">
        <span className="card-badge">24시간 시간별 기온 예보</span>
        <span className="hourly-summary">
          <TrendingUp size={14} /> 최저 {minTemp}°C / 최고 {maxTemp}°C
        </span>
      </div>

      <div className="hourly-scroll-container">
        <svg
          className="hourly-svg"
          width={totalWidth}
          height={chartHeight + 40}
          viewBox={`0 0 ${totalWidth} ${chartHeight + 40}`}
        >
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 그라데이션 영역 */}
          <path d={areaPath} fill="url(#tempGradient)" />

          {/* 꺾은선 */}
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
          />

          {/* 데이터 포인트 및 텍스트 */}
          {points.map((p, idx) => (
            <g key={idx} className="chart-point-group">
              {/* 온도 텍스트 */}
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                className="chart-temp-label"
              >
                {p.temp}°
              </text>

              {/* 포인트 점 */}
              <circle
                cx={p.x}
                cy={p.y}
                r={p.isNow ? 5 : 3.5}
                className={p.isNow ? 'chart-dot active' : 'chart-dot'}
              />

              {/* 시간 축 텍스트 */}
              <text
                x={p.x}
                y={chartHeight + 20}
                textAnchor="middle"
                className={`chart-time-label ${p.isNow ? 'active' : ''}`}
              >
                {p.isNow ? '지금' : p.timeStr}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  )
}


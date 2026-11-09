import { ShieldCheck, ShieldAlert } from 'lucide-react'
import { getAirQualityStatus } from '../api/weather'

export default function AirQualityCard({ airQuality }) {
  if (!airQuality || !airQuality.current) return null

  const current = airQuality.current
  const airStatus = getAirQualityStatus(current.pm10, current.pm2_5)

  return (
    <section className="card air-card">
      <div className="card-header">
        <span className="card-badge">대기질 정보</span>
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
      </div>

      <div className="card-body">
        <div className="air-primary">
          <div className="air-score-wrap">
            <span className="air-status-title" style={{ color: airStatus.badgeColor }}>
              환경부 기준: {airStatus.status}
            </span>
            <p className="air-guide-text">
              {airStatus.status === '좋음' && '야외 활동하기 아주 좋은 쾌적한 공기질입니다!'}
              {airStatus.status === '보통' && '무난한 공기질입니다. 일상 활동에 지장 없습니다.'}
              {airStatus.status === '나쁨' && '장시간 무리한 실외 활동은 피하고 마스크를 착용하세요.'}
              {airStatus.status === '매우 나쁨' && '실외 활동을 자제하시고 환기에 주의하세요.'}
            </p>
          </div>
        </div>

        <div className="air-metrics-grid">
          <div className="air-metric-card">
            <div className="metric-header">
              <span className="metric-name">미세먼지 (PM10)</span>
              <span className="metric-unit">μg/m³</span>
            </div>
            <div className="metric-value">{Math.round(current.pm10)}</div>
            <div className="metric-scale">
              <div
                className="scale-bar"
                style={{
                  width: `${Math.min((current.pm10 / 150) * 100, 100)}%`,
                  backgroundColor: airStatus.badgeColor
                }}
              />
            </div>
            <span className="metric-standard">기준: 0~30 좋음 / 31~80 보통 / 81~ 나쁨</span>
          </div>

          <div className="air-metric-card">
            <div className="metric-header">
              <span className="metric-name">초미세먼지 (PM2.5)</span>
              <span className="metric-unit">μg/m³</span>
            </div>
            <div className="metric-value">{Math.round(current.pm2_5)}</div>
            <div className="metric-scale">
              <div
                className="scale-bar"
                style={{
                  width: `${Math.min((current.pm2_5 / 75) * 100, 100)}%`,
                  backgroundColor: airStatus.badgeColor
                }}
              />
            </div>
            <span className="metric-standard">기준: 0~15 좋음 / 16~35 보통 / 36~ 나쁨</span>
          </div>
        </div>
      </div>
    </section>
  )
}


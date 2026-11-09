/**
 * Open-Meteo API 통신 레이어
 * 
 * 💡 사이버보안과 아키텍처 체크포인트:
 * 1. UI 컴포넌트(App.jsx)와 데이터 통신 로직(weather.js)을 철저히 분리(Decoupling)합니다.
 * 2. Open-Meteo는 API Key가 필요 없는 공개 API이므로 브라우저에서 직접 호출 가능합니다.
 *    (만약 Secret Key가 필요한 유료 API라면 키 탈취 방지를 위해 반드시 백엔드 프록시 서버를 거쳐야 합니다.)
 * 3. 모든 통신은 HTTPS 암호화 프로토콜을 사용하며, 네트워크 오류에 대비한 예외 처리(try/catch)를 갖춥니다.
 */

// 주요 도시 프리셋 (클릭 한 번으로 조회)
export const DEFAULT_CITIES = [
  { name: '서울 (강서)', lat: 37.5509, lon: 126.8495 },
  { name: '서울 (시청)', lat: 37.5665, lon: 126.9780 },
  { name: '인천', lat: 37.4563, lon: 126.7052 },
  { name: '부산', lat: 35.1796, lon: 129.0756 },
  { name: '대구', lat: 35.8714, lon: 128.6014 },
  { name: '대전', lat: 36.3504, lon: 127.3845 },
  { name: '광주', lat: 35.1595, lon: 126.8526 },
  { name: '제주', lat: 33.4996, lon: 126.5312 },
];

/**
 * WMO (세계기상기구) 날씨 코드 한국어 변환
 */
export function getWeatherInfo(code) {
  const weatherMap = {
    0: { label: '맑음', icon: 'Sun', color: '#f59e0b' },
    1: { label: '대체로 맑음', icon: 'SunDim', color: '#fbbf24' },
    2: { label: '구름 조금', icon: 'CloudSun', color: '#60a5fa' },
    3: { label: '흐림', icon: 'Cloud', color: '#94a3b8' },
    45: { label: '안개', icon: 'CloudFog', color: '#64748b' },
    48: { label: '서리 안개', icon: 'CloudFog', color: '#64748b' },
    51: { label: '가벼운 이슬비', icon: 'CloudDrizzle', color: '#38bdf8' },
    53: { label: '이슬비', icon: 'CloudDrizzle', color: '#0284c7' },
    55: { label: '강한 이슬비', icon: 'CloudDrizzle', color: '#0369a1' },
    61: { label: '약한 비', icon: 'CloudRain', color: '#38bdf8' },
    63: { label: '보통 비', icon: 'CloudRain', color: '#0284c7' },
    65: { label: '강한 비', icon: 'CloudRain', color: '#1d4ed8' },
    71: { label: '약한 눈', icon: 'Snowflake', color: '#93c5fd' },
    73: { label: '보통 눈', icon: 'Snowflake', color: '#60a5fa' },
    75: { label: '폭설', icon: 'Snowflake', color: '#2563eb' },
    77: { label: '싸락눈', icon: 'Snowflake', color: '#93c5fd' },
    80: { label: '약한 소나기', icon: 'CloudRain', color: '#38bdf8' },
    81: { label: '보통 소나기', icon: 'CloudRain', color: '#0284c7' },
    82: { label: '강한 소나기', icon: 'CloudRain', color: '#1e40af' },
    95: { label: '뇌우 (천둥번개)', icon: 'CloudLightning', color: '#7c3aed' },
  };
  return weatherMap[code] || { label: '알 수 없음', icon: 'Cloud', color: '#94a3b8' };
}

/**
 * 한국 환경부 기준 미세먼지(PM10) 및 초미세먼지(PM2.5) 등급 평가
 */
export function getAirQualityStatus(pm10, pm25) {
  // PM10 기준 (μg/m³): 0~30 좋음, 31~80 보통, 81~150 나쁨, 151~ 매우나쁨
  // PM2.5 기준 (μg/m³): 0~15 좋음, 16~35 보통, 36~75 나쁨, 76~ 매우나쁨
  let status = '좋음';
  let badgeColor = '#10b981'; // 초록

  if (pm10 > 150 || pm25 > 75) {
    status = '매우 나쁨';
    badgeColor = '#ef4444'; // 빨강
  } else if (pm10 > 80 || pm25 > 35) {
    status = '나쁨';
    badgeColor = '#f97316'; // 주황
  } else if (pm10 > 30 || pm25 > 15) {
    status = '보통';
    badgeColor = '#3b82f6'; // 파랑
  }

  return { status, badgeColor };
}

/**
 * Open-Meteo 날씨 정보 조회 (현재 날씨 + 시간별 예보 + 7일간 일별 예보)
 */
export async function fetchWeatherData(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&timezone=Asia%2FSeoul`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`날씨 API 응답 오류 (HTTP ${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error('날씨 데이터 조회 실패:', err);
    throw err;
  }
}

/**
 * Open-Meteo 공기질(미세먼지) 정보 조회
 */
export async function fetchAirQualityData(lat, lon) {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,european_aqi&timezone=Asia%2FSeoul`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`미세먼지 API 응답 오류 (HTTP ${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error('미세먼지 데이터 조회 실패:', err);
    throw err;
  }
}

/**
 * Open-Meteo 도시 검색 (Geocoding API)
 * 라틴 영문(Seoul, Busan 등) 검색을 기본 지원합니다.
 */
export async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];

  const encodedQuery = encodeURIComponent(query.trim());
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodedQuery}&count=5&language=ko&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('도시 검색 실패:', err);
    return [];
  }
}

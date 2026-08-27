// [기타 외부 API] Open-Meteo — 좌표 기반 무료 날씨 API (API Key 불필요, OpenWeatherMap 과 다른 제공자)
// 상세 페이지에서 해당 도시의 '3일 예보'를 추가로 보여주는 데 사용
import axios from 'axios'

const meteo = axios.create({
  baseURL: 'https://api.open-meteo.com/v1',
})

// WMO weather_code → { 이모지, 한글 설명 } 매핑
const WMO = {
  0: ['☀️', '맑음'],
  1: ['🌤️', '대체로 맑음'],
  2: ['⛅', '구름 조금'],
  3: ['☁️', '흐림'],
  45: ['🌫️', '안개'],
  48: ['🌫️', '짙은 안개'],
  51: ['🌦️', '약한 이슬비'],
  53: ['🌦️', '이슬비'],
  55: ['🌦️', '강한 이슬비'],
  61: ['🌧️', '약한 비'],
  63: ['🌧️', '비'],
  65: ['🌧️', '강한 비'],
  71: ['🌨️', '약한 눈'],
  73: ['❄️', '눈'],
  75: ['❄️', '강한 눈'],
  80: ['🌦️', '소나기'],
  81: ['🌦️', '소나기'],
  82: ['⛈️', '강한 소나기'],
  95: ['⛈️', '뇌우'],
  96: ['⛈️', '뇌우/우박'],
  99: ['⛈️', '강한 뇌우'],
}

const describe = (code) => WMO[code] ?? ['🌡️', '-']

// 좌표(lat/lon)로 향후 며칠간의 일별 예보를 조회
// 반환: [{ date, weekday, icon, desc, max, min }, ...]
export async function fetchForecast(lat, lon, days = 3) {
  const { data } = await meteo.get('/forecast', {
    params: {
      latitude: lat,
      longitude: lon,
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      forecast_days: days,
      timezone: 'auto',
    },
  })

  const d = data.daily
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']

  return d.time.map((iso, i) => {
    const [emoji, desc] = describe(d.weather_code[i])
    const dateObj = new Date(iso)
    return {
      date: iso.slice(5), // MM-DD
      weekday: weekdays[dateObj.getDay()],
      icon: emoji,
      desc,
      max: Math.round(d.temperature_2m_max[i]),
      min: Math.round(d.temperature_2m_min[i]),
    }
  })
}

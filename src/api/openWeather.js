// OpenWeatherMap API 호출을 담당하는 서비스 계층
// - axios 인스턴스를 한 번만 만들어 baseURL / 공통 파라미터(appid, units, lang)를 재사용
// - 컴포넌트는 이 파일의 함수만 호출하고, 실제 HTTP 세부사항은 몰라도 되게 분리
import axios from 'axios'

// Vite 환경변수(.env 의 VITE_OPENWEATHER_API_KEY)에서 키를 읽는다
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

// 키가 비어있으면 개발 중 빠르게 알아차리도록 콘솔 경고
if (!API_KEY) {
  console.warn(
    '[openWeather] VITE_OPENWEATHER_API_KEY 가 비어 있습니다. .env 에 키를 넣고 dev 서버를 재시작하세요.'
  )
}

// 현재 날씨 / 예보 등 data API 용 인스턴스
const owm = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  params: {
    appid: API_KEY,
    units: 'metric', // 섭씨 기준
    lang: 'kr', // 날씨 설명을 한국어로
  },
})

// Geocoding(도시명 → 좌표) 전용 인스턴스 (baseURL 이 다름)
const geo = axios.create({
  baseURL: 'https://api.openweathermap.org/geo/1.0',
  params: { appid: API_KEY },
})

// OpenWeatherMap 아이콘 코드(예: '01d')를 이모지로 매핑
const ICON_EMOJI = {
  '01': '☀️', // 맑음
  '02': '🌤️', // 구름 조금
  '03': '☁️', // 구름
  '04': '☁️', // 흐림
  '09': '🌧️', // 소나기
  10: '🌦️', // 비
  11: '⛈️', // 뇌우
  13: '❄️', // 눈
  50: '🌫️', // 안개
}

const toEmoji = (iconCode = '') => ICON_EMOJI[iconCode.slice(0, 2)] ?? '🌡️'

// OpenWeatherMap 현재 날씨 응답 → 앱 내부에서 쓰는 공통 형식으로 변환
// 기존 mock 데이터(weatherData.js)와 같은 필드 구조를 유지해 컴포넌트 변경을 최소화
export function mapCurrentWeather(data) {
  return {
    id: String(data.id), // OWM 도시 고유 id (상세 라우팅 키로 사용)
    name: data.name,
    region: data.sys?.country ? `${data.sys.country} · ${data.name}` : data.name,
    temp: Math.round(data.main.temp),
    status: data.weather?.[0]?.description ?? '-',
    humidity: data.main.humidity,
    wind: data.wind?.speed ?? 0,
    icon: toEmoji(data.weather?.[0]?.icon),
    country: data.sys?.country ?? '', // 요구사항3(국가 정보 API)에서 사용
    lat: data.coord?.lat,
    lon: data.coord?.lon,
  }
}

// 도시 고유 id 로 현재 날씨 조회 (상세 페이지에서 사용)
export async function fetchWeatherById(cityId) {
  const { data } = await owm.get('/weather', { params: { id: cityId } })
  return mapCurrentWeather(data)
}

// 좌표(lat/lon)로 현재 날씨 조회
export async function fetchWeatherByCoords(lat, lon) {
  const { data } = await owm.get('/weather', { params: { lat, lon } })
  return mapCurrentWeather(data)
}

// 도시 이름으로 현재 날씨 조회 (기본 대시보드 목록 로딩에 사용)
export async function fetchWeatherByCity(cityName) {
  const { data } = await owm.get('/weather', { params: { q: cityName } })
  return mapCurrentWeather(data)
}

// [추가 OpenWeatherMap API] Geocoding: 도시명 → 좌표 후보 목록
// 실시간 검색에서 사용자가 입력한 도시명을 좌표로 변환하는 데 사용
export async function geocodeCity(query, limit = 5) {
  const { data } = await geo.get('/direct', { params: { q: query, limit } })
  // 한국어 이름이 있으면 우선 노출
  return data.map((c) => ({
    name: c.local_names?.ko ?? c.name,
    country: c.country,
    state: c.state ?? '',
    lat: c.lat,
    lon: c.lon,
  }))
}

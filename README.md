# 🌦️ SKALA Weather — Vue 3 종합 실습

Vue 3로 만든 날씨 애플리케이션입니다. **실제 외부 API로 실시간 날씨**를 가져오고, 3D 지구본·카드 대시보드·3일 예보로 확장했습니다.

🔗 **배포:** [https://skala-pjkr31tzu-cacai1844-7223s-projects.vercel.app](https://skala-vue-neon-zeta.vercel.app/)
💻 **저장소:** https://github.com/bethebestKR/skala-vue

> 이 README는 **① 사용한 API · ② 트러블슈팅 · ③ 느낀 점** 을 중심으로 정리했습니다.

---

## 🌐 ① 사용한 API

실시간 날씨 데이터는 **OpenWeatherMap 2종 + Open-Meteo 1종**, 총 3개의 외부 API로 구성했습니다.
공통적으로 `axios.create()`로 baseURL·공통 파라미터를 인스턴스에 고정하고, API 키는 `.env`(`VITE_OPENWEATHER_API_KEY`)로 관리해 코드/깃에 노출되지 않게 했습니다.

### 1. OpenWeatherMap — Current Weather (현재 날씨, 무료 2.5)
- **엔드포인트:** `GET https://api.openweathermap.org/data/2.5/weather`
- **파라미터:** `q`(도시명) / `lat`·`lon`(좌표) / `id`(도시 id) 중 하나 + `appid`, `units=metric`, `lang=kr`
- **어디에 썼나:** 대시보드 기본 도시 날씨, **지구본 클릭 지점 날씨**, 상세 페이지 현재 날씨
- **처리:** 응답 원본 JSON을 `mapCurrentWeather()`로 `{ id, name, temp, status, humidity, wind, icon, lat, lon }` 형태로 **매핑**해서 사용
- **선택 이유:** One Call 3.0은 유료(카드 등록)라, **무료인 2.5**를 사용

### 2. OpenWeatherMap — Geocoding (도시명 → 좌표)
- **엔드포인트:** `GET https://api.openweathermap.org/geo/1.0/direct`
- **파라미터:** `q`(검색어), `limit`, `appid`
- **어디에 썼나:** 대시보드의 **세계 도시 실시간 검색** (요구사항 2 — 제공 API 추가 확장)
- **처리:** 검색어 → 좌표 후보를 받아 각 좌표로 다시 현재 날씨를 조회. 한국어 이름(`local_names.ko`)을 우선 표시

### 3. Open-Meteo — Forecast (3일 예보, 무료·키 불필요)
- **엔드포인트:** `GET https://api.open-meteo.com/v1/forecast`
- **파라미터:** `latitude`, `longitude`, `daily=weather_code,temperature_2m_max,temperature_2m_min`, `forecast_days=3`, `timezone=auto`
- **어디에 썼나:** 상세 페이지의 **3일 예보** (요구사항 3 — 기타 외부 API 추가)
- **처리:** WMO `weather_code`를 이모지·한글 설명으로 매핑해 `{ date, weekday, icon, desc, max, min }`로 변환
- **선택 이유:** **API Key가 필요 없는** 무료 API이고, OpenWeatherMap과 **다른 제공자**라 "기타 외부 API" 요건에 부합

| API | 제공자 | 키 필요 | 용도 |
|---|---|:---:|---|
| Current Weather 2.5 | OpenWeatherMap | ✅ | 현재 날씨(대시보드·지구본·상세) |
| Geocoding | OpenWeatherMap | ✅ | 도시명→좌표(실시간 검색) |
| Forecast | Open-Meteo | ❌ | 3일 예보(상세) |

---

## 🧯 ② 트러블슈팅 (실제로 겪은 문제와 해결)

### 1) OpenWeatherMap API Key 401 — 가장 당황스러웠던 문제
- **증상:** 안내대로 **직접 발급받은 키**를 넣었더니 "날씨 데이터를 불러오지 못했습니다" + 401. 그런데 **교수님 키로 바꾸면 정상 동작**해서 더 혼란스러웠음.
- **원인:** 새로 발급된 키는 **활성화까지 시간이 걸린다(최대 ~2시간)**. 그 사이엔 401 반환. 이미 활성화된 교수님 키는 바로 동작 → **내 코드 문제가 아니라 키 활성화 지연**이었음.
- **해결:** ① 내 키 ↔ 교수님 키를 바꿔가며 "코드가 아니라 키" 문제임을 특정 → ② 시간이 지나 내 키도 정상화(HTTP 200) → ③ 유료 3.0 대신 **무료 2.5 엔드포인트**로 마무리.
- **배운 점:** "안 되는 게 항상 내 코드 탓은 아니다." 변수를 하나씩 바꿔 원인을 좁히는 디버깅 방식을 체감.

### 2) 무료(2.5) vs 유료(3.0) API 버전
- One Call 3.0은 카드 등록(유료)이 필요 → 무료인 Current Weather **2.5**로 고정.

### 3) REST Countries API deprecated
- 국가 정보용으로 붙였던 `restcountries.com`이 `"deprecated"` 응답을 반환 → 요구사항 3(기타 외부 API)을 **Open-Meteo 3일 예보**로 전면 교체. (WorldTimeAPI 등도 테스트했으나 응답 불가로 제외.)

### 4) 다크모드 배경 충돌
- OS 다크모드일 때 배경만 검게 바뀌고 글자색은 그대로여서 안 보임 → Vite 템플릿 `base.css`의 `@media (prefers-color-scheme: dark)` 블록 제거, 라이트 테마로 고정.

### 5) three-globe 지구 텍스처 import 차단
- `three-globe/example/img/...` 경로 import가 빌드 실패(`exports` 필드 차단) → 텍스처를 `public/textures/`로 복사하고 URL로 참조.

### 6) 배포 시 API 키
- Vite의 `VITE_` 변수는 브라우저 번들에 노출됨 + `.env`는 git 제외 → **Vercel 환경변수**에 `VITE_OPENWEATHER_API_KEY`를 따로 등록해야 배포본에서 날씨가 뜸.

---

## 🌱 ③ 느낀 점

솔직히 실습을 따라가는 과정 자체는 크게 막히는 부분이 없었습니다. 단계마다 설명이 자세히 나와 있었고, 교수님이 코드도 깃에 올려주셔서 그대로 따라 하면 대부분 잘 됐습니다. 그래서 "따라 하다 안 됐다"는 순간은 거의 없었고, 제대로 골치 아팠던 건 마지막(4일차)에 만난 **API 키 문제** 하나였습니다. 제가 발급받은 키는 계속 안 되는데 교수님 키로는 되니까 "내가 뭘 잘못했나" 싶어 한참 들여다봤는데, 알고 보니 새로 만든 키가 아직 활성화되지 않은 거였습니다. 결국 무료인 **2.5 엔드포인트**로 해결하면서, *안 되는 게 항상 제 코드 탓은 아니라는 것*을 배웠습니다.

제일 신기했던 건 코드를 저장하자마자 **화면이 바로바로 바뀌는 것**이었습니다. 개발하면서 결과가 즉시 보이니 훨씬 편했고, 신기해서 자꾸 이것저것 바꿔보게 됐습니다.

가장 뿌듯했던 순간은 **API를 연동해서 진짜 데이터가 화면에 붙었을 때**였습니다. 처음으로 실제 기상 데이터가 카드에 뜨고, 나중엔 지구본까지 실시간 날씨로 연결되니 "이제 진짜 앱 같다"는 느낌이 들었습니다.

확장 부분에서는 UI가 마음에 안 들어서 더 좋은 화면을 만들려고 꽤 고민했습니다. 지구본을 **밤에서 낮으로** 바꿔보고, **핀도 뺐다 넣었다** 여러 번 시도한 끝에, 지구본을 클릭하면 그 자리에 핑(물결)이 뜨면서 날씨가 나오는 방식이 제일 마음에 들었습니다. 이것저것 직접 바꿔보며 "내가 원하는 화면"을 찾아가는 과정이 재밌었습니다.

---

<details>
<summary>📚 그 외 — 화면 구성 · 실습 단계 요약 (참고용)</summary>

### 화면(라우트)
| 경로 | 화면 | 설명 |
|---|---|---|
| `/` | 지구본 랜딩 | 3D 지구본을 드래그·확대, 아무 지점 클릭 시 실시간 날씨 |
| `/dashboard` | 카드 대시보드 | 기본 도시 + 실시간 도시 검색(Geocoding) |
| `/weather/:cityId` | 상세 | 현재 날씨 + Open-Meteo 3일 예보 |
| `/lessons` | 실습 아카이브 | 01~08 단계 인덱스 |
| `/about` | 소개 | 프로젝트 안내 |

### 실습 8단계 (같은 앱을 점진 발전)
01 Mockup(`v-for`/`v-if`) · 02 Composition(`ref`/`computed`/`watch`, 이스터에그) · 03 컴포넌트 분리(`props`/`emit`/`slot`) · 04 Router(동적 라우트·Lazy) · 05 Store(Pinia 전역상태) · 06 Axios+OpenWeatherMap · 07 Element Plus(UI) · 08 확장(globe.gl 지구본 + Open-Meteo)

### 기술 스택
Vue 3(`<script setup>`) · Vite · vue-router · Pinia · Axios · Element Plus · globe.gl(three.js)

</details>

---

## 🚀 실행 방법

```sh
npm install

# .env 에 OpenWeatherMap 키 설정
# VITE_OPENWEATHER_API_KEY=발급받은_키

npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
```

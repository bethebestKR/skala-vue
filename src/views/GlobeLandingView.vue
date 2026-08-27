<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import Globe from 'globe.gl'
import { useConfigStore } from '@/stores/configStore'
import { useDisplayTemp } from '@/composables/useDisplayTemp'
import { fetchWeatherByCoords } from '../api/openWeather.js'

const router = useRouter()

// 밝은 낮(블루마블) 지구 텍스처 (public/textures 에서 서빙 — 외부 CDN 불필요)
const BASE = import.meta.env.BASE_URL
const earthImg = `${BASE}textures/earth-blue-marble.jpg`
const bumpImg = `${BASE}textures/earth-topology.png`
const skyImg = `${BASE}textures/night-sky.png`

const globeEl = ref(null)
let globe = null

// 선택된 지점의 날씨 (지구본 클릭 시)
const selected = ref(null)
const isLoading = ref(false)
const errorMsg = ref('')

// 단위 설정에 맞춘 온도 표시
const { unitSymbol } = storeToRefs(useConfigStore())
const { displayTemp } = useDisplayTemp(() => selected.value?.temp ?? 0)

// 우상단 실시간 시계
const clock = ref('')
let clockTimer = null
function updateClock() {
  const now = new Date()
  clock.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

// 지구본 표면 클릭 → 그 좌표의 실시간 날씨 조회 + 클릭 지점에 물결 표시
async function handleGlobeClick({ lat, lng }) {
  // 클릭한 지점으로 부드럽게 확대
  globe.pointOfView({ lat, lng, altitude: 1.4 }, 900)
  // 클릭 지점에 퍼지는 링 표시
  globe.ringsData([{ lat, lng }])

  isLoading.value = true
  errorMsg.value = ''
  selected.value = null
  try {
    selected.value = await fetchWeatherByCoords(lat, lng)
  } catch {
    errorMsg.value = '이 지점의 날씨를 불러오지 못했습니다. (바다이거나 관측소가 없을 수 있어요)'
  } finally {
    isLoading.value = false
  }
}

function onResize() {
  if (!globe || !globeEl.value) return
  globe.width(globeEl.value.clientWidth).height(globeEl.value.clientHeight)
}

function goDetail() {
  if (selected.value?.id) router.push('/weather/' + selected.value.id)
}

onMounted(() => {
  globe = Globe()(globeEl.value)
    .globeImageUrl(earthImg)
    .bumpImageUrl(bumpImg)
    .backgroundImageUrl(skyImg)
    .backgroundColor('#05070d')
    .atmosphereColor('#7bb8f7')
    .atmosphereAltitude(0.22)
    // 클릭 지점에 퍼지는 물결(ring) 하나만 표시
    .ringsData([])
    .ringLat('lat')
    .ringLng('lng')
    .ringColor(() => (t) => `rgba(123, 184, 247, ${1 - t})`)
    .ringMaxRadius(4)
    .ringPropagationSpeed(2)
    .ringRepeatPeriod(700)
    .onGlobeClick(handleGlobeClick)
    .width(globeEl.value.clientWidth)
    .height(globeEl.value.clientHeight)

  // 회전은 사용자가 직접 드래그 (자동 회전 없음) + 부드러운 줌
  const controls = globe.controls()
  controls.autoRotate = false
  controls.enableZoom = true
  controls.enableDamping = true
  controls.dampingFactor = 0.12
  controls.rotateSpeed = 0.6
  controls.minDistance = 130
  controls.maxDistance = 700

  // 초기 시점: 한국이 잘 보이도록 동아시아 중심
  globe.pointOfView({ lat: 30, lng: 127, altitude: 2.2 })

  updateClock()
  clockTimer = setInterval(updateClock, 1000 * 30)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (clockTimer) clearInterval(clockTimer)
  if (globe && typeof globe._destructor === 'function') globe._destructor()
})

const statusEmoji = computed(() => selected.value?.icon ?? '🌍')
</script>

<template>
  <div class="globe-page">
    <!-- 3D 지구본 캔버스 -->
    <div ref="globeEl" class="globe-canvas"></div>

    <!-- 상단 오버레이 네비게이션 (링크만) -->
    <nav class="overlay top-nav">
      <div class="nav-links">
        <RouterLink to="/dashboard" class="nav-link">대시보드</RouterLink>
        <RouterLink to="/lessons" class="nav-link">실습 아카이브</RouterLink>
        <RouterLink to="/about" class="nav-link">소개</RouterLink>
      </div>
    </nav>

    <!-- 좌상단: 타이틀 -->
    <div class="overlay title-block">
      <h1 class="title">세계 날씨 지구본</h1>
      <p class="subtitle">드래그로 돌리고 스크롤로 확대하세요. 지구본의 아무 지점이나 클릭하면 그곳의 실시간 날씨가 열립니다.</p>
      <p class="source"><span class="dot"></span> OpenWeatherMap 실시간 관측 데이터</p>
    </div>

    <!-- 우상단: 시계 -->
    <div class="overlay clock-block">
      <div class="clock">{{ clock }}</div>
    </div>

    <!-- 대시보드 이동 -->
    <button class="overlay enter-btn" @click="router.push('/dashboard')">
      <strong>카드 대시보드로 보기 →</strong>
      <span>목록·검색으로 보기</span>
    </button>

    <!-- 선택된 지점 날씨 패널 -->
    <transition name="slide">
      <div v-if="selected || isLoading || errorMsg" class="overlay weather-panel">
        <div v-if="isLoading" class="panel-loading">불러오는 중…</div>

        <template v-else-if="selected">
          <div class="panel-top">
            <span class="panel-emoji">{{ statusEmoji }}</span>
            <div>
              <p class="panel-city">{{ selected.name || '이름 없는 지역' }}</p>
              <p class="panel-country">{{ selected.country }}</p>
            </div>
            <button class="panel-close" @click="selected = null">✕</button>
          </div>
          <div class="panel-temp">{{ displayTemp }}<span class="unit">{{ unitSymbol }}</span></div>
          <p class="panel-status">{{ selected.status }}</p>
          <div class="panel-meta">
            <span>💧 습도 {{ selected.humidity }}%</span>
            <span>🌬️ 풍속 {{ selected.wind }}m/s</span>
          </div>
          <button v-if="selected.id" class="panel-detail" @click="goDetail">상세보기 →</button>
        </template>

        <div v-else class="panel-error">
          {{ errorMsg }}
          <button class="panel-close-inline" @click="errorMsg = ''">닫기</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.globe-page {
  position: fixed;
  inset: 0;
  background: #05070d;
  overflow: hidden;
}
.globe-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: grab;
}
.globe-canvas:active {
  cursor: grabbing;
}
.overlay {
  position: absolute;
  z-index: 5;
  color: #fff;
}
.top-nav {
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 40px;
}
.nav-links {
  display: flex;
  gap: 22px;
}
.nav-link {
  color: #cbd5e1;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.15s;
}
.nav-link:hover {
  color: #fff;
}
.title-block {
  top: 104px;
  left: 40px;
  max-width: 440px;
}
.title {
  font-size: 34px;
  font-weight: 800;
  margin: 0 0 10px;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.7);
}
.subtitle {
  font-size: 14px;
  line-height: 1.6;
  color: #e2e8f0;
  margin: 0 0 12px;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6);
}
.source {
  font-size: 12px;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}
.source .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px #34d399;
}
.clock-block {
  top: 104px;
  right: 40px;
  text-align: right;
}
.clock {
  font-size: 40px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.7);
}
.enter-btn {
  left: 40px;
  bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 14px 20px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(8px);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
}
.enter-btn:hover {
  background: rgba(30, 41, 59, 0.75);
  transform: translateY(-2px);
}
.enter-btn strong {
  font-size: 14px;
}
.enter-btn span {
  font-size: 12px;
  color: #94a3b8;
}
.weather-panel {
  right: 40px;
  bottom: 40px;
  width: 260px;
  padding: 20px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(123, 184, 247, 0.35);
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}
.panel-loading,
.panel-error {
  font-size: 14px;
  color: #cbd5e1;
  text-align: center;
  padding: 8px 0;
}
.panel-error {
  color: #fca5a5;
}
.panel-close-inline {
  display: block;
  margin: 10px auto 0;
  padding: 6px 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: transparent;
  color: #cbd5e1;
  font-size: 12px;
  cursor: pointer;
}
.panel-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.panel-emoji {
  font-size: 40px;
  line-height: 1;
}
.panel-city {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}
.panel-country {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}
.panel-close {
  margin-left: auto;
  align-self: flex-start;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
}
.panel-close:hover {
  color: #fff;
}
.panel-temp {
  font-size: 52px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -2px;
  color: #ffd34d;
}
.panel-temp .unit {
  font-size: 22px;
  font-weight: 600;
  margin-left: 2px;
}
.panel-status {
  margin: 6px 0 12px;
  font-size: 15px;
  color: #e2e8f0;
}
.panel-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #cbd5e1;
  margin-bottom: 14px;
}
.panel-detail {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: #2f80ed;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.panel-detail:hover {
  background: #2568c4;
}
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
@media (max-width: 640px) {
  .title {
    font-size: 24px;
  }
  .title-block {
    left: 20px;
    right: 20px;
    max-width: none;
  }
  .clock {
    font-size: 28px;
  }
  .clock-block {
    right: 20px;
  }
  .enter-btn {
    left: 20px;
    bottom: 20px;
  }
  .weather-panel {
    right: 20px;
    left: 20px;
    bottom: 90px;
    width: auto;
  }
}
</style>

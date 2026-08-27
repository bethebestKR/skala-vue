<script setup>
// 과제 2: 날씨 (컴포지션 / Composition API)
import { ref, computed, watch, watchEffect } from 'vue'

// 1. 반응형 상태 관리
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', humidity: 45, icon: '☀️' },
  { id: 'city_02', name: '수원', temp: 24, status: '비', humidity: 82, icon: '🌧️' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', humidity: 65, icon: '☁️' },
  { id: 'city_04', name: '안양', temp: 22, status: '흐림', humidity: 70, icon: '🌫️' },
  { id: 'city_05', name: '성남', temp: 30, status: '맑음', humidity: 58, icon: '🌤️' },
])

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

// 한글 조합(IME) 처리
const isComposing = ref(false)
const onInput = (e) => {
  searchQuery.value = e.target.value
}
const onCompositionStart = () => {
  isComposing.value = true
}
const onCompositionEnd = (e) => {
  isComposing.value = false
  searchQuery.value = e.target.value
}

// 2. 검색 도시 (computed 활용)
const filteredWeatherList = computed(() =>
  weatherList.value.filter((w) => w.name.includes(searchQuery.value.trim()))
)

// 4. 검색 결과 표시 (Template 영역에서 사용)
//    - 검색어가 비었을 때는 원본 데이터를 출력
//    - 일치하는 데이터가 있을 때는 해당 데이터 출력
//    - 없으면 안내
const displayList = computed(() =>
  searchQuery.value.trim() === '' ? weatherList.value : filteredWeatherList.value
)

// 3-1. selectedCityInfo 감시 (watch): 상태바 문구가 바뀔 때마다 콘솔 로그
watch(selectedCityInfo, (newVal, oldVal) => {
  console.log(`[watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newVal}"`, { oldVal })
})

// 3-2. searchQuery 감시 (watchEffect): 타이핑할 때마다 변하는 searchQuery 추적
watchEffect(() => {
  console.log(
    `[watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다. (결과: ${filteredWeatherList.value.length}건)`
  )
})

// 5. 본인만의 반응형 상태 변수 / computed / watcher 추가
//    - 검색 횟수를 세는 상태 변수
const searchCount = ref(0)
//    - 25도 이상인 '더운 도시'의 개수를 계산하는 computed
const hotCityCount = computed(
  () => displayList.value.filter((w) => w.temp >= 25).length
)
//    - searchQuery가 실제로 채워질 때마다 검색 횟수를 올리는 watcher
watch(searchQuery, (newVal) => {
  console.log('onChange started')
  if (newVal.trim() !== '') {
    searchCount.value += 1
  }
  console.log('onChange completed')
})

// 5-2. 🥚 숨겨진 이스터에그
//    - 검색창에 특정 날씨 키워드를 입력하면 화면에 이모지가 쏟아진다.
const EASTER_EGGS = {
  무지개: '🌈',
  눈: '❄️',
  비: '💧',
  천둥: '⚡',
  벚꽃: '🌸',
}

// 상태: 현재 발동 중인 이스터에그 & 떨어지는 파티클 목록
const activeEgg = ref(null)
const particles = ref([])
const foundEggs = ref(new Set())

// computed: 아직 못 찾은 이스터에그가 있으면 살짝 힌트를 준다.
const eggHint = computed(() => {
  const total = Object.keys(EASTER_EGGS).length
  const found = foundEggs.value.size
  if (found === 0) return '🥚 검색창에 "무지개, 눈, 비, 천둥 ,벚꽃"을 입력해 보세요!'
  if (found < total) return `🥚 이스터에그 ${found} / ${total} 발견! 계속 찾아보세요.`
  return '🎉 숨겨진 이스터에그를 모두 찾았습니다!'
})

let eggTimer = null
const fireEasterEgg = (emoji) => {
  activeEgg.value = emoji
  // 랜덤 위치/속도의 파티클 24개 생성
  particles.value = Array.from({ length: 24 }, (_, i) => ({
    id: `${Date.now()}-${i}`,
    emoji,
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 1.8 + Math.random() * 1.4,
    size: 20 + Math.random() * 22,
  }))
  clearTimeout(eggTimer)
  eggTimer = setTimeout(() => {
    activeEgg.value = null
    particles.value = []
  }, 3200)
}

// watcher: 검색어에서 키워드를 감지하면 이스터에그 발동
watch(searchQuery, (newVal) => {
  const q = newVal.trim()
  for (const [keyword, emoji] of Object.entries(EASTER_EGGS)) {
    if (q.includes(keyword)) {
      console.log(`[이스터에그 감지] '${keyword}' 키워드 발견 → ${emoji} 효과 발동!`)
      foundEggs.value.add(keyword)
      fireEasterEgg(emoji)
      break
    }
  }
})

// 이벤트
const selectCity = (cityName) => {
  selectedCityInfo.value = `${cityName}이 선택되었습니다.`
}

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="wrap">
    <h2 class="title">🌦️ 과제 2: 날씨 (컴포지션)</h2>

    <!-- 도시 검색 -->
    <section class="panel">
      <h3 class="panel-title">🔍 도시 검색</h3>
      <input
        class="search"
        type="text"
        placeholder="검색할 도시 이름 입력"
        :value="searchQuery"
        @input="onInput"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
      />
      <p class="search-echo">
        검색 중인 도시: <strong>{{ searchQuery }}</strong>
        <span v-if="isComposing" class="composing">(입력 중…)</span>
      </p>
      <p class="search-echo">
        검색 횟수: <strong>{{ searchCount }}</strong> · 더운 도시:
        <strong>{{ hotCityCount }}</strong>곳
      </p>
      <p class="egg-hint">{{ eggHint }}</p>
    </section>

    <!-- 지역별 날씨 현황 -->
    <section class="panel">
      <h3 class="panel-title">🗺️ 지역별 날씨 현황</h3>

      <div
        v-for="weather in displayList"
        :key="weather.id"
        class="card"
        @click="selectCity(weather.name)"
      >
        <div class="card-info">
          <p class="card-name">{{ weather.icon }} {{ weather.name }} ({{ weather.status }})</p>
          <p class="card-temp">현재 기온: {{ weather.temp }}°C / 습도: {{ weather.humidity }}%</p>

          <span v-if="weather.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
          <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>
        </div>

        <button class="detail-btn" @click.stop="showDetail(weather.name, weather.status)">
          상세보기
        </button>
      </div>

      <p v-if="displayList.length === 0" class="empty">검색 결과가 일치하는 도시가 없습니다.</p>
    </section>

    <!-- 상태바 -->
    <footer class="status-bar">{{ selectedCityInfo }}</footer>

    <!-- 🥚 이스터에그 파티클 오버레이 -->
    <div v-if="activeEgg" class="egg-overlay" aria-hidden="true">
      <span
        v-for="p in particles"
        :key="p.id"
        class="egg-particle"
        :style="{
          left: p.left + '%',
          animationDelay: p.delay + 's',
          animationDuration: p.duration + 's',
          fontSize: p.size + 'px',
        }"
        >{{ p.emoji }}</span
      >
    </div>
  </div>
</template>

<style scoped>
.wrap {
  position: relative;
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
  font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  color: #1f2937;
}
.title {
  font-size: 22px;
  margin-bottom: 20px;
}
.panel {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fff;
}
.panel-title {
  font-size: 16px;
  margin: 0 0 12px;
}
.search {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
}
.search:focus {
  outline: 2px solid #60a5fa;
  outline-offset: 1px;
}
.search-echo {
  margin: 8px 0 0;
  font-size: 13px;
  color: #475569;
}
.composing {
  color: #94a3b8;
}
.egg-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #a855f7;
}

/* 🥚 이스터에그 파티클 */
.egg-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 50;
}
.egg-particle {
  position: absolute;
  top: -40px;
  animation-name: egg-fall;
  animation-timing-function: linear;
  animation-iteration-count: 1;
  will-change: transform, opacity;
}
@keyframes egg-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(105vh) rotate(360deg);
    opacity: 0.2;
  }
}
.card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.card:hover {
  background: #f8fafc;
  border-color: #93c5fd;
}
.card-name {
  margin: 0 0 4px;
  font-weight: 600;
  font-size: 15px;
}
.card-temp {
  margin: 0 0 8px;
  font-size: 13px;
  color: #475569;
}
.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}
.hot {
  background: #ef4444;
}
.cool {
  background: #3b82f6;
}
.detail-btn {
  flex-shrink: 0;
  padding: 6px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background: #f1f5f9;
  font-size: 13px;
  cursor: pointer;
}
.detail-btn:hover {
  background: #e2e8f0;
}
.empty {
  font-size: 13px;
  color: #94a3b8;
  text-align: center;
  padding: 12px 0;
}
.status-bar {
  padding: 12px;
  border-radius: 6px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #047857;
  font-size: 14px;
  text-align: center;
}
</style>

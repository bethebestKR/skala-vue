<script setup>
import { ref, computed } from 'vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', humidity: 45, icon: '☀️' },
  { id: 'city_02', name: '수원', temp: 24, status: '비', humidity: 82, icon: '🌧️' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', humidity: 65, icon: '☁️' },
  { id: 'city_04', name: '안양', temp: 22, status: '흐림', humidity: 70, icon: '🌫️' },
  { id: 'city_05', name: '성남', temp: 30, status: '맑음', humidity: 58, icon: '🌤️' },
])

// 3. 양방향 바인딩 (한글 처리를 위해 v-model 대신 :value + @input)
const keyword = ref('')
const isComposing = ref(false)

const onInput = (e) => {
  keyword.value = e.target.value
}
const onCompositionStart = () => {
  isComposing.value = true
}
const onCompositionEnd = (e) => {
  isComposing.value = false
  keyword.value = e.target.value
}

const filteredList = computed(() =>
  weatherList.value.filter((w) => w.name.includes(keyword.value.trim()))
)

// 4. 이벤트
const statusMessage = ref('카드를 클릭하거나 검색해 보세요.')

const selectCity = (cityName) => {
  statusMessage.value = `${cityName}이 선택되었습니다.`
}

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="wrap">
    <h2 class="title">🌤️ 과제 1: 날씨 (Mockup)</h2>

    <!-- 3. 도시 검색 -->
    <section class="panel">
      <h3 class="panel-title">🔍 도시 검색</h3>
      <input
        class="search"
        type="text"
        placeholder="검색할 도시 이름 입력"
        :value="keyword"
        @input="onInput"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
      />
      <p class="search-echo">
        검색 중인 도시: <strong>{{ keyword }}</strong>
        <span v-if="isComposing" class="composing">(입력 중…)</span>
      </p>
    </section>

    <!-- 1. 배열 렌더링 -->
    <section class="panel">
      <h3 class="panel-title">🗺️ 지역별 날씨 현황</h3>

      <div
        v-for="weather in filteredList"
        :key="weather.id"
        class="card"
        @click="selectCity(weather.name)"
      >
        <div class="card-info">
          <p class="card-name">{{ weather.icon }} {{ weather.name }} ({{ weather.status }})</p>
          <p class="card-temp">현재 기온: {{ weather.temp }}°C / 습도: {{ weather.humidity }}%</p>

          <!-- 2. 조건부 렌더링 -->
          <span v-if="weather.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
          <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>
        </div>

        <!-- 4. 버블링 없이 (.stop) -->
        <button class="detail-btn" @click.stop="showDetail(weather.name, weather.status)">
          상세보기
        </button>
      </div>

      <p v-if="filteredList.length === 0" class="empty">검색 결과가 없습니다.</p>
    </section>

    <!-- 상태바 -->
    <footer class="status-bar">{{ statusMessage }}</footer>
  </div>
</template>

<style scoped>
.wrap {
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
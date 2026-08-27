<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'
import { useCityStore } from '@/stores/cityStore'
import { DEFAULT_CITIES } from '../data/weatherData.js'
import { fetchWeatherByCity, fetchWeatherByCoords, geocodeCity } from '../api/openWeather.js'

const router = useRouter()

// 즐겨찾기 도시 스토어 (개수 표시용)
const cityStore = useCityStore()
const { favoriteCount } = storeToRefs(cityStore)

// --- 기본 대시보드(요구사항1): 기본 도시들의 실제 현재 날씨 ---
const defaultList = ref([])
const isLoadingDefault = ref(false)
const loadError = ref('')

async function loadDefaultCities() {
  isLoadingDefault.value = true
  loadError.value = ''
  try {
    // 여러 도시를 병렬 호출하고, 일부 실패해도 나머지는 표시 (allSettled)
    const results = await Promise.allSettled(DEFAULT_CITIES.map((c) => fetchWeatherByCity(c)))
    defaultList.value = results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
    if (defaultList.value.length === 0) {
      loadError.value = '날씨 데이터를 불러오지 못했습니다. API Key(.env)를 확인하세요.'
    }
  } catch {
    loadError.value = '날씨 데이터를 불러오지 못했습니다. API Key(.env)를 확인하세요.'
  } finally {
    isLoadingDefault.value = false
  }
}

onMounted(loadDefaultCities)

// --- 실시간 도시 검색(요구사항2: OpenWeatherMap Geocoding API 추가) ---
const keyword = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const searchError = ref('')

let debounceTimer = null
let requestSeq = 0 // 오래된(늦게 도착한) 응답이 최신 결과를 덮어쓰지 않도록 순번 관리

async function runSearch(query) {
  const seq = ++requestSeq
  isSearching.value = true
  searchError.value = ''
  try {
    // 1) Geocoding: 도시명 → 좌표 후보 목록
    const places = await geocodeCity(query, 5)
    if (seq !== requestSeq) return // 더 최신 검색이 시작됐으면 폐기
    if (places.length === 0) {
      searchResults.value = []
      searchError.value = `'${query}' 에 해당하는 도시를 찾지 못했습니다.`
      return
    }
    // 2) 각 좌표의 현재 날씨 조회 (병렬)
    const weathers = await Promise.allSettled(
      places.map((p) => fetchWeatherByCoords(p.lat, p.lon))
    )
    if (seq !== requestSeq) return
    searchResults.value = weathers
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value)
  } catch {
    if (seq !== requestSeq) return
    searchError.value = '검색 중 오류가 발생했습니다.'
  } finally {
    if (seq === requestSeq) isSearching.value = false
  }
}

// 검색어 입력을 500ms 디바운스해 API 호출 횟수를 줄인다
watch(keyword, (value) => {
  const q = value.trim()
  clearTimeout(debounceTimer)
  if (q.length < 2) {
    searchResults.value = []
    searchError.value = ''
    isSearching.value = false
    return
  }
  debounceTimer = setTimeout(() => runSearch(q), 500)
})

const onUpdateQuery = (value) => {
  keyword.value = value
}

// 검색어가 있으면 검색 결과를, 없으면 기본 대시보드를 보여준다
const isSearchMode = computed(() => keyword.value.trim().length >= 2)
const displayList = computed(() => (isSearchMode.value ? searchResults.value : defaultList.value))

const statusMessage = ref('카드를 클릭하거나 도시를 검색해 보세요.')
const selectCity = (cityName) => {
  statusMessage.value = `${cityName}이(가) 선택되었습니다.`
}

// 상세보기: OpenWeatherMap 도시 id 로 라우팅
const goDetail = (cityId) => {
  router.push('/weather/' + cityId)
}
</script>

<template>
  <div class="wrap">
    <!-- 도시 검색: 입력 시 OpenWeatherMap Geocoding API 로 실시간 조회 -->
    <BaseDashboardCard title="🔍 도시 검색 (실시간)">
      <SearchBar :keyword="keyword" @update-query="onUpdateQuery" />
      <p v-if="isSearching" class="hint">
        <el-icon class="is-loading"><Loading /></el-icon> 검색 중…
      </p>
      <el-alert
        v-else-if="searchError"
        :title="searchError"
        type="warning"
        show-icon
        :closable="false"
        class="mt-8"
      />
    </BaseDashboardCard>

    <!-- 날씨 현황: 검색 모드면 검색 결과, 아니면 기본 도시 대시보드 -->
    <BaseDashboardCard
      :title="`🗺️ ${isSearchMode ? '검색 결과' : '지역별 날씨 현황'} (⭐ 즐겨찾기 ${favoriteCount}개)`"
    >
      <!-- 최초 로딩: el-skeleton 으로 자리표시 -->
      <el-skeleton v-if="isLoadingDefault && !isSearchMode" :rows="4" animated />

      <el-alert
        v-else-if="loadError && !isSearchMode"
        :title="loadError"
        type="error"
        show-icon
        :closable="false"
      />

      <template v-else>
        <WeatherCard
          v-for="weather in displayList"
          :key="weather.id"
          :weather="weather"
          @select-card="selectCity"
          @click-detail="goDetail"
        />
        <el-empty
          v-if="!isSearching && displayList.length === 0 && !searchError"
          :description="isSearchMode ? '검색 결과가 없습니다.' : '표시할 도시가 없습니다.'"
        />
      </template>
    </BaseDashboardCard>

    <!-- 상태바 -->
    <el-alert :title="statusMessage" type="success" show-icon :closable="false" center />
  </div>
</template>

<style scoped>
.wrap {
  max-width: 1100px;
  margin: 0 auto;
}
.hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  margin: 8px 0 0;
}
.mt-8 {
  margin-top: 8px;
}
</style>

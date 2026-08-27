<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Back, Location, Sunny, Odometer, WindPower } from '@element-plus/icons-vue'
import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import { useConfigStore } from '@/stores/configStore'
import { useDisplayTemp } from '@/composables/useDisplayTemp'
import { fetchWeatherById } from '../api/openWeather.js'
import { fetchForecast } from '../api/openMeteo.js'

const route = useRoute()
const router = useRouter()

// 라우트 파라미터(도시 id)로 실제 날씨를 조회
const city = ref(null)
const forecast = ref([]) // [기타 외부 API] Open-Meteo 3일 예보
const isLoading = ref(false)
const error = ref('')

async function loadDetail(cityId) {
  isLoading.value = true
  error.value = ''
  city.value = null
  forecast.value = []
  try {
    // 1) OpenWeatherMap: 도시 id 로 현재 날씨 (좌표 lat/lon 포함)
    city.value = await fetchWeatherById(cityId)
    // 2) Open-Meteo: 그 좌표로 3일 예보 (실패해도 현재 날씨는 그대로 표시)
    if (city.value.lat != null && city.value.lon != null) {
      forecast.value = await fetchForecast(city.value.lat, city.value.lon, 3).catch(() => [])
    }
  } catch {
    error.value = '해당 도시의 날씨 정보를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 라우트가 바뀌어도 다시 로드되도록 watch (immediate 로 최초 실행)
watch(() => route.params.cityId, (id) => loadDetail(id), { immediate: true })

// 단위 설정에 맞게 변환된 온도
const { unitSymbol } = storeToRefs(useConfigStore())
const { displayTemp } = useDisplayTemp(() => city.value?.temp ?? 0)

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="wrap">
    <!-- [Element Plus] 브레드크럼으로 현재 위치 표시 -->
    <el-breadcrumb separator="/" class="crumb">
      <el-breadcrumb-item :to="{ path: '/' }">날씨 대시보드</el-breadcrumb-item>
      <el-breadcrumb-item>상세 정보</el-breadcrumb-item>
    </el-breadcrumb>

    <BaseDashboardCard title="📊 지역별 상세 기상 관측 정보">
      <!-- 로딩: el-skeleton -->
      <el-skeleton v-if="isLoading" :rows="5" animated />

      <div v-else-if="city" class="detail">
        <!-- 상단: 도시명 + 대표 온도(el-statistic) -->
        <el-row :gutter="16" align="middle" class="head-row">
          <el-col :xs="24" :sm="14">
            <p class="region">
              <el-icon><Location /></el-icon>
              지정 지역: <strong>{{ city.icon }} {{ city.region }}</strong>
            </p>
            <el-tag type="info" effect="plain" size="large">{{ city.status }}</el-tag>
          </el-col>
          <el-col :xs="24" :sm="10" class="stat-col">
            <el-statistic :value="displayTemp" :suffix="unitSymbol">
              <template #title>
                <span class="stat-title">실시간 기온</span>
              </template>
            </el-statistic>
          </el-col>
        </el-row>

        <el-divider />

        <!-- 상세 항목: el-descriptions -->
        <el-descriptions :column="1" border>
          <el-descriptions-item>
            <template #label><el-icon><Sunny /></el-icon> 기상 현황</template>
            {{ city.status }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label><el-icon><Odometer /></el-icon> 대기 습도</template>
            <el-progress :percentage="city.humidity" :stroke-width="14" style="max-width: 260px" />
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label><el-icon><WindPower /></el-icon> 현재 풍속</template>
            {{ city.wind }} m/s
          </el-descriptions-item>
        </el-descriptions>

        <!-- [기타 외부 API] Open-Meteo 3일 예보 -->
        <div v-if="forecast.length" class="forecast">
          <el-divider content-position="left">
            <span class="forecast-title">📅 3일 예보 (Open-Meteo)</span>
          </el-divider>
          <el-row :gutter="12">
            <el-col v-for="day in forecast" :key="day.date" :xs="24" :sm="8">
              <el-card class="forecast-day" shadow="hover" body-style="padding: 12px">
                <p class="fc-date">{{ day.date }} ({{ day.weekday }})</p>
                <p class="fc-icon">{{ day.icon }}</p>
                <p class="fc-desc">{{ day.desc }}</p>
                <p class="fc-temp">
                  <span class="fc-max">{{ day.max }}°</span> /
                  <span class="fc-min">{{ day.min }}°</span>
                </p>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>

      <el-alert
        v-else
        type="error"
        show-icon
        :closable="false"
        :title="error || `요청하신 도시 코드(${route.params.cityId})에 해당하는 데이터가 없습니다.`"
      />

      <el-button class="back-btn" type="primary" :icon="Back" @click="goHome">
        메인 대시보드로 돌아가기
      </el-button>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.wrap {
  max-width: 1100px;
  margin: 0 auto;
}
.crumb {
  margin-bottom: 12px;
}
.detail {
  padding: 4px 0 12px;
}
.head-row {
  row-gap: 12px;
}
.region {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 10px;
  font-size: 15px;
  color: #334155;
}
.stat-col {
  text-align: right;
}
.stat-title {
  font-size: 13px;
  color: #64748b;
}
.forecast {
  margin-top: 8px;
}
.forecast-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.forecast-day {
  text-align: center;
  margin-bottom: 12px;
}
.fc-date {
  margin: 0 0 6px;
  font-size: 12px;
  color: #64748b;
}
.fc-icon {
  margin: 0;
  font-size: 30px;
}
.fc-desc {
  margin: 2px 0 6px;
  font-size: 12px;
  color: #475569;
}
.fc-temp {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}
.fc-max {
  color: #ef4444;
}
.fc-min {
  color: #3b82f6;
}
.back-btn {
  margin-top: 16px;
}
</style>

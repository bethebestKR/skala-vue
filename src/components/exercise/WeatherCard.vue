<script setup>
import { toRef } from 'vue'
import { storeToRefs } from 'pinia'
import { StarFilled, Star } from '@element-plus/icons-vue'
import { useConfigStore } from '@/stores/configStore'
import { useCityStore } from '@/stores/cityStore'
import { useDisplayTemp } from '@/composables/useDisplayTemp'

// 선택된 도시 객체를 props로 전달받아 표시
const props = defineProps({
  weather: { type: Object, required: true },
})

// 카드를 선택하는 것(select-card)과 상세보기(click-detail)를 부모에게 전달
const emit = defineEmits(['select-card', 'click-detail'])

// 현재 단위 기호 + 단위 설정에 맞게 변환된 온도(Composable로 중복 제거)
const { unitSymbol } = storeToRefs(useConfigStore())
const { displayTemp } = useDisplayTemp(toRef(() => props.weather.temp))

// 즐겨찾기 도시 스토어
const cityStore = useCityStore()
const { isFavorite } = storeToRefs(cityStore)
</script>

<template>
  <!-- [Element Plus] el-card 로 각 도시 카드를 구성 -->
  <el-card class="card" shadow="hover" body-style="padding: 14px 18px" @click="emit('select-card', weather.name)">
    <div class="card-row">
      <div class="card-icon">{{ weather.icon }}</div>

      <div class="card-info">
        <p class="card-name">{{ weather.name }}</p>
        <p class="card-temp">{{ weather.status }} · 습도 {{ weather.humidity }}%</p>

        <!-- 조건부 렌더링: el-tag 로 더움/선선함 표시 -->
        <el-tag v-if="weather.temp >= 25" type="danger" effect="dark" size="small" round>
          🔥 더움 (25도 이상)
        </el-tag>
        <el-tag v-else type="primary" effect="dark" size="small" round>
          ❄️ 선선함 (25도 미만)
        </el-tag>
      </div>

      <div class="card-temp-big">{{ displayTemp }}<span class="unit">{{ unitSymbol }}</span></div>

      <div class="card-actions">
        <!-- 즐겨찾기 토글 (전역 cityStore) -->
        <el-button
          circle
          :type="isFavorite(weather.id) ? 'warning' : 'default'"
          @click.stop="cityStore.toggleFavorite(weather.id)"
        >
          <el-icon>
            <StarFilled v-if="isFavorite(weather.id)" />
            <Star v-else />
          </el-icon>
        </el-button>

        <!-- 버블링 없이 (.stop) / 상세 라우팅에 필요한 id를 전달 -->
        <el-button type="primary" plain @click.stop="emit('click-detail', weather.id)">
          상세보기
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.card {
  margin-bottom: 10px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.card:hover {
  transform: translateY(-2px);
}
.card-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.card-icon {
  font-size: 34px;
  line-height: 1;
  flex-shrink: 0;
}
.card-info {
  flex: 1;
  min-width: 0;
}
.card-name {
  margin: 0 0 4px;
  font-weight: 700;
  font-size: 16px;
}
.card-temp {
  margin: 0 0 8px;
  font-size: 13px;
  color: #64748b;
}
.card-temp-big {
  flex-shrink: 0;
  font-size: 30px;
  font-weight: 700;
  color: #2f80ed;
  letter-spacing: -1px;
}
.card-temp-big .unit {
  font-size: 16px;
  font-weight: 600;
  margin-left: 1px;
}
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
</style>
